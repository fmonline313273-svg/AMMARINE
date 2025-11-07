"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, Upload, Trash2, Plus } from "lucide-react"

interface Product {
  id: string
  category: string
  name: string
  description: string
  image?: string // backward compat
  images?: string[]
  link: string
  partNumber?: string
  condition?: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("automation")
  
  // Form state
  const [formData, setFormData] = useState({
    category: "automation",
    name: "",
    description: "",
    partNumber: "",
    condition: "Used",
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Management controls
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc'>("date-desc")
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ name: string; description: string; partNumber: string; images: string[] }>({ name: "", description: "", partNumber: "", images: [] })
  const [newEditFiles, setNewEditFiles] = useState<File[]>([])
  const [newEditPreviews, setNewEditPreviews] = useState<string[]>([])

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken")
    if (!token) {
      navigate("/admin")
      return
    }
    
    fetchProducts()
  }, [navigate])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    navigate("/admin")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImageFiles(files)
    if (files.length) {
      Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
        )
      ).then((previews) => setImagePreviews(previews))
    } else {
      setImagePreviews([])
    }
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= imageFiles.length) return
    const files = [...imageFiles]
    const previews = [...imagePreviews]
    ;[files[index], files[newIndex]] = [files[newIndex], files[index]]
    ;[previews[index], previews[newIndex]] = [previews[newIndex], previews[index]]
    setImageFiles(files)
    setImagePreviews(previews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("category", formData.category)
      formDataToSend.append("name", formData.name)
      formDataToSend.append("partNumber", formData.partNumber)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("link", getCategoryLink(formData.category))
      formDataToSend.append("condition", formData.condition)
      imageFiles.forEach((file) => formDataToSend.append("images", file))

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product added successfully!' })
        setFormData({ category: "automation", name: "", description: "", partNumber: "", condition: "Used" })
        setImageFiles([])
        setImagePreviews([])
        fetchProducts()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add product' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add product' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product deleted successfully!' })
        fetchProducts()
      } else {
        setMessage({ type: 'error', text: 'Failed to delete product' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete product' })
    }
  }

  const categories = [
    { value: "automation", label: "Automation", link: "/products/automation" },
    { value: "electronic", label: "Electronic", link: "/products/electronic" },
  ]

  // Get link based on category
  const getCategoryLink = (category: string) => {
    return categories.find(c => c.value === category)?.link || ""
  }

  const tabProducts = useMemo(() => products.filter(p => p.category === activeTab), [products, activeTab])
  const managedProducts = useMemo(() => {
    const s = searchTerm.toLowerCase()
    let list = tabProducts.filter(p => {
      return (
        p.name.toLowerCase().includes(s) ||
        (p.partNumber || "").toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s)
      )
    })
    list = list.slice().sort((a: any, b: any) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
      const da = new Date(a.createdAt || 0).getTime()
      const db = new Date(b.createdAt || 0).getTime()
      return sortBy === 'date-asc' ? da - db : db - da
    })
    return list
  }, [tabProducts, searchTerm, sortBy])
  const totalPages = Math.max(1, Math.ceil(managedProducts.length / pageSize))
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    return managedProducts.slice(start, start + pageSize)
  }, [managedProducts, page])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Product Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partNumber">Part Number</Label>
                    <Input
                      id="partNumber"
                      value={formData.partNumber}
                      onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                      placeholder="Enter part number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Used">Used</SelectItem>
                        <SelectItem value="New In Box">New In Box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>

                

                <div className="space-y-2">
                  <Label htmlFor="image">Product Images (optional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  {imagePreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative w-full h-28 rounded-md overflow-hidden border flex flex-col">
                          <div className="flex-1">
                            <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex divide-x border-t">
                            <button type="button" className="flex-1 text-xs py-1 hover:bg-muted" onClick={() => moveImage(idx, 'up')}>Up</button>
                            <button type="button" className="flex-1 text-xs py-1 hover:bg-muted" onClick={() => moveImage(idx, 'down')}>Down</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={isSubmitting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Adding..." : "Add Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Manage Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
                <TabsList className="grid grid-cols-2 mb-6">
                  {categories.map((cat) => (
                    <TabsTrigger key={cat.value} value={cat.value}>
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((cat) => (
                  <TabsContent key={cat.value} value={cat.value}>
                    <div className="space-y-4">
                      {/* Controls */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <Input
                            placeholder="Search by name, part number, description..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Sort</Label>
                          <select
                            className="p-2 border rounded-md bg-background"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                          >
                            <option value="date-desc">Newest</option>
                            <option value="date-asc">Oldest</option>
                            <option value="name-asc">Name A→Z</option>
                          </select>
                        </div>
                      </div>

                      {managedProducts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No products in this category yet.
                        </p>
                      ) : (
                        pagedProducts.map((product) => (
                          <Card key={product.id}>
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                                  <img
                                    src={(product.images && product.images[0]) || product.image || ""}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-1">{product.name}</h3>
                                  {product.partNumber && (
                                    <p className="text-xs text-muted-foreground mb-1">Part No: {product.partNumber}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {product.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Link: {product.link}
                                  </p>
                                  {product.condition && (
                                    <p className="text-xs text-muted-foreground">Condition: {product.condition}</p>
                                  )}

                                  {editingId === product.id ? (
                                    <div className="mt-3 space-y-2">
                                      <Input
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        placeholder="Product name"
                                      />
                                      <Input
                                        value={editData.partNumber}
                                        onChange={(e) => setEditData({ ...editData, partNumber: e.target.value })}
                                        placeholder="Part number"
                                      />
                                      {/* Simple condition edit dropdown */}
                                      <div className="flex items-center gap-2">
                                        <Label className="text-sm">Condition</Label>
                                        <select
                                          className="p-2 border rounded-md bg-background"
                                          value={(editData as any).condition || product.condition || 'Used'}
                                          onChange={(e) => setEditData({ ...(editData as any), condition: e.target.value } as any)}
                                        >
                                          <option value="Used">Used</option>
                                          <option value="New In Box">New In Box</option>
                                        </select>
                                      </div>
                                      <Textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        placeholder="Description"
                                        rows={3}
                                      />
                                      {Array.isArray(editData.images) && editData.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                          {editData.images.map((url, idx) => (
                                            <div key={idx} className="relative w-full h-28 rounded-md overflow-hidden border flex flex-col">
                                              <div className="flex-1">
                                                <img src={url} alt="preview" className="w-full h-full object-cover" />
                                              </div>
                                              <div className="flex divide-x border-t">
                                                <button type="button" className="flex-1 text-xs py-1 hover:bg-muted" onClick={() => {
                                                  if (idx === 0) return; const imgs = [...editData.images]; [imgs[idx-1], imgs[idx]] = [imgs[idx], imgs[idx-1]]; setEditData({ ...editData, images: imgs })
                                                }}>Up</button>
                                                <button type="button" className="flex-1 text-xs py-1 hover:bg-muted" onClick={() => {
                                                  if (idx === editData.images.length-1) return; const imgs = [...editData.images]; [imgs[idx+1], imgs[idx]] = [imgs[idx], imgs[idx+1]]; setEditData({ ...editData, images: imgs })
                                                }}>Down</button>
                                                <button type="button" className="flex-1 text-xs py-1 text-red-600 hover:bg-red-50" onClick={() => {
                                                  const imgs = editData.images.filter((_, i) => i !== idx); setEditData({ ...editData, images: imgs })
                                                }}>Remove</button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {/* Add new images while editing */}
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-new-images-${product.id}`}>Add Images</Label>
                                        <Input
                                          id={`edit-new-images-${product.id}`}
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          onChange={(e) => {
                                            const files = Array.from(e.target.files || [])
                                            setNewEditFiles(files)
                                            if (files.length) {
                                              Promise.all(
                                                files.map(
                                                  (file) =>
                                                    new Promise<string>((resolve) => {
                                                      const reader = new FileReader()
                                                      reader.onloadend = () => resolve(reader.result as string)
                                                      reader.readAsDataURL(file)
                                                    })
                                                )
                                              ).then((previews) => setNewEditPreviews(previews))
                                            } else {
                                              setNewEditPreviews([])
                                            }
                                          }}
                                        />
                                        {newEditPreviews.length > 0 && (
                                          <div className="grid grid-cols-3 gap-2">
                                            {newEditPreviews.map((src, idx) => (
                                              <div key={idx} className="relative w-full h-28 rounded-md overflow-hidden border flex flex-col">
                                                <div className="flex-1">
                                                  <img src={src} alt={`New ${idx+1}`} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex divide-x border-t">
                                                  <button type="button" className="flex-1 text-xs py-1 text-red-600 hover:bg-red-50" onClick={() => {
                                                    const files = [...newEditFiles]; files.splice(idx,1); setNewEditFiles(files)
                                                    const prevs = [...newEditPreviews]; prevs.splice(idx,1); setNewEditPreviews(prevs)
                                                  }}>Remove</button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={async () => {
                                          const n = (editData.name || '').trim();
                                          const p = (editData.partNumber || '').trim();
                                          const d = (editData.description || '').trim();
                                          if (!n || !p || !d) {
                                            setMessage({ type: 'error', text: 'Please fill name, part number, and description before saving.' });
                                            return;
                                          }
                                          const hasNew = newEditFiles.length > 0
                                          if (hasNew) {
                                            const fd = new FormData()
                                            fd.append('id', product.id)
                                            fd.append('name', n)
                                            fd.append('partNumber', p)
                                            fd.append('description', d)
                                            fd.append('keepImages', JSON.stringify(editData.images))
                                            newEditFiles.forEach(f => fd.append('newImages', f))
                                            const res = await fetch('/api/admin/products', { method: 'PUT', body: fd })
                                            if (res.ok) {
                                              setMessage({ type: 'success', text: 'Product updated' })
                                              setEditingId(null)
                                              setNewEditFiles([]); setNewEditPreviews([])
                                              fetchProducts()
                                            } else {
                                              setMessage({ type: 'error', text: 'Failed to update product' })
                                            }
                                          } else {
                                            const res = await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, name: n, partNumber: p, description: d, images: editData.images, condition: (editData as any).condition || product.condition }) })
                                            if (res.ok) {
                                              setMessage({ type: 'success', text: 'Product updated' })
                                              setEditingId(null)
                                              fetchProducts()
                                            } else {
                                              setMessage({ type: 'error', text: 'Failed to update product' })
                                            }
                                          }
                                        }}>Save</Button>
                                        <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setNewEditFiles([]); setNewEditPreviews([]) }}>Cancel</Button>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                                <div className="flex flex-col gap-2">
                                  {editingId === product.id ? null : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingId(product.id)
                                        setEditData({ name: product.name, description: product.description, partNumber: product.partNumber || "", images: Array.isArray(product.images) ? product.images : ((product.image && [product.image]) || []) })
                                      }}
                                    >
                                      Edit
                                    </Button>
                                  )}
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(product.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}

                      {/* Pagination */}
                      {managedProducts.length > pageSize && (
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
