import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogPosts, blogCategories } from "@/data/blog-posts";
import { BookOpen, Clock, ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") return blogPosts;
    return blogPosts.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const featuredPosts = blogPosts.filter((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured || selectedCategory !== "All");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  };

  const categoryColors: Record<string, string> = {
    "Resume Tips": "bg-secondary text-foreground",
    "Interview Prep": "bg-secondary text-foreground",
    "Career Growth": "bg-secondary text-foreground",
    "AI & Technology": "bg-secondary text-foreground",
    "Job Search": "bg-secondary text-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <BookOpen size={14} className="mr-1.5" /> Insights & Tips
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4 font-heading">
            Career <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Expert advice on resumes, interviews, and career growth to help you land your dream job.
          </p>
        </motion.div>
      </section>

      {/* Featured Posts */}
      {selectedCategory === "All" && featuredPosts.length > 0 && (
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {featuredPosts.map((post, idx) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 bg-card/60 backdrop-blur-md h-full"
                  >
                    {/* Colored header bar */}
                    <div className="h-1.5 bg-gradient-to-r from-violet-500 to-blue-500"></div>
                    <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={`text-[10px] sm:text-xs border-0 ${categoryColors[post.category] || ""}`}>
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} /> {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(post.date)}
                      </span>
                      <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read more <ArrowRight size={12} />
                      </span>
                    </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter + All Posts */}
      <section className="py-6 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {selectedCategory === "All" ? "All Articles" : selectedCategory}
            </h2>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {(selectedCategory === "All" ? regularPosts : filteredPosts).map((post, idx) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-border/40 overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 bg-card/60 backdrop-blur-sm h-full"
                >
                  <div className="h-1 bg-gradient-to-r from-primary/40 to-blue-500/40 group-hover:from-primary group-hover:to-blue-500 transition-colors"></div>
                  <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-[10px] border-0 ${categoryColors[post.category] || ""}`}>
                      {post.category}
                    </Badge>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No articles yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for more content in this category</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 -z-10" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 sm:px-6 text-center max-w-3xl"
        >
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground font-heading">Ready to apply what you've learned?</h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">
            Put these tips into practice with our AI-powered resume tools.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full h-14 px-10 text-base font-semibold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:shadow-xl hover:shadow-primary/25 text-white transition-all duration-300 hover:scale-[1.02]"
          >
            <Link to="/dashboard/builder">Start Building Your Resume</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
