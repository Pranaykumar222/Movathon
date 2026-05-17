import React, { forwardRef, useEffect, useState } from 'react';
import { Flame, Zap } from "lucide-react";
import Logo from "./Logo";
import Heatmap from "./Heatmap";

const ShareCard = forwardRef(({ username, streak, consistency, type = "weekly", heatmapData = [], startDate }, ref) => {
  const [displayConsistency, setDisplayConsistency] = useState(0);
  const [displayStreak, setDisplayStreak] = useState(0);

  useEffect(() => {
    // Number count-up animation
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (type === "weekly") {
        setDisplayConsistency(Math.floor((consistency / steps) * currentStep));
      } else {
        setDisplayStreak(Math.floor((streak / steps) * currentStep));
      }
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayConsistency(consistency);
        setDisplayStreak(streak);
      }
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [consistency, streak, type]);

  return (
    <div 
      ref={ref} 
      // 9:16 aspect ratio base size
      className="relative w-[450px] h-[800px] bg-[#06110b] overflow-hidden flex flex-col justify-between p-8"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-lime-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 animate-pulse" style={{ animationDuration: '5s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Logo className="w-10 h-10" />
          <span className="text-xl font-bold text-white tracking-tight">Movathon</span>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-1.5 rounded-full backdrop-blur-md">
          <span className="text-sm font-semibold text-zinc-300">@{username}</span>
        </div>
      </div>

      {/* Main Stat (Center) */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-8">
        {type === "weekly" ? (
          <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="flex items-center gap-2 mb-6 animate-pulse">
              <Zap className="w-6 h-6 text-emerald-400" />
              <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-sm">Weekly Review</p>
            </div>
            
            <div className="text-[100px] font-black text-white leading-none tracking-tighter drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-1000 scale-100 hover:scale-105 mb-6">
              {displayConsistency}%
            </div>
            
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-2xl w-full max-w-[400px] overflow-hidden">
              <div className="scale-[0.85] origin-top-left -mb-10 -mr-10">
                <Heatmap days={heatmapData} startDate={startDate} />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="flex items-center gap-2 mb-6 animate-pulse">
              <Flame className="w-6 h-6 text-orange-500" />
              <p className="text-orange-400 font-bold uppercase tracking-[0.2em] text-sm">Consistency Grid</p>
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-2xl w-full max-w-[400px] overflow-hidden">
              <div className="scale-[0.85] origin-top-left -mb-10 -mr-10">
                <Heatmap days={heatmapData} startDate={startDate} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats Banner */}
      <div className="relative z-10 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl mb-6 shadow-2xl">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{streak}</p>
            <p className="text-xs text-zinc-500 uppercase font-semibold mt-1 tracking-wider">Day Streak</p>
          </div>
          <div className="w-px h-12 bg-zinc-800" />
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{consistency}%</p>
            <p className="text-xs text-zinc-500 uppercase font-semibold mt-1 tracking-wider">Overall</p>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 text-center pb-2">
        <p className="text-zinc-600 text-sm font-semibold tracking-wide">Prove it at <span className="text-zinc-400">movathon.com</span></p>
      </div>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
export default ShareCard;
