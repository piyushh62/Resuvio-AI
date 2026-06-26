import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blog-posts";
import NotFound from "./NotFound";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <NotFound />;

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

  // Related posts: same category, different slug
  const relatedPosts = blogPosts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post.title;
    const shareUrls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    };
    if (shareUrls[platform]) window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
  };

  // Simple markdown-like renderer for bold text
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Handle bold text
      let rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
      // Handle list items
      if (rendered.startsWith("- ")) {
        return (
          <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: rendered.slice(2) }} />
        );
      }
      if (/^\d+\.\s/.test(rendered)) {
        return (
          <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: rendered.replace(/^\d+\.\s/, "") }} />
        );
      }
      if (rendered.trim() === "") return <br key={i} />;
      return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Back to Blog
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          {/* Article Header */}
          <header className="mb-8 sm:mb-10">
            <Badge variant="outline" className={`mb-3 sm:mb-4 border-0 ${categoryColors[post.category] || ""}`}>
              {post.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-5">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground pb-5 border-b border-border">
              <span className="flex items-center gap-1.5">
                <User size={14} /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {post.readTime}
              </span>
            </div>
          </header>

          {/* Article Body */}
          <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-4">
            {post.content.map((paragraph, idx) => (
              <div key={idx} className="space-y-2">
                {renderContent(paragraph)}
              </div>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="mt-10 sm:mt-12 pt-6 border-t border-border">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Share2 size={16} /> Share this article:
              </span>
              <button
                onClick={() => handleShare("linkedin")}
                className="px-3 py-1.5 rounded-full bg-[#0077B5] text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                LinkedIn
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                X (Twitter)
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                WhatsApp
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-8 sm:py-12 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/blog/${rp.slug}`}
                  className="group block rounded-lg border border-border bg-card p-4 hover:shadow-md transition-all"
                >
                  <Badge variant="outline" className={`text-[10px] border-0 mb-2 ${categoryColors[rp.category] || ""}`}>
                    {rp.category}
                  </Badge>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {rp.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">{rp.readTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-10 sm:py-14 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Ready to optimize your resume?</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-lg mx-auto">
            Apply the tips from this article using our AI-powered resume tools.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-11 px-8">
            <Link to="/dashboard/builder">Start Building</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
