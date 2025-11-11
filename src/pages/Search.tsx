import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(!!initialQ);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/products", { cache: "no-store" });
        const data = await res.json();
        if (!ignore) setAllProducts(Array.isArray(data.products) ? data.products : []);
      } catch (e) {
        if (!ignore) setError("Failed to load products");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true };
  }, []);

  const results = useMemo(() => {
    const q = (submitted ? query : initialQ).trim().toLowerCase();
    if (!q) return [];
    const fields = [
      "name",
      "partNumber",
      "manufacturer",
      "subcategory",
      "description",
      "category",
      "id",
    ];
    return allProducts.filter((p: any) =>
      fields.some((f) => String(p?.[f] || "").toLowerCase().includes(q))
    ).map((p: any) => ({
      id: p.id,
      name: p.name,
      partNumber: p.partNumber || "",
      image: (Array.isArray(p.images) && p.images[0]) || p.image || "/placeholder.svg",
      category: (p.category || "").toLowerCase(),
    }));
  }, [allProducts, query, submitted, initialQ]);

  const onSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitted(true);
    const q = query.trim();
    if (q) setParams({ q });
    else setParams({});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <form onSubmit={onSubmit} className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Input
                placeholder="Search products... (name, part number, manufacturer)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10"
              />
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="py-10 flex-grow">
        <div className="container mx-auto px-4">
          {loading && <p className="text-muted-foreground">Loading products...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (submitted || initialQ) && (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {results.length ? `Found ${results.length} product${results.length > 1 ? "s" : ""}` : "No products found"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-foreground">{product.name}</h3>
                      {product.partNumber && (
                        <p className="text-sm text-muted-foreground mb-4">Part #: {product.partNumber}</p>
                      )}
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link to={`/product/${product.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Search;
