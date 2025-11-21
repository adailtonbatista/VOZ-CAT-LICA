import React from 'react';

interface OrbProps {
  isActive: boolean;
  isSpeaking: boolean;
  volume: number; // 0 - 255
}

export const Orb: React.FC<OrbProps> = ({ isActive, isSpeaking, volume }) => {
  // Normalize volume to scale factor (1.0 to 2.0 approx)
  const scale = isActive 
    ? 1 + (volume / 255) * 1.5 
    : 1;
    
  const glowIntensity = isActive 
    ? 0.5 + (volume / 255) 
    : 0.2;

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Glow Rings */}
      <div 
        className={`absolute w-full h-full rounded-full transition-all duration-75 ease-out border-2 border-amber-500/20 ${isActive ? 'animate-[spin_10s_linear_infinite]' : ''}`}
        style={{ transform: `scale(${scale * 1.1})` }}
      ></div>
      <div 
        className={`absolute w-[90%] h-[90%] rounded-full transition-all duration-100 ease-out border border-amber-400/30 ${isActive ? 'animate-[spin_8s_linear_infinite_reverse]' : ''}`}
        style={{ transform: `scale(${scale * 1.05})` }}
      ></div>

      {/* Main Orb */}
      <div 
        className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 shadow-[0_0_60px_rgba(245,158,11,0.6)] transition-all duration-75"
        style={{ 
            transform: `scale(${scale})`,
            opacity: isActive ? 1 : 0.5,
            boxShadow: `0 0 ${60 * glowIntensity}px rgba(245,158,11, ${Math.min(1, glowIntensity)})`
        }}
      >
        <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>
      </div>
      
      {/* Status Text */}
      <div className="absolute -bottom-12 text-amber-200/80 font-light tracking-widest uppercase text-sm">
        {isActive ? (isSpeaking ? "Falando..." : "Ouvindo...") : "Inativo"}
      </div>
    </div>
  );
};