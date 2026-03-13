import React from 'react';
import { motion } from 'motion/react';

export const Logo = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div 
        className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm shadow-emerald-500/20"
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 absolute"
        >
          {/* Medical Cross */}
          <path d="M12 4v16" />
          <path d="M4 12h16" />
        </svg>
        {/* Digital Nodes / Connectivity dots */}
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full opacity-90 shadow-sm" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-white rounded-full opacity-90 shadow-sm" />
      </motion.div>
      <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
        SehatSetu
      </span>
    </div>
  );
};
