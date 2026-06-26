import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Crown, ArrowUpRight } from "lucide-react";
import apiClient from "@/lib/api";

interface UsageItem {
  used: number;
  limit: number;
  label: string;
  remaining: number;
}

interface UsageData {
  plan: string;
  usage: Record<string, UsageItem>;
}

export default function UsageWidget() {
  const [data, setData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await apiClient.get("/api/credits/usage");
        setData(res.data);
      } catch {
        // Silently fail - widget just won't show
        console.log("[UsageWidget] Failed to load usage data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Activity size={16} className="text-blue-600" /> Monthly Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-2/3 mb-1.5"></div>
                <div className="h-2 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const planLabels: Record<string, { label: string; color: string }> = {
    seeker: { label: "Seeker (Free)", color: "bg-slate-100 text-slate-700" },
    hustler: { label: "Hustler", color: "bg-blue-100 text-blue-700" },
    closer: { label: "Closer", color: "bg-purple-100 text-purple-700" },
  };

  const planInfo = planLabels[data.plan] || planLabels.seeker;
  const isFreePlan = data.plan === "seeker";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Activity size={16} className="text-blue-600" /> Monthly Usage
          </CardTitle>
          <Badge className={`text-[10px] border-0 ${planInfo.color}`}>
            {data.plan === "closer" && <Crown size={10} className="mr-0.5" />}
            {planInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(data.usage).map(([key, item]) => {
          const percentage = item.limit >= 999 ? 0 : Math.min(100, (item.used / item.limit) * 100);
          const isUnlimited = item.limit >= 999;

          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-600">{item.label}</span>
                <span className="text-xs font-medium text-slate-800">
                  {item.used}
                  {isUnlimited ? "" : `/${item.limit}`}
                </span>
              </div>
              {isUnlimited ? (
                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: "15%" }}></div>
                </div>
              ) : (
                <Progress value={percentage} className="h-2" />
              )}
              {!isUnlimited && percentage >= 80 && (
                <p className="text-[10px] text-amber-600 mt-0.5">
                  {item.remaining} remaining
                </p>
              )}
            </div>
          );
        })}

        {/* Upgrade CTA for free plan */}
        {isFreePlan && (
          <div className="pt-3 border-t border-slate-100">
            <Button asChild variant="outline" size="sm" className="w-full rounded-full text-xs h-8">
              <Link to="/pricing" className="flex items-center justify-center gap-1">
                <ArrowUpRight size={12} /> Upgrade for More
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
