import React from "react";

const Logo = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-lime-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] ${className}`}>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-[60%] h-[60%]"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>
      </defs>
      <path 
        d="M2 20L8 10L12 14L22 4" 
        stroke="url(#logo-gradient)" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M22 4V10M22 4H16" 
        stroke="url(#logo-gradient)" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  </div>
);

export default Logo;
