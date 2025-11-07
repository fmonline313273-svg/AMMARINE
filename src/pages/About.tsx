import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Target, History } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            About AM Marine & Automation
          </h1>
          <p className="text-xl text-center text-primary-foreground/90 max-w-3xl mx-auto">
            Your trusted B2B partner for marine and industrial automation Equipment
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Target className="h-12 w-12 text-primary mr-4" />
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              At AM Marine & Automation, our mission is to provide comprehensive, reliable, and high-quality automation and electrical solutions to the marine and industrial sectors. We strive to be the trusted partner for engineers, procurement teams, and technical buyers who demand excellence in every component.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We are committed to delivering not just products, but complete solutions backed by technical expertise, responsive support, and a deep understanding of our customers' operational challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Our History Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <History className="h-12 w-12 text-accent mr-4" />
              <h2 className="text-3xl font-bold text-foreground">Our History</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Founded with a vision to bridge the gap between cutting-edge automation technology and the marine industry, AM Marine & Automation has grown to become a reliable supplier of automation and electrical equipment.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Based in Bhavnagar, Gujarat, we serve customers across India and beyond, providing access to world-class products from leading manufacturers including Siemens, ABB, Schneider Electric, and many others.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our extensive product portfolio includes PLCs, HMIs, I/O Modules, Servo Drives, ACBs, MCCBs, Contactors, and a complete range of switch gears and automation components.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Users className="h-12 w-12 text-primary mr-4" />
              <h2 className="text-3xl font-bold text-foreground">Our Team</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Our team comprises experienced professionals with deep technical knowledge in automation systems, electrical engineering, and marine applications. We understand the critical nature of marine and industrial operations, and we bring that understanding to every customer interaction.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Whether you need help selecting the right PLC for your automation project, guidance on switchgear specifications, or emergency support for a critical component, our team is ready to assist with technical expertise and practical solutions.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We pride ourselves on building long-term relationships with our customers, based on trust, reliability, and consistent delivery of quality products and services.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-cta text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-3">Quality First</h3>
              <p className="text-primary-foreground/80">
                We supply only genuine products from trusted manufacturers
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-3">Technical Excellence</h3>
              <p className="text-primary-foreground/80">
                Deep expertise in automation and electrical systems
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-3">Customer Focus</h3>
              <p className="text-primary-foreground/80">
                Your success is our priority, with 24/7 support available
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
