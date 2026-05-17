import { Link } from "react-router-dom";
import { ArrowRight, Flame, Target, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0fdf4_0%,#f8fafc_34%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#06110b_0%,#09090b_34%,#0a0a0a_100%)] text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-lg text-black dark:text-white tracking-tight">Movathon</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col items-center text-center">
          {/* Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" /> The premier consistency tracker
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-black dark:text-white tracking-tight mb-8 leading-[1.1]">
              Master your habits.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-lime-500 dark:from-emerald-400 dark:to-lime-300">
                Prove your consistency.
              </span>
            </h1>

            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Movathon isn't just a habit tracker. It's an engine for building unbreakable discipline. Track your progress, visualize your streak, and share your public consistency grid.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg h-14 px-8 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                  {user ? "Open Dashboard" : "Start Tracking for Free"}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-zinc-50/50 dark:bg-zinc-950/50 border-y border-zinc-200 dark:border-zinc-800/50 relative transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">Built for people who get things done</h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">Everything you need to stay on track, wrapped in a beautiful, premium interface.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 transition-all hover:shadow-xl dark:hover:bg-zinc-900 dark:hover:border-zinc-700 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-6">
                  <Activity className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">Consistency Grid</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your daily actions paint a picture. Watch your heatmap light up as you build unbreakable streaks over weeks and months.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 transition-all hover:shadow-xl dark:hover:bg-zinc-900 dark:hover:border-zinc-700 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">Weekly Reviews</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Get personalized, data-driven insights every 7 days. Find out exactly where you're crushing it and where you need focus.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 transition-all hover:shadow-xl dark:hover:bg-zinc-900 dark:hover:border-zinc-700 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center mb-6">
                  <Flame className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">Public Profiles & Shareable Cards</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Turn your discipline into social proof. Generate Instagram-ready milestone cards and share your public handle with the world.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#06110b] transition-colors">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Logo className="w-6 h-6 rounded-md" />
          <span className="font-bold text-black dark:text-white text-lg">Movathon</span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-500 text-sm max-w-md mx-auto">
          The ultimate platform for building habits, achieving goals, and proving your consistency.
        </p>
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800/50 flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-600">
          <p>© {new Date().getFullYear()} Movathon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
