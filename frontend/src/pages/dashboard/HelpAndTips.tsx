import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, HelpCircle, PlayCircle, CircleDashed, AlertTriangle, ExternalLink } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface Tip {
  id: string;
  category: string;
  content: string;
}

type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

// Video tutorial data with actual YouTube content
const videoTutorials = [
  {
    id: 1,
    title: "How To Write A Resume in 2025",
    description: "Step-by-step guide to craft a professional resume that gets noticed by recruiters",
    embedId: "y8YH0Qbu5h4",
    thumbnail: "https://img.youtube.com/vi/y8YH0Qbu5h4/hqdefault.jpg"
  },
  {
    id: 2,
    title: "Resume Tips That Get You Noticed",
    description: "Learn expert tips to make your resume stand out from the competition",
    embedId: "Tt08KmFfIYQ",
    thumbnail: "https://img.youtube.com/vi/Tt08KmFfIYQ/hqdefault.jpg"
  },
  {
    id: 3,
    title: "ATS Resume Tips for 2025",
    description: "How to make your resume pass today's Applicant Tracking Systems (ATS)",
    embedId: "UtE0wZKBgMg",
    thumbnail: "https://img.youtube.com/vi/UtE0wZKBgMg/hqdefault.jpg"
  },
  {
    id: 4,
    title: "Resume Design & Formatting in 2025",
    description: "Modern resume formatting and design tips to make your resume visually appealing",
    embedId: "vgwo0j0KoyU",
    thumbnail: "https://img.youtube.com/vi/vgwo0j0KoyU/hqdefault.jpg"
  }
];

// YouTube embed component
const YouTubeEmbed = ({ embedId }: { embedId: string }) => {
  return (
    <div className="aspect-video w-full overflow-hidden rounded">
      <iframe
        src={`https://www.youtube.com/embed/${embedId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded youtube"
        className="w-full h-full border-0"
      />
    </div>
  );
};

export default function HelpAndTips() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchTips = async () => {
      setIsLoadingTips(true);
      setTipsError(null);
      try {
        const response = await apiClient.get('/api/tips');
        if (response.data && Array.isArray(response.data.tips)) {
          setTips(response.data.tips);
        } else {
          console.error("Unexpected tips API response format:", response.data);
          setTipsError("Failed to load tips due to unexpected format.");
        }
      } catch (error: unknown) {
        console.error("Error fetching tips:", error);
        const apiError = error as ApiErrorLike;
        const message = apiError.response?.data?.message || apiError.message || "An unknown error occurred while fetching tips.";
        setTipsError(message);
      } finally {
        setIsLoadingTips(false);
      }
    };

    fetchTips();
  }, []);

  const faqItems = [
    {
      question: "How do I know if my resume is ATS-friendly?",
      answer: "To make your resume ATS-friendly, use a clean layout without tables or graphics, include relevant keywords from the job description, and submit in PDF format to preserve formatting."
    },
    {
      question: "Should I include a photo on my resume?",
      answer: "In most cases, it's best to avoid including a photo on your resume, especially in the US, UK, and Canada, as it can lead to unconscious bias in the hiring process."
    },
    {
      question: "How far back should my work history go?",
      answer: "Generally, include the past 10-15 years of relevant work experience. For most professionals, this means listing 3-5 positions."
    },
    {
      question: "Do I need a cover letter?",
      answer: "While not always required, a well-written cover letter can set you apart. Use it to explain your interest in the role and company, and to address potential concerns like employment gaps."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent font-heading tracking-tight">Help & Tips</h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">Learn how to create an effective resume and improve your job search</p>
        </div>
      </div>

      <Tabs defaultValue="tips" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger value="tips" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg py-2.5 font-medium transition-all">Resume Tips</TabsTrigger>
          <TabsTrigger value="faqs" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg py-2.5 font-medium transition-all">FAQs</TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg py-2.5 font-medium transition-all">Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="mt-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-border/40 pb-5">
              <CardTitle className="text-xl font-heading text-foreground flex items-center">
                <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500 mr-3">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                Resume Writing Tips
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                General guidelines and best practices to create an effective resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTips ? (
                <div className="flex items-center justify-center py-12">
                  <CircleDashed className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-muted-foreground">Loading tips...</span>
                </div>
              ) : tipsError ? (
                <div className="flex flex-col items-center justify-center py-12 text-destructive">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p className="font-medium">Failed to load tips</p>
                  <p className="text-sm text-destructive">Error: {tipsError}</p>
                </div>
              ) : tips.length > 0 ? (
                <div className="space-y-5">
                  {tips.map((tip) => (
                    <div key={tip.id} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-background/50 hover:border-violet-500/30 transition-colors">
                      <div className="mt-0.5">
                        <CheckCircle2 className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-1 font-heading">{tip.category || 'General Tip'}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No tips available at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="mt-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-border/40 pb-5">
              <CardTitle className="text-xl font-heading text-foreground flex items-center">
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 mr-3">
                  <HelpCircle className="h-5 w-5" />
                </div>
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                Common questions about resume writing and job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="mt-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-border/40 pb-5">
              <CardTitle className="text-xl font-heading text-foreground flex items-center">
                <div className="p-1.5 rounded-md bg-pink-500/10 text-pink-500 mr-3">
                  <PlayCircle className="h-5 w-5" />
                </div>
                Video Tutorials
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                Watch these videos to learn more about effective resume writing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedVideo ? (
                <div className="space-y-4">
                  <YouTubeEmbed embedId={selectedVideo} />
                  <div className="flex justify-between mt-6">
                    <button 
                      onClick={() => setSelectedVideo(null)}
                      className="px-5 py-2.5 text-sm bg-secondary/50 hover:bg-secondary/80 border border-border/50 transition-colors rounded-xl flex items-center text-foreground font-medium"
                    >
                      ← Back to videos
                    </button>
                    <a 
                      href={`https://www.youtube.com/watch?v=${selectedVideo}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 text-sm bg-violet-500/10 text-violet-600 border border-violet-500/20 hover:bg-violet-500/20 transition-colors rounded-xl flex items-center font-medium"
                    >
                      Watch on YouTube <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videoTutorials.map((video) => (
                    <div 
                      key={video.id} 
                      className="border border-border/40 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/50 group"
                      onClick={() => setSelectedVideo(video.embedId)}
                    >
                      <div className="aspect-video bg-secondary/50 relative overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          alt={`Thumbnail for ${video.title}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                          <PlayCircle className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-md" />
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-foreground font-heading text-lg group-hover:text-violet-600 transition-colors">{video.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
