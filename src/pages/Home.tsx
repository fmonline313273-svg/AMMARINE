import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, TrendingUp, Cog, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-automation.jpg";

const Home = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const recentProducts = useMemo(() => {
    const items = Array.isArray(allProducts) ? [...allProducts] : [];
    items.sort((a, b) => {
      const da = new Date(a?.createdAt || 0).getTime();
      const db = new Date(b?.createdAt || 0).getTime();
      return db - da;
    });
    return items.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      image: (Array.isArray(p.images) && p.images[0]) || p.image || "/placeholder.svg",
    }));
  }, [allProducts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern ship automation control room"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            A M MARINE & AUTOMATION <br />
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Supplier All Type of Marine & Industrial Automation, Electric, Electronics Equipment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/products/automation">Explore Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Our Product Lines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <Link to="/products/automation">
                <CardContent className="p-8 text-center">
                  <Cog className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    Marine & Industrial Automation
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    PLC, HMI, I/O Modules, Servo Drives, Soft Starters, Multi Function Relay, Safety Barriers
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    View Automation Products
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <Link to="/products/electronics">
                <CardContent className="p-8 text-center">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-accent" />
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    Electronics & Switch Gears
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    ACB, MCCB, Contactors, Overload Relays, All Types of Switch Gears
                  </p>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    View Electronics Products
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Propositions Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose AM Marine?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Technical Expertise</h3>
              <p className="text-muted-foreground">
                Deep understanding of marine and industrial automation systems with expert guidance for your projects
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">24/7 Support</h3>
              <p className="text-muted-foreground">
                Round-the-clock technical support and customer service for all your urgent requirements
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Reliable Supply</h3>
              <p className="text-muted-foreground">
                Consistent inventory and fast delivery of genuine products from trusted manufacturers
              </p>
            </div>
          </div>
        </div>
      </section>

      

      {/* Main Call-to-Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-foreground">
            Recently Added Products
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            The latest additions to our catalog
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {loading && (
              <div className="col-span-full text-center text-muted-foreground">Loading...</div>
            )}
            {error && (
              <div className="col-span-full text-center text-muted-foreground">{error}</div>
            )}
            {!loading && !error && recentProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] text-foreground">{product.name}</h3>
                  <Button asChild className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link to={`/product/${product.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
