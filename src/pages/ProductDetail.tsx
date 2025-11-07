import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

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

      {/* Main Product Content */}
      <section className="py-12 flex-grow">
        <div className="container mx-auto px-4">
          {loading && <p className="text-muted-foreground">Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !product && !error && (
            <p className="text-muted-foreground">Product not found.</p>
          )}
          {!loading && product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left Column - Images */}
            <div>
              <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                <img
                  src={images[selectedIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
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
              <h1 className="text-4xl font-bold mb-4 text-foreground">{product.name}</h1>
              <div className="space-y-2 mb-6">
                <p className="text-lg">
                  <span className="text-muted-foreground">Part Number:</span>{" "}
                  <span className="font-semibold text-foreground">{product.partNumber || '-'}</span>
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-foreground">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description || 'No description available.'}</p>
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
