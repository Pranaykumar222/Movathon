import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity, Flame, Target, Sparkles, Check, ChevronRight } from "lucide-react";
import Logo from "./Logo";

const steps = [
  {
    icon: <Activity className="w-8 h-8 text-emerald-400" />,
    title: "Welcome to Movathon",
    description: "The premier platform for building unbreakable discipline. Let's take a quick tour of how it works.",
  },
  {
    icon: <Target className="w-8 h-8 text-amber-400" />,
    title: "1. Create Habits",
    description: "Start by heading over to the Habits tab. Add the daily or weekly actions you want to track (like 'Read 10 pages' or 'Hit the Gym').",
  },
  {
    icon: <Flame className="w-8 h-8 text-orange-400" />,
    title: "2. Build Your Streak",
    description: "Log your progress every day on the Dashboard. Every completion paints your Consistency Grid and builds your streak.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-blue-400" />,
    title: "3. Share Your Consistency",
    description: "Check your Weekly Review for insights, and share your Public Profile (or download Social Cards) to prove your discipline to the world.",
  }
];

const OnboardingTutorial = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if the user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem("movathon_tutorial_seen");
    if (!hasSeenTutorial) {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("movathon_tutorial_seen", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleComplete}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md [&>button]:hidden outline-none">
        <div className="flex flex-col items-center text-center p-6 space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center relative shadow-2xl">
            {steps[currentStep].icon}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 scale-110 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">{steps[currentStep].title}</h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-[280px] mx-auto">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "w-6 bg-emerald-500" : "w-1.5 bg-zinc-800"}`}
              />
            ))}
          </div>

        </div>

        <DialogFooter className="flex flex-row items-center justify-between w-full p-4 border-t border-zinc-800/50">
          <Button 
            variant="ghost" 
            onClick={handleComplete}
            className="text-zinc-500 hover:text-white"
          >
            Skip tour
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
          >
            {currentStep === steps.length - 1 ? (
              <>Get Started <Check className="w-4 h-4 ml-2" /></>
            ) : (
              <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTutorial;
