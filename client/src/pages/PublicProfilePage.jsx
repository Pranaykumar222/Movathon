import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Trophy, Sparkles, Activity, Share2, CalendarDays } from "lucide-react";
import Heatmap from "../components/Heatmap";
import { Button } from "@/components/ui/button";
import Logo from "../components/Logo";
import UserSearch from "../components/UserSearch";

const PublicProfilePage = () => {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPublicProfile(username)
      .then(res => setData(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-zinc-600" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Profile not found</h1>
        <p className="text-zinc-400 mb-6 max-w-md">The user "{username}" does not exist or has not tracked any habits yet.</p>
        <Link to="/">
          <Button className="bg-emerald-500 text-black hover:bg-emerald-400">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#06110b_0%,#09090b_34%,#0a0a0a_100%)] text-zinc-100">

      {/* Public Navbar */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold text-white tracking-tight">Movathon</span>
          </Link>
          <div className="flex items-center gap-3">
            <UserSearch className="hidden sm:flex" />
            <Link to="/register">
              <Button variant="ghost" className="hidden sm:inline-flex text-zinc-400 hover:text-white h-8">Join</Button>
            </Link>
            <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white gap-2" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Profile link copied to clipboard!");
            }}>
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* Profile Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-black p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center shrink-0 shadow-2xl shadow-emerald-500/20 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-900 flex items-center justify-center">
                <span className="text-5xl font-black text-black uppercase">{data.profile.username.substring(0, 2)}</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">@{data.profile.username}</h1>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-2.5 py-0.5">Consistent</Badge>
              </div>
              <p className="text-zinc-400 flex items-center justify-center md:justify-start gap-2">
                <CalendarDays className="w-4 h-4" /> Joined {new Date(data.profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6">
                <div>
                  <p className="text-2xl font-bold text-white">{data.streak.currentStreak}</p>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" /> Current Streak
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div>
                  <p className="text-2xl font-bold text-white">{data.streak.totalCompletedDays}</p>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" /> Active Days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consistency Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" /> Consistency Graph
            </h2>
            <span className="text-sm text-zinc-500">{data.heatmap.days.filter(d => d.percentage > 0).length} days logged</span>
          </div>

          <Card className="bg-[#0d1117] border-zinc-800 shadow-xl overflow-hidden">
            <CardContent className="pt-6 pb-6 overflow-x-auto custom-scrollbar">
              {data.heatmap.days.length === 0 ? (
                <div className="py-10 text-center text-zinc-500">No activity yet.</div>
              ) : (
                <div className="flex justify-center min-w-max">
                  <Heatmap days={data.heatmap.days} startDate={data.profile.joinedAt} />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 text-center mt-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <p className="text-zinc-500 text-sm">Powered by</p>
          <Logo className="w-5 h-5 rounded-md" />
          <span className="font-semibold text-zinc-300 text-sm">Movathon</span>
        </div>
        <p className="text-xs text-zinc-600 mt-2">Build your own consistency grid today.</p>
      </footer>
    </div>
  );
};

export default PublicProfilePage;
