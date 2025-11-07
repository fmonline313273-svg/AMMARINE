import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msgLines = [
      `Name: ${formData.fullName}`,
      `Company: ${formData.companyName}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone}`,
      `Inquiry: ${formData.inquiryType}`,
      "",
      formData.message,
    ];
    const message = msgLines.join("\n");

    // Open WhatsApp chat in a new tab
    const whatsappNumber = "919724313273"; // country code + number
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Trigger email client with prefilled subject/body
    const mailTo = "ammrineautomation@gmail.com";
    const subject = `New Inquiry from ${formData.fullName} (${formData.inquiryType || "General"})`;
    const mailtoUrl = `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    // Use setTimeout to avoid some browsers blocking second navigation
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 300);

    toast({
      title: "Message prepared",
      description: "WhatsApp opened and email draft created.",
    });
    setFormData({
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      inquiryType: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Page Header */}
      <section className="py-12 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-primary-foreground/90">
            Get in touch with our technical experts
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Address</h3>
                        <p className="text-sm text-muted-foreground">
                          Plot no.2104/6,<br />
                          Shishuvihar to ibrahim masjid road,<br />
                          Old TIN factory,<br />
                          Bhavnagar - 364001<br />
                          Gujarat - INDIA
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Phone</h3>
                        <a
                          href="tel:+918866432914"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          +91 8866432914
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Email</h3>
                        <a
                          href="mailto:ammrineautomation@gmail.com"
                          className="text-sm text-muted-foreground hover:text-primary break-all"
                        >
                          ammrineautomation@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="font-semibold mb-2 text-foreground">Business Hours</h3>
                    <p className="text-sm text-muted-foreground">
                      Monday - Saturday: 9:00 AM - 6:00 PM<br />
                      Sunday: Closed
                    </p>
                    <p className="text-sm text-primary font-semibold mt-2">
                      24/7 Emergency Support Available
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          required
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your.email@company.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+91 XXXXXXXXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="inquiryType">Inquiry Type *</Label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        required
                        className="w-full mt-2 p-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Select inquiry type</option>
                        <option value="Sales & Quote Request">Sales & Quote Request</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Order Status Inquiry">Order Status Inquiry</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Tell us about your requirements..."
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
