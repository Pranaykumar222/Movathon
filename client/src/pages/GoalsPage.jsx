import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../api/goals";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Pencil, Trash2, Link2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  title: "",
  description: "",
  target: "",
  unit: "",
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data.data.goals);
    } catch {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchGoals);
  }, []);

  const openCreate = () => {
    setEditingGoal(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description || "",
      target: goal.target || "",
      unit: goal.unit || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Goal title is required"); return; }
    setSaving(true);
    const payload = {
      ...form,
      target: form.target ? Number(form.target) : null,
      unit: form.unit.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      if (editingGoal) {
        const res = await updateGoal(editingGoal.id, payload);
        setGoals((prev) => prev.map((goal) => goal.id === editingGoal.id ? res.data.data.goal : goal));
        toast.success("Goal updated");
      } else {
        const res = await createGoal(payload);
        setGoals((prev) => [res.data.data.goal, ...prev]);
        toast.success("Goal created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save goal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((goal) => goal.id !== id));
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-400 mb-2 font-semibold">Long-term outcomes</p>
            <h1 className="text-3xl font-semibold text-white">Goals</h1>
            <p className="text-zinc-400 text-sm mt-1">Create the destination. Link daily habits as proof of progress.</p>
          </div>
          <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] gap-2 transition-transform hover:scale-105">
            <Plus className="w-4 h-4" /> New goal
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <Card className="bg-zinc-950/40 border-zinc-800/50 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-900/0 to-zinc-900/0 pointer-events-none" />
            <CardContent className="relative flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-xl flex items-center justify-center mb-5">
                <Target className="w-8 h-8 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <p className="text-zinc-200 font-medium text-lg">No goals yet</p>
              <p className="text-zinc-500 text-sm mt-2 max-w-sm mx-auto">Create a goal like “Run 100km” and link daily habits to track your cumulative progress.</p>
              <Button onClick={openCreate} className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 gap-2 shadow-lg font-medium transition-transform hover:scale-105">
                <Plus className="w-4 h-4" /> Create goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            {goals.map((goal) => {
              const progress = calculateGoalProgress(goal);
              return (
                <Card key={goal.id} className="group relative overflow-hidden bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/80 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="relative py-6 px-5">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-xl bg-zinc-950/80 border border-zinc-800/50 flex items-center justify-center shrink-0 shadow-inner">
                        <Target className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-white font-semibold text-lg truncate pr-2">{goal.title}</p>
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.1)]">{progress}%</Badge>
                        </div>
                        {goal.description && <p className="text-zinc-400 text-sm mt-1 leading-relaxed line-clamp-2">{goal.description}</p>}
                        
                        {goal.target && (
                          <p className="text-xs text-zinc-500 mt-2 font-medium">Target: {goal.target} {goal.unit}</p>
                        )}
                        
                        <div className="mt-5 h-2.5 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden shadow-inner relative">
                          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
                            <Link2 className="w-3.5 h-3.5" />
                            {goal.habits?.length || 0} linked habit{goal.habits?.length === 1 ? "" : "s"}
                          </p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(goal)} className="text-zinc-500 hover:text-white h-8 w-8 p-0 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-md transition-colors hover:bg-zinc-800">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)} className="text-zinc-500 hover:text-red-400 hover:bg-red-950/40 h-8 w-8 p-0 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-md transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit goal" : "New goal"}</DialogTitle>
            <DialogDescription>
              Define the outcome you want your habits to support.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Outcome</Label>
              <Input
                placeholder="e.g. Lose 5kg, Become consistent at coding"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-green-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Why it matters</Label>
              <textarea
                rows={3}
                placeholder="A short reason that will still make sense 30 days from now"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Target (Optional)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Measured in</Label>
                <Input
                  placeholder="e.g. km, books"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="text-sm text-zinc-300">Progress comes from linked habits.</p>
              <p className="text-xs text-zinc-500 mt-1">Example: “Lose 5kg” can be powered by Gym, 10k steps, and Sleep 8h.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium">
              {saving ? "Saving..." : editingGoal ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

const calculateGoalProgress = (goal) => {
  if (goal.target) {
    let totalValue = 0;
    goal.habits?.forEach((habit) => {
      habit.entries?.forEach((entry) => {
        if (entry.completed) {
          totalValue += (entry.value !== null ? entry.value : (habit.target || 1));
        }
      });
    });
    return Math.min(100, Math.round((totalValue / goal.target) * 100));
  }
  
  if (!goal.habits?.length) return 0;
  
  let totalCompletedDays = 0;
  let totalPossibleDays = 0;
  
  goal.habits.forEach((habit) => {
    const daysSinceCreation = Math.max(1, Math.floor((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)));
    totalPossibleDays += daysSinceCreation;
    totalCompletedDays += habit.entries?.filter(e => e.completed).length || 0;
  });

  if (totalPossibleDays > 0) {
    return Math.min(100, Math.round((totalCompletedDays / totalPossibleDays) * 100));
  }
  return 0;
};

export default GoalsPage;
