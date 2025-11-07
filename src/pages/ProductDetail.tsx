import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/products", { cache: "no-store" });
        const data = await res.json();
        const list = Array.isArray(data.products) ? data.products : [];
        const found = list.find((p: any) => p.id === id);
        if (!ignore) setProduct(found || null);
      } catch (e) {
        if (!ignore) setError("Failed to load product");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true };
  }, [id]);

  const images: string[] = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (product.image) return [product.image];
    return ["/placeholder.svg"];
  }, [product]);

  useEffect(() => {
    // Reset selected image when product or images change
    setSelectedIndex(0);
  }, [product]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setSelectedIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setSelectedIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, images.length]);

  const openLightboxAt = (idx: number) => {
    setSelectedIndex(idx);
    setLightboxOpen(true);
  };

  useEffect(() => {
    // detect admin
    try {
      const token = localStorage.getItem("adminToken");
      setIsAdmin(!!token);
    } catch {}
  }, []);

  const handleRemoveImage = async (idx: number) => {
    if (!product || !id) return;
    const keep = images.filter((_, i) => i !== idx);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('id', id);
      fd.append('keepImages', JSON.stringify(keep));
      const res = await fetch('/api/admin/products', { method: 'PUT', body: fd });
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
      }
    } finally {
      setSaving(false);
    }
  };

  const categoryFromId = useMemo(() => {
    if (!id) return "automation";
    const prefix = id.split("-")[0]?.toLowerCase();
    return prefix === "electronic" ? "electronics" : "automation";
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <section className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to={`/products/${categoryFromId}`} className="hover:text-primary">Products</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to={`/products/${categoryFromId}`} className="hover:text-primary">{categoryFromId === 'electronics' ? 'Electronics' : 'Automation'}</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground">{product?.name || ''}</span>
          </div>
        </div>
      </section>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="text-white/80 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              aria-label="Close"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          <button
            type="button"
            className="absolute left-3 md:left-6 text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i - 1 + images.length) % images.length); }}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <img
            src={images[selectedIndex]}
            alt={product?.name || 'Product image'}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            className="absolute right-3 md:right-6 text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i + 1) % images.length); }}
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {images.length > 0 ? `${selectedIndex + 1} / ${images.length}` : ''}
          </div>
        </div>
      )}

      {/* Main Product Content */}
      <section className="py-12 flex-grow">
        <div className="container mx-auto px-4">
          {loading && <p className="text-muted-foreground">Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !product && !error && (
            <p className="text-muted-foreground">Product not found.</p>
          )}
          {!loading && product && (
          <div className="grid grid-cols-2 gap-12 mb-12">
            {/* Left Column - Images */}
            <div>
              <button
                type="button"
                className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                onClick={() => openLightboxAt(selectedIndex)}
                aria-label="Open image in fullscreen"
              >
                <img
                  src={images[selectedIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img: string, idx: number) => (
                  <div key={idx} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full aspect-square rounded-lg overflow-hidden cursor-pointer border ${
                        selectedIndex === idx ? 'ring-2 ring-primary' : 'hover:ring-2 ring-primary/50'
                      }`}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`${product?.name || 'Product'} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      className="absolute inset-0"
                      onClick={() => openLightboxAt(idx)}
                      aria-label="Open fullscreen"
                      title="Open fullscreen"
                    />
                    {isAdmin && (
                      <button
                        type="button"
                        className="absolute top-1 right-1 text-[11px] px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                        disabled={saving}
                        aria-label="Remove image"
                        title="Remove image"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Product Info */}
           <div>
  {/* Product Name */}
  <h1 className="text-4xl font-bold mb-4 text-foreground">
    {product?.name || "Unnamed Product"}
  </h1>
  <h2 className="text-xl font-bold mb-3 text-foreground">Part Number :</h2>
  <p className="text-muted-foreground">{product?.partNumber || 'No part number available.'}</p>

  <div className="mb-8"> <h2 className="text-xl font-bold mb-3 text-foreground">Product Description :</h2> <p className="text-muted-foreground leading-relaxed">{product.description || 'No description available.'}</p> 
 </div>
              <div className="space-y-4">
                <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to="/contact">Request a Quote for this Product</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link to="/contact">Contact Technical Support</Link>
                </Button>
              </div>
            </div>
          </div>
          )}

          {/* Technical Specifications Section */}
          {product?.specifications && product.specifications.length > 0 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Technical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product?.specifications?.map((spec: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between py-3 border-b border-border last:border-0"
                    >
                      <span className="font-semibold text-foreground">{spec.name}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
