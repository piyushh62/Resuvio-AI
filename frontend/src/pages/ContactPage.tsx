import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call later)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Message sent successfully! We'll get back to you within 24-48 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/10 to-transparent blur-3xl" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 sm:px-6 text-center relative z-10"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs sm:text-sm font-medium mb-6">
            <Mail size={14} className="mr-1.5" /> We'd love to hear from you
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4 font-heading">
            Get in <span className="gradient-text">touch</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a question, suggestion, or need help? Fill out the form below and our team will get back to you within 24-48 hours.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Contact Info Cards */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4 sm:space-y-6"
            >
              <Card className="border-border/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-card/60 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                      <Mail size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Email Us</CardTitle>
                      <CardDescription>For general inquiries</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <a
                    href="mailto:support@aicareerforge.com"
                    className="text-sm sm:text-base text-foreground hover:text-muted-foreground font-medium"
                  >
                    support@aicareerforge.com
                  </a>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-card/60 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Location</CardTitle>
                      <CardDescription>Where we're based</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground">India (Remote-first)</p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-card/60 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                      <Clock size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Response Time</CardTitle>
                      <CardDescription>When to expect a reply</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground">24-48 hours on business days</p>
                </CardContent>
              </Card>

              {/* Quick FAQ Links */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Quick Help</CardTitle>
                  <CardDescription>Common questions answered instantly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href="/dashboard/help" className="block text-sm text-foreground hover:text-muted-foreground hover:underline">
                    → How do I analyze my resume?
                  </a>
                  <a href="/dashboard/help" className="block text-sm text-foreground hover:text-muted-foreground hover:underline">
                    → Can I download my resume as PDF?
                  </a>
                  <a href="/dashboard/help" className="block text-sm text-foreground hover:text-muted-foreground hover:underline">
                    → How does the AI matching work?
                  </a>
                  <a href="/pricing" className="block text-sm text-foreground hover:text-muted-foreground hover:underline">
                    → What plans are available?
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="border-border/40 shadow-xl bg-card/60 backdrop-blur-xl h-full relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form and we'll respond as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <CheckCircle size={32} className="text-foreground" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                      <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                        Thank you for reaching out. We'll get back to you within 24-48 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="h-10 sm:h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-10 sm:h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="What's this about?"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your question or feedback..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="min-h-[120px]"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-primary/25 text-white h-11 px-8 transition-all duration-300 hover:scale-[1.02]"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="mr-2 animate-spin">⏳</span> Sending...
                          </>
                        ) : (
                          <>
                            <Send size={16} className="mr-2" /> Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
