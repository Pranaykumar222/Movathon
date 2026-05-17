import { useEffect, useState } from "react";
import { getWeeklyReview, getHeatmap } from "../api/dashboard";
import AppLayout from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, TrendingUp, AlertCircle, Sparkles, Flame, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import ShareModal from "../components/ShareModal";

const WeeklyReviewPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    Promise.all([getWeeklyReview(), getHeatmap()])
      .then(([reviewRes, heatmapRes]) => {
        setData(reviewRes.data.data);
        setHeatmapData(heatmapRes.data.data.days);
      })
      .catch(() => toast.error("Failed to load weekly review"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!data) return <AppLayout><p className="text-zinc-500 text-center mt-10">No data available.</p></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-10">
        
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-black p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-emerald-400 tracking-widest uppercase mb-2">Weekly Reflection</p>
              <h1 className="text-4xl font-bold text-white mb-2">Your Week in Review</h1>
              <p className="text-zinc-400 max-w-md">
                Look back at the last 7 days of consistency, {user?.username}. This is how you're building your future.
              </p>
              <Button 
                onClick={() => setShareOpen(true)}
                className="mt-6 bg-zinc-900/50 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm gap-2"
              >
                <Share2 className="w-4 h-4" /> Share Weekly Review
              </Button>
            </div>
            
            <div className="shrink-0 text-center">
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-zinc-950 border-2 border-zinc-800 mx-auto shadow-2xl shadow-emerald-500/20">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="60" fill="none" className="stroke-zinc-800" strokeWidth="6" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="60" 
                    fill="none" 
                    className="stroke-emerald-400 transition-all duration-1000 ease-out" 
                    strokeWidth="6" 
                    strokeDasharray={377} 
                    strokeDashoffset={377 - (377 * ((data.averageScore || 0) / 100))}
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{data.averageScore || 0}%</span>
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Consistency</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Days Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Daily Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {data.dailyPerformance.map((day, i) => {
              const dateObj = new Date(day.date);
              const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
              const isBest = data.bestDay?.date === day.date;
              
              return (
                <div key={i} className={`relative flex flex-col items-center p-4 rounded-2xl border ${isBest ? "bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "bg-zinc-900/50 border-zinc-800/60"}`}>
                  {isBest && <div className="absolute -top-2.5 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">Best Day</div>}
                  <span className="text-sm font-medium text-zinc-400 mb-1">{dayName}</span>
                  <span className="text-2xl font-bold text-white mb-3">{day.score !== null ? `${day.score}%` : "-"}</span>
                  <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${day.score || 0}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-2 font-medium">{day.completed}/{day.scheduled} Done</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" /> Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topSkipped.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-zinc-300 font-medium">Perfect execution!</p>
                  <p className="text-zinc-500 text-sm mt-1">You didn't completely skip any scheduled habits this week.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topSkipped.map((habit, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: habit.color }} />
                        <span className="text-sm font-medium text-zinc-200">{habit.title}</span>
                      </div>
                      <Badge variant="outline" className="text-amber-400 border-amber-400/20 bg-amber-400/10">Skipped {habit.skippedCount}x</Badge>
                    </div>
                  ))}
                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Don't break the chain next week. Start small if you have to.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" /> Weekly Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Consistency Score</p>
                  <p className="text-xs text-zinc-400 mt-0.5">You achieved a {data.averageScore || 0}% average completion rate across all your scheduled habits this week.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Peak Performance</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {data.bestDay 
                      ? `Your strongest day was ${new Date(data.bestDay.date).toLocaleDateString("en-US", { weekday: "long" })} with ${data.bestDay.score}% completion.` 
                      : "You haven't tracked any habits this week."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ShareModal 
        open={shareOpen} 
        onOpenChange={setShareOpen}
        username={user?.username}
        streak={0}
        consistency={data?.averageScore || 0}
        type="weekly"
        heatmapData={heatmapData}
        startDate={user?.createdAt}
      />
    </AppLayout>
  );
};

export default WeeklyReviewPage;
