import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, TrendingUp, Cog, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-automation.jpg";

const Home = () => {
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
            <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/contact">Request Quote</Link>
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

      {/* Trusted By Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            Trusted Manufacturers & Partners
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            We supply genuine products from world-leading manufacturers including Siemens, ABB, Schneider Electric, and more
          </p>
        </div>
      </section>

      {/* Main Call-to-Action */}
      <section className="py-20 bg-gradient-cta text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Explore our comprehensive catalog or speak with our technical experts today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/products/automation">Explore Full Catalog</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/contact">Contact Our Experts</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
