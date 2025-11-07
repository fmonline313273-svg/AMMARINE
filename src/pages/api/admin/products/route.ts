import { NextRequest, NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'

const PRODUCTS_BLOB_KEY = 'data/products.json'

// Read products JSON from Vercel Blob
async function readProducts(): Promise<{ products: any[] }> {
  const { blobs } = await list({ prefix: PRODUCTS_BLOB_KEY, limit: 1 })
  if (!blobs.length) {
    return { products: [] }
  }
  const res = await fetch(blobs[0].url, { cache: 'no-store' })
  if (!res.ok) {
    return { products: [] }
  }
  return res.json()
}

// PUT - Edit existing product (update metadata and optionally images order)
export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    const data = await readProducts()

    // Helper to find product by id
    const findIndex = (id: string) => data.products.findIndex((p: any) => p.id === id)

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const id = form.get('id') as string
      if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
      const idx = findIndex(id)
      if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

      const prod = { ...data.products[idx] }
      const name = form.get('name') as string | null
      const description = form.get('description') as string | null
      const partNumber = form.get('partNumber') as string | null
      const category = form.get('category') as string | null
      const link = form.get('link') as string | null
      const condition = form.get('condition') as string | null
      const keepImagesRaw = (form.get('keepImages') as string | null) || '[]'
      let keepImages: string[] = []
      try { keepImages = JSON.parse(keepImagesRaw) } catch {}
      const newFiles = (form.getAll('newImages') as File[]).filter(Boolean)

      if (typeof name === 'string') prod.name = name
      if (typeof description === 'string') prod.description = description
      if (typeof partNumber === 'string') prod.partNumber = partNumber
      if (typeof category === 'string') prod.category = category
      if (typeof link === 'string') prod.link = link
      if (typeof condition === 'string') (prod as any).condition = condition

      // Upload new files
      const timestamp = Date.now()
      const uploadedUrls: string[] = []
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
        const filename = `${timestamp}-edit-${i}-${file.name.replace(/\s+/g, '-')}`
        const { url } = await put(`products/${filename}`, file, { access: 'public', contentType: file.type })
        uploadedUrls.push(url)
    }

      // Compute deletions: existing - keepImages
      const existingUrls: string[] = Array.isArray(prod.images) ? prod.images.filter((u: any) => typeof u === 'string') : (typeof prod.image === 'string' ? [prod.image] : [])
      const toDelete = existingUrls.filter((u) => !keepImages.includes(u))
      for (const url of toDelete) {
        if (url.includes('vercel-storage.com')) {
          try { await del(url) } catch (err) { console.error('Error deleting blob image:', err) }
        }
      }

      // New images array
      const finalImages = [...keepImages, ...uploadedUrls]
      prod.images = finalImages
      prod.image = finalImages[0] || undefined

      data.products[idx] = prod
      await writeProducts(data)
      return NextResponse.json({ success: true, product: prod })
    }

    // JSON body fallback (no file uploads)
    const body = await request.json()
    const { id, name, description, partNumber, category, link, images, condition } = body || {}
    if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    const idx = findIndex(id)
    if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    const prod = { ...data.products[idx] }
    if (typeof name === 'string') prod.name = name
    if (typeof description === 'string') prod.description = description
    if (typeof partNumber === 'string') prod.partNumber = partNumber
    if (typeof category === 'string') prod.category = category
    if (typeof link === 'string') prod.link = link
    if (Array.isArray(images)) { prod.images = images; prod.image = images[0] || undefined }
    data.products[idx] = prod
    await writeProducts(data)
    return NextResponse.json({ success: true, product: prod })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// Write products JSON to Vercel Blob
async function writeProducts(data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  await put(PRODUCTS_BLOB_KEY, blob, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

// GET - Fetch all products
export async function GET() {
  try {
    const data = await readProducts()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading products:', error)
    return NextResponse.json({ products: [] })
  }
}

// POST - Add new product (supports optional multiple images)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const category = formData.get('category') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const link = formData.get('link') as string
    const partNumber = (formData.get('partNumber') as string) || ''
    const condition = (formData.get('condition') as string) || ''
    // Multiple images can be sent under the key "images"
    const imageFiles = (formData.getAll('images') as File[]).filter(Boolean)

    if (!category || !name || !description || !link) {
      return NextResponse.json(
        { error: 'Required fields: category, name, description, link' },
        { status: 400 }
      )
    }

    // Upload images to Vercel Blob (if any)
    const timestamp = Date.now()
    const uploadedUrls: string[] = []
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const filename = `${timestamp}-${i}-${file.name.replace(/\s+/g, '-')}`
      const { url } = await put(`products/${filename}`, file, {
        access: 'public',
        contentType: file.type,
      })
      uploadedUrls.push(url)
    }

    // Add product to database
    const data = await readProducts()
    const newProduct = {
      id: `${category}-${timestamp}`,
      category,
      name,
      description,
      link,
      partNumber,
      condition,
      images: uploadedUrls,
      // Backward compatibility: keep single image field as the first image if available
      image: uploadedUrls[0] || undefined,
      createdAt: new Date().toISOString(),
    }

    data.products.push(newProduct)
    await writeProducts(data)

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product added successfully',
    })
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    )
  }
}

// DELETE - Remove product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const data = await readProducts()
    const productIndex = data.products.findIndex((p: any) => p.id === id)

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = data.products[productIndex]

    // Delete all images from Vercel Blob if their URLs are blob URLs
    try {
      const urls: string[] = []
      if (typeof product.image === 'string') urls.push(product.image)
      if (Array.isArray(product.images)) urls.push(...product.images.filter((u: any) => typeof u === 'string'))
      for (const url of urls) {
        if (url.includes('vercel-storage.com')) {
          try {
            await del(url)
          } catch (err) {
            console.error('Error deleting blob image:', err)
          }
        }
      }
    } catch (err) {
      console.error('Error during blob deletions:', err)
    }

    // Remove product from database
    data.products.splice(productIndex, 1)
    await writeProducts(data)

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
