export const config = { runtime: 'nodejs' };

import { put, del, list } from '@vercel/blob';
import Busboy from 'busboy';

const PRODUCTS_BLOB_KEY = 'data/products.json';

// Memory fallback for local
type ProductsData = { products: any[] };
const MEM_KEY = '__MEM_PRODUCTS__';
function getMem(): ProductsData {
  const g = globalThis as any;
  if (!g[MEM_KEY]) g[MEM_KEY] = { products: [] } as ProductsData;
  return g[MEM_KEY] as ProductsData;
}

async function readProducts(): Promise<{ products: any[] }> {
  try {
    const { blobs } = await list({ prefix: PRODUCTS_BLOB_KEY, limit: 1 });
    if (!blobs.length) return { products: [] };
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) return { products: [] };
    return res.json();
  } catch {
    return getMem();
  }
}

async function writeProducts(data: any) {
  try {
    const payload = Buffer.from(JSON.stringify(data, null, 2));
    await put(PRODUCTS_BLOB_KEY, payload, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch {
    const mem = getMem();
    mem.products = Array.isArray(data?.products) ? [...data.products] : [];
  }
}

// ✅ UPDATED: handle multiple file uploads
function parseMultipart(req: any): Promise<{ fields: Record<string, string>; files: { buffer: Buffer; filename: string; mimetype: string }[] }> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });
    const fields: Record<string, string> = {};
    const files: { buffer: Buffer; filename: string; mimetype: string }[] = [];

    bb.on('file', (_name, file, info) => {
      const { filename, mimeType } = info;
      const chunks: Buffer[] = [];
      file.on('data', (d: Buffer) => chunks.push(d));
      file.on('end', () => {
        files.push({ buffer: Buffer.concat(chunks), filename, mimetype: mimeType });
      });
    });

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('error', reject);
    bb.on('finish', () => resolve({ fields, files }));
    req.pipe(bb);
  });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const data = await readProducts();
      return res.json(data);
    }

    if (req.method === 'POST') {
      const { fields, files } = await parseMultipart(req);
      const category = fields['category'];
      const name = fields['name'];
      const description = fields['description'];
      const link = fields['link'];

      if (!category || !name || !description || !link || !files?.length) {
        return res.status(400).json({ error: 'All fields and at least one image are required' });
      }

      const timestamp = Date.now();
      const imageUrls: string[] = [];

      // Upload all images
      for (const file of files) {
        try {
          const filename = `${timestamp}-${(file.filename || 'upload').replace(/\s+/g, '-')}`;
          const result = await put(`products/${filename}`, file.buffer, {
            access: 'public',
            contentType: file.mimetype || 'application/octet-stream',
          });
          imageUrls.push(result.url);
        } catch {
          const base64 = file.buffer.toString('base64');
          imageUrls.push(`data:${file.mimetype || 'application/octet-stream'};base64,${base64}`);
        }
      }

      const data = await readProducts();
      const newProduct = {
        id: `${category}-${timestamp}`,
        category,
        name,
        description,
        link,
        images: imageUrls, // ✅ array instead of single image
        createdAt: new Date().toISOString(),
      };

      data.products.push(newProduct);
      await writeProducts(data);

      return res.json({ success: true, product: newProduct, message: 'Product added successfully' });
    }

    if (req.method === 'DELETE') {
      const id = (req.query && (req.query.id as string)) || (new URL(req.url, 'http://localhost').searchParams.get('id'));
      if (!id) return res.status(400).json({ error: 'Product ID is required' });

      const data = await readProducts();
      const index = data.products.findIndex((p: any) => p.id === id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });

      const product = data.products[index];
      try {
        // delete all images for that product
        const imagesToDelete = product.images || [product.image];
        for (const img of imagesToDelete) {
          if (typeof img === 'string' && img.includes('vercel-storage.com')) {
            await del(img);
          }
        }
      } catch {}

      data.products.splice(index, 1);
      await writeProducts(data);

      return res.json({ success: true, message: 'Product deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: (error as any).message });
  }
}
