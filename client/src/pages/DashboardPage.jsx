import { useCallback, useEffect, useState } from "react";
import { getHeatmap, getSummary } from "../api/dashboard";
import { getHabits } from "../api/habits";
import { markEntry } from "../api/entries";
import AppLayout from "../layouts/AppLayout";
import Heatmap from "../components/Heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarCheck, Check, Flame, Pencil, Sparkles, Target, Trophy, TrendingDown, TrendingUp, X, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import ShareModal from "../components/ShareModal";
import OnboardingTutorial from "../components/OnboardingTutorial";

const DashboardPage = () => {
  const { user } = useAuth();
  const [heatmapData, setHeatmapData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [habits, setHabits] = useState([]);
  const [todayEntries, setTodayEntries] = useState({});
  const [editingHabit, setEditingHabit] = useState(null);
  const [entryForm, setEntryForm] = useState({ done: false, value: "", note: "" });
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [today] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchAll = useCallback(async () => {
    try {
      const [heatmapRes, summaryRes, habitsRes] = await Promise.all([
        getHeatmap(),
        getSummary(),
        getHabits(),
      ]);

      const habitsData = habitsRes.data.data.habits;
      setHeatmapData(heatmapRes.data.data.days);
      setSummary(summaryRes.data.data);
      setHabits(habitsData);
      setTodayEntries(buildTodayEntryMap(habitsData, today));
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    Promise.resolve().then(fetchAll);
  }, [fetchAll]);

  const saveEntry = async (habit, data) => {
    const value = data.value === "" || data.value === null ? null : Number(data.value);
    const percentage = calculateCompletion(habit, { ...data, value });
    const payload = {
      habitId: habit.id,
      date: today,
      completed: percentage > 0,
      completionPercentage: percentage,
      value,
      note: data.note || "",
    };

    setTodayEntries((prev) => ({
      ...prev,
      [habit.id]: {
        ...(prev[habit.id] || {}),
        ...payload,
      },
    }));

    try {
      await markEntry(payload);
      const [heatmapRes, summaryRes] = await Promise.all([getHeatmap(), getSummary()]);
      setHeatmapData(heatmapRes.data.data.days);
      setSummary(summaryRes.data.data);
    } catch {
      toast.error("Failed to update habit");
      fetchAll();
    }
  };

  const handleYesNo = (habit, done) => {
    const current = todayEntries[habit.id] || {};
    saveEntry(habit, {
      done,
      value: null,
      note: current.note || "",
    });
  };

  const openEntryDialog = (habit) => {
    const entry = todayEntries[habit.id] || {};
    setEditingHabit(habit);
    setEntryForm({
      done: (entry.completionPercentage ?? 0) >= 100,
      value: entry.value ?? "",
      note: entry.note ?? "",
    });
  };

  const handleEntrySave = async () => {
    await saveEntry(editingHabit, entryForm);
    setEditingHabit(null);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const todaySummary = summary?.today || { completionScore: 0, completedHabits: 0, totalHabits: 0 };
  const streak = summary?.streak || { currentStreak: 0, longestStreak: 0, totalCompletedDays: 0 };

  const todayDayOfWeek = new Date().getDay();
  const todayHabits = habits.filter(h => h.frequency ? h.frequency.includes(todayDayOfWeek) : true);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* TOP ROW: STREAKS & DAYS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} label="Current streak" value={`${streak.currentStreak} days`} />
          <StatCard icon={<Trophy className="w-5 h-5 text-yellow-400" />} label="Best streak" value={`${streak.longestStreak} days`} />
          <StatCard icon={<CalendarCheck className="w-5 h-5 text-emerald-400" />} label="Active days" value={`${streak.totalCompletedDays}`} />
        </div>

        {/* MAIN SPLIT LAYOUT */}
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">

          {/* LEFT COLUMN: TASKS / HABITS */}
          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl border-zinc-200 dark:border-zinc-800/60 shadow-xl overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-900" />
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-black dark:text-white text-lg font-semibold flex items-center justify-between">
                  <span>Today's Log</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">{todaySummary.completedHabits}/{todaySummary.totalHabits} Done</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayHabits.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3 transition-colors">
                      <Target className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-3">No habits scheduled for today.</p>
                    <a href="/habits" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">Create or schedule a habit &rarr;</a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayHabits.map((habit) => {
                      const entry = todayEntries[habit.id] || {};
                      const percentage = entry.completionPercentage ?? 0;
                      return (
                        <div key={habit.id} className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700/60">
                          <div className="flex items-start justify-between gap-4">

                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm" style={{ backgroundColor: habit.color, boxShadow: `0 0 10px ${habit.color}60` }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{habit.title}</p>
                                  {habit.goal && <Badge className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20 h-5 px-1.5 text-[10px]" variant="outline">{habit.goal.title}</Badge>}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">{formatHabitMeta(habit, entry)}</p>

                                <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-950 overflow-hidden mt-3 shadow-inner">
                                  <div className={`h-full transition-all duration-500 ${percentage >= 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : percentage >= 50 ? "bg-amber-500" : "bg-zinc-400 dark:bg-zinc-600"}`} style={{ width: `${percentage}%` }} />
                                </div>
                                {entry.note && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 border-l-2 border-zinc-300 dark:border-zinc-700 pl-2 italic">{entry.note}</p>}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex shrink-0 items-center gap-2">
                              {habit.type === "YES_NO" ? (
                                <>
                                  {percentage >= 100 && (
                                    <button onClick={() => handleYesNo(habit, false)} title="Undo" className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button onClick={() => handleYesNo(habit, true)} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${percentage >= 100 ? "bg-emerald-500 text-white dark:text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white hover:scale-105"}`}>
                                    <Check className={`w-5 h-5 ${percentage >= 100 ? "stroke-[3]" : ""}`} />
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder={habit.unit || "val"}
                                    value={entry.value ?? ""}
                                    onChange={(e) => setTodayEntries((prev) => ({
                                      ...prev,
                                      [habit.id]: { ...(prev[habit.id] || {}), value: e.target.value },
                                    }))}
                                    className="w-16 h-8 bg-transparent border-0 text-black dark:text-white text-center px-1 focus:ring-0 focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => saveEntry(habit, { value: todayEntries[habit.id]?.value ?? "", note: entry.note ?? "" })}
                                    className={`h-8 px-3 rounded-md transition-all ${percentage >= 100 ? "bg-emerald-500 text-white dark:text-zinc-950" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"}`}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}

                              <Button variant="ghost" size="icon" onClick={() => openEntryDialog(habit)} className="w-8 h-8 rounded-full text-zinc-600 hover:text-white hover:bg-zinc-800 ml-1">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PerformanceCard title="Best habits" icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} items={summary?.bestHabits || []} />
              <PerformanceCard title="Needs attention" icon={<TrendingDown className="w-4 h-4 text-amber-400" />} items={summary?.weakHabits || []} />
            </div>

            <Card className="bg-white/80 dark:bg-zinc-950/60 backdrop-blur-md border-zinc-200 dark:border-zinc-800/60 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-black dark:text-white text-base font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Long-term goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.goals?.length ? (
                  <div className="space-y-3">
                    {summary.goals.map((goal) => (
                      <div key={goal.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/30 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-colors">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium truncate">{goal.title}</p>
                          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{goal.progress}%</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-950 overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400" style={{ width: `${goal.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm py-2">
                    No goals tracked. <a href="/goals" className="text-emerald-400 hover:underline">Create a goal</a>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: HERO & HEATMAP */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Good Morning Hero */}
            <section className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-[linear-gradient(145deg,#0a1510_0%,#111915_100%)] p-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <ScoreRing value={todaySummary.completionScore} />
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Good {getGreeting()}, {user?.username}
                  </h1>
                  <p className="text-zinc-300 dark:text-zinc-400 mt-2 text-sm max-w-sm mx-auto mb-4">
                    Log the real work. Movathon turns it into your daily consistency score.
                  </p>
                  <Button
                    onClick={() => setShareOpen(true)}
                    className="bg-black/50 dark:bg-zinc-900/50 hover:bg-black/70 dark:hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share Progress
                  </Button>
                </div>
              </div>
            </section>

            {/* Consistency Grid */}
            <Card className="bg-white dark:bg-[#0d1117] border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors">
              <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-[#161b22]/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-black dark:text-white text-base font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Consistency grid
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6 overflow-x-auto custom-scrollbar">
                {heatmapData.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-zinc-500 text-sm">No activity yet. Log a habit to paint the grid.</p>
                  </div>
                ) : (
                  <div className="flex justify-center min-w-max">
                    <Heatmap days={heatmapData} startDate={user?.createdAt} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      <Dialog open={Boolean(editingHabit)} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingHabit?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editingHabit?.type === "YES_NO" ? (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setEntryForm({ ...entryForm, done: true })} className={entryForm.done ? "bg-lime-400 text-zinc-950 hover:bg-lime-300" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}>
                  Done
                </Button>
                <Button onClick={() => setEntryForm({ ...entryForm, done: false })} variant="ghost" className={!entryForm.done ? "bg-zinc-800 text-zinc-300" : "text-zinc-500 hover:text-white"}>
                  Not done
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Today’s actual {editingHabit?.unit ? `(${editingHabit.unit})` : ""}</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder={editingHabit?.target ? `Target ${editingHabit.target}` : "Actual value"}
                  value={entryForm.value}
                  onChange={(e) => setEntryForm({ ...entryForm, value: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-lime-400"
                />
                <p className="text-xs text-zinc-500">
                  Movathon will score this as {calculateCompletion(editingHabit, entryForm)}% for today.
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Daily note</Label>
              <textarea
                rows={3}
                placeholder="Small context for future you"
                value={entryForm.note}
                onChange={(e) => setEntryForm({ ...entryForm, note: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingHabit(null)} className="text-zinc-400 hover:text-white">Cancel</Button>
            <Button onClick={handleEntrySave} className="bg-lime-400 text-zinc-950 hover:bg-lime-300">Save log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        username={user?.username}
        streak={streak?.currentStreak || 0}
        consistency={todaySummary?.completionScore || 0}
        type="profile"
        heatmapData={heatmapData}
        startDate={user?.createdAt}
      />
      <OnboardingTutorial />
    </AppLayout>
  );
};

const buildTodayEntryMap = (habits, today) => {
  const todayMap = {};
  habits.forEach((habit) => {
    const todayEntry = habit.entries?.find((entry) => entry.date === today);
    if (todayEntry) todayMap[habit.id] = todayEntry;
  });
  return todayMap;
};

const calculateCompletion = (habit, data) => {
  if (!habit) return 0;
  if (habit.type === "YES_NO") return data.done ? 100 : 0;

  const value = Number(data.value || 0);
  const target = Number(habit.target || 0);
  if (!target || Number.isNaN(value)) return value > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round((value / target) * 100)));
};

const ScoreRing = ({ value }) => (
  <div
    className="w-24 h-24 rounded-full grid place-items-center shrink-0"
    style={{ background: `conic-gradient(#10b981 ${value * 3.6}deg, rgba(0,0,0,0.2) 0deg)` }}
  >
    <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-[linear-gradient(145deg,#0a1510_0%,#111915_100%)] grid place-items-center border border-zinc-800/50">
      <span className="text-2xl font-bold text-white">{value}%</span>
    </div>
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 transition-colors">
    <CardContent className="pt-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-black dark:text-white">{value}</p>
    </CardContent>
  </Card>
);

const PerformanceCard = ({ title, icon, items }) => (
  <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 transition-colors">
    <CardHeader className="pb-2">
      <CardTitle className="text-black dark:text-white text-base font-medium flex items-center gap-2">{icon}{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-zinc-500 text-sm py-3">Track habits for a few days to see this.</p>
      ) : (
        <div className="space-y-2">
          {items.map((habit) => (
            <div key={habit.id} className="flex items-center gap-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 p-2 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 truncate">{habit.title}</span>
              <span className="text-sm font-semibold text-black dark:text-white">{habit.average}%</span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const formatHabitMeta = (habit, entry) => {
  if (habit.type === "NUMBER") {
    const value = entry.value ?? 0;
    return `${value} of ${habit.target || 0} ${habit.unit || "units"} today`;
  }
  if (habit.type === "TIME") {
    const value = entry.value ?? 0;
    return `${value} of ${habit.target || 0} ${habit.unit || "minutes"} today`;
  }
  return "One tap: done or not done";
};

const scoreBadgeClass = (percentage) => {
  if (percentage >= 80) return "border-lime-400/30 text-lime-300 bg-lime-400/10";
  if (percentage >= 40) return "border-amber-400/30 text-amber-300 bg-amber-400/10";
  return "border-zinc-700 text-zinc-400";
};

const progressClass = (percentage) => {
  const color = percentage >= 80 ? "bg-lime-400" : percentage >= 40 ? "bg-amber-400" : "bg-zinc-600";
  return `h-full ${color}`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
};

export default DashboardPage;
