import { useEffect, useState } from "react";
import { getHabits, createHabit, updateHabit, deleteHabit } from "../api/habits";
import { getGoals } from "../api/goals";
import AppLayout from "../layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Flame, Target, CheckCircle2, Hash, Clock } from "lucide-react";
import { toast } from "sonner";
import { HABIT_COLORS, HABIT_TYPES } from "../utils/constants";
import { getLocalDayOfWeek, toLocalDateString } from "../utils/date";

const currentDayFrequency = () => [getLocalDayOfWeek()];
const todayDate = () => toLocalDateString();

const emptyForm = {
  title: "",
  color: HABIT_COLORS[0],
  type: "YES_NO",
  target: "",
  unit: "",
  goalId: "",
  frequency: currentDayFrequency(),
  scheduleType: "WEEKLY",
  oneTimeDate: todayDate(),
  scheduledTime: "",
};

const formatFrequency = (freq) => {
  if (!freq || freq.length === 7) return "Every day";
  if (freq.length === 5 && [1,2,3,4,5].every(d => freq.includes(d))) return "Weekdays";
  if (freq.length === 2 && [0,6].every(d => freq.includes(d))) return "Weekends";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return freq.map(d => days[d]).join(", ");
};

const formatSchedule = (habit) => {
  if (habit.scheduleType === "ONE_TIME") {
    const date = habit.oneTimeDate ? new Date(`${habit.oneTimeDate}T00:00:00`) : null;
    const dateLabel = date
      ? date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      : "One day";
    return `${dateLabel}${habit.scheduledTime ? ` at ${formatTime(habit.scheduledTime)}` : ""}`;
  }
  return formatFrequency(habit.frequency);
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [habitsRes, goalsRes] = await Promise.all([getHabits(), getGoals()]);
      setHabits(habitsRes.data.data.habits);
      setGoals(goalsRes.data.data.goals);
    } catch {
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchData);
  }, []);

  const openCreate = () => {
    setEditingHabit(null);
    setForm({ ...emptyForm, frequency: currentDayFrequency(), oneTimeDate: todayDate() });
    setDialogOpen(true);
  };

  const openEdit = (habit) => {
    setEditingHabit(habit);
    setForm({
      title: habit.title,
      color: habit.color,
      type: habit.type || "YES_NO",
      target: habit.target ?? "",
      unit: habit.unit ?? "",
      goalId: habit.goalId ?? "",
      frequency: habit.frequency || [0, 1, 2, 3, 4, 5, 6],
      scheduleType: habit.scheduleType || "WEEKLY",
      oneTimeDate: habit.oneTimeDate || todayDate(),
      scheduledTime: habit.scheduledTime || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (form.type !== "YES_NO" && (!form.target || Number(form.target) <= 0)) {
      toast.error("Add a daily target so Movathon can calculate completion");
      return;
    }
    if (form.scheduleType === "ONE_TIME" && !form.oneTimeDate) {
      toast.error("Pick the date for this one-day task");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      target: form.target === "" ? null : Number(form.target),
      unit: form.unit.trim() || null,
      goalId: form.goalId || null,
      frequency: form.scheduleType === "WEEKLY" ? form.frequency : [],
      oneTimeDate: form.scheduleType === "ONE_TIME" ? form.oneTimeDate : null,
      scheduledTime: form.scheduledTime || null,
    };
    try {
      if (editingHabit) {
        const res = await updateHabit(editingHabit.id, payload);
        setHabits((prev) => prev.map((h) => h.id === editingHabit.id ? res.data.data.habit : h));
        toast.success("Habit updated");
      } else {
        const res = await createHabit(payload);
        setHabits((prev) => [...prev, res.data.data.habit]);
        toast.success("Habit created!");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save habit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      toast.success("Habit deleted");
    } catch {
      toast.error("Failed to delete habit");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-400 mb-2 font-semibold">Daily system</p>
            <h1 className="text-3xl font-semibold text-black dark:text-white">Habits</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Set the inputs that paint your consistency grid.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" /> New habit
          </Button>
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <Card className="bg-zinc-50/80 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/50 dark:from-emerald-900/20 via-zinc-900/0 to-zinc-900/0 pointer-events-none" />
            <CardContent className="relative flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xl flex items-center justify-center mb-5">
                <Flame className="w-8 h-8 text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
              <p className="text-zinc-900 dark:text-zinc-200 font-medium text-lg">No habits yet</p>
              <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2 max-w-sm mx-auto">Create your first habit to start painting your daily consistency grid.</p>
              <Button onClick={openCreate} className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 gap-2 shadow-lg font-medium transition-transform hover:scale-105">
                <Plus className="w-4 h-4" /> Create habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {habits.map((habit) => (
              <Card key={habit.id} className="group relative overflow-hidden bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700/80 backdrop-blur-xl transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/80 flex items-center justify-center shrink-0 shadow-inner">
                      {habit.type === "NUMBER" && <Hash className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />}
                      {habit.type === "TIME" && <Clock className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />}
                      {habit.type === "YES_NO" && <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />}
                    </div>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(habit)} aria-label={`Edit ${habit.title}`} className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white h-8 w-8 p-0 bg-white/80 dark:bg-zinc-950/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800/50 rounded-md">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(habit.id)} aria-label={`Delete ${habit.title}`} className="text-zinc-600 hover:text-red-600 hover:bg-red-50 dark:text-zinc-300 dark:hover:text-red-400 dark:hover:bg-red-950/30 h-8 w-8 p-0 bg-white/80 dark:bg-zinc-950/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800/50 rounded-md">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="min-w-0 mt-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor] opacity-80" style={{ backgroundColor: habit.color, color: habit.color }} />
                      <p className="text-black dark:text-white font-medium text-base truncate">{habit.title}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{formatHabitType(habit)}</span>
                      <span className="text-zinc-500 text-xs font-medium">{formatSchedule(habit)}</span>
                      {habit.goal && <span className="text-zinc-500 text-xs flex items-center gap-1 mt-1"><Target className="w-3 h-3" /> Linked to {habit.goal.title}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
          <DialogHeader>
            <DialogTitle>{editingHabit ? "Edit habit" : "New habit"}</DialogTitle>
            <DialogDescription>
              Set up how this habit is measured, scheduled, and connected to your goals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-600 dark:text-zinc-300">Habit name</Label>
              <Input
                placeholder="e.g. Gym, 10k steps, Deep work"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-transparent dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-green-500"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-600 dark:text-zinc-300">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                      form.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-600 dark:text-zinc-300">How do you measure it?</Label>
              <div className="grid gap-2">
                {HABIT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      type: type.value,
                      target: type.value === "YES_NO" ? "" : form.target,
                      unit: type.value === "YES_NO" ? "" : form.unit,
                    })}
                    className={`rounded-md border p-3 text-left transition-colors ${
                      form.type === type.value
                        ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-sm font-medium text-black dark:text-white">{type.label}</span>
                    <span className="block text-xs text-zinc-500 mt-1">{type.helper}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-600 dark:text-zinc-300">Schedule</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "WEEKLY", label: "Repeat weekly" },
                  { value: "ONE_TIME", label: "One-day task" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, scheduleType: option.value })}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      form.scheduleType === option.value
                        ? "border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {form.scheduleType === "WEEKLY" ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-zinc-600 dark:text-zinc-300">Repeat on</Label>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, frequency: currentDayFrequency() })} className="h-7 px-2 text-xs text-zinc-600 dark:text-zinc-300">
                      Today
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, frequency: [0, 1, 2, 3, 4, 5, 6] })} className="h-7 px-2 text-xs text-zinc-600 dark:text-zinc-300">
                      Daily
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const freq = form.frequency || [0,1,2,3,4,5,6];
                        if (freq.includes(i)) {
                          if (freq.length > 1) {
                            setForm({ ...form, frequency: freq.filter(d => d !== i) });
                          }
                        } else {
                          setForm({ ...form, frequency: [...freq, i].sort() });
                        }
                      }}
                      aria-pressed={form.frequency?.includes(i)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${form.frequency?.includes(i) ? "bg-emerald-500 text-white dark:text-zinc-950" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-zinc-600 dark:text-zinc-300">Task date</Label>
                  <Input
                    type="date"
                    value={form.oneTimeDate}
                    onChange={(e) => setForm({ ...form, oneTimeDate: e.target.value })}
                    className="bg-transparent dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-600 dark:text-zinc-300">Time (optional)</Label>
                  <Input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                    className="bg-transparent dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
            {form.type !== "YES_NO" && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-zinc-600 dark:text-zinc-300">Daily target</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder={form.type === "TIME" ? "90" : "10000"}
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  className="bg-transparent dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-green-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-600 dark:text-zinc-300">Measured in</Label>
                <Input
                  placeholder={form.type === "TIME" ? "minutes" : "steps"}
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="bg-transparent dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-green-500"
                />
              </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-zinc-600 dark:text-zinc-300">Supports goal</Label>
              <select
                value={form.goalId}
                onChange={(e) => setForm({ ...form, goalId: e.target.value })}
                className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent dark:bg-zinc-800 px-3 text-sm text-black dark:text-white"
              >
                <option value="">No goal</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
              {goals.length === 0 && (
                <p className="flex items-center gap-1 text-xs text-zinc-500">
                  <Target className="w-3 h-3" /> Create a goal first, then connect this habit to the outcome.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              {saving ? "Saving..." : editingHabit ? "Save changes" : "Create habit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

const formatHabitType = (habit) => {
  if (habit.type === "NUMBER") return `${habit.target || 0} ${habit.unit || "units"} per day`;
  if (habit.type === "TIME") return `${habit.target || 0} ${habit.unit || "minutes"} per day`;
  return "One tap daily check-in";
};

export default HabitsPage;
