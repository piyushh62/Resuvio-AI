import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Gift, Copy, Check, Users, CreditCard, Share2, Link2, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ReferralPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate a referral link based on user ID (placeholder - will be backed by API later)
  const referralCode = user?.uid?.slice(0, 8).toUpperCase() || "DEMO1234";
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  const handleShare = (platform: string) => {
    const text = `Join me on Resuvio-AI! Use my link to get bonus credits: ${referralLink}`;
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Just optimized my resume with Resuvio-AI! 🚀")}&url=${encodeURIComponent(referralLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=${encodeURIComponent("Join Resuvio-AI")}&body=${encodeURIComponent(text)}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  // Placeholder stats (will come from API)
  const stats = {
    totalReferrals: 0,
    successfulSignups: 0,
    creditsEarned: 0,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-6 w-6 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Refer & Earn</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Share Resuvio-AI with friends and earn credits for every signup. Give 2, Get 2!
        </p>
      </div>

      {/* Referral Link Card */}
      <Card className="border border-border/40 bg-secondary/30 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-foreground">
            <Link2 size={20} className="text-primary" /> Your Referral Link
          </CardTitle>
          <CardDescription>Share this link with friends. They get 2 bonus credits on signup, and you get 2 credits when they make their first purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-background/50 border border-border/50 rounded-xl px-3 sm:px-4 py-2.5 text-sm sm:text-base font-mono text-foreground overflow-hidden text-ellipsis whitespace-nowrap shadow-inner">
              {referralLink}
            </div>
            <Button
              onClick={handleCopy}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-md text-white shrink-0 h-11 transition-all"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-1.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-1.5" /> Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
              <Share2 size={14} /> Share via:
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleShare("whatsapp")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#25D366] text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity">
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button onClick={() => handleShare("twitter")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity">
                X (Twitter)
              </button>
              <button onClick={() => handleShare("linkedin")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0077B5] text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity">
                LinkedIn
              </button>
              <button onClick={() => handleShare("email")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary text-foreground text-xs sm:text-sm font-medium hover:bg-secondary/80 transition-colors">
                <Mail size={14} /> Email
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-5 sm:pt-6 text-center">
            <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-violet-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground font-heading">{stats.totalReferrals}</div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-5 sm:pt-6 text-center">
            <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-violet-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground font-heading">{stats.successfulSignups}</div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">Successful Signups</p>
          </CardContent>
        </Card>
        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-5 sm:pt-6 text-center">
            <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="h-6 w-6 text-violet-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground font-heading">{stats.creditsEarned}</div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">Credits Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-foreground font-heading">How It Works</CardTitle>
          <CardDescription>Earn credits in 3 simple steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <span className="text-lg font-bold text-violet-600">1</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">Share Your Link</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Copy and share your unique referral link with friends, family, or on social media.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <span className="text-lg font-bold text-violet-600">2</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">Friend Signs Up</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">When your friend signs up using your link, they instantly get 2 bonus credits.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <span className="text-lg font-bold text-violet-600">3</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">You Earn Credits</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">When your friend makes their first purchase, you earn 2 credits too. It's a win-win!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="border border-border/40 bg-secondary/20 backdrop-blur-sm">
        <CardContent className="pt-5 sm:pt-6">
          <h3 className="font-semibold text-sm text-foreground mb-2">Referral Program Terms</h3>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Referral credits are non-transferable and cannot be exchanged for cash.</li>
            <li>Credits expire 12 months after being earned if unused.</li>
            <li>Self-referrals (creating multiple accounts) are not permitted.</li>
            <li>We reserve the right to modify or discontinue the referral program at any time.</li>
            <li>For questions about your referral credits, contact support@aicareerforge.com.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
