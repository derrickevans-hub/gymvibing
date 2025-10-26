import React from 'react';

const ExerciseAnimation = () => {
  return (
    <div className="relative w-full max-w-xs mx-auto h-64 overflow-visible">
      <svg 
        viewBox="0 0 300 300" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background organic shapes */}
        <ellipse 
          cx="150" 
          cy="180" 
          rx="120" 
          ry="110" 
          fill="hsl(var(--primary))" 
          opacity="0.08"
          className="animate-pulse-soft"
        />
        
        {/* Exercise bike base */}
        <g className="animate-bounce-gentle">
          {/* Bike wheel */}
          <circle 
            cx="100" 
            cy="220" 
            r="35" 
            stroke="hsl(var(--primary))" 
            strokeWidth="8" 
            fill="none"
            className="origin-center"
            style={{ 
              animation: 'spin 3s linear infinite',
              transformBox: 'fill-box'
            }}
          />
          <circle 
            cx="100" 
            cy="220" 
            r="15" 
            fill="hsl(var(--primary))" 
          />
          
          {/* Bike frame */}
          <path 
            d="M100 220 L130 180 L130 160" 
            stroke="hsl(var(--muted-foreground))" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
        </g>

        {/* Person exercising */}
        <g className="animate-slide-up">
          {/* Head */}
          <circle 
            cx="145" 
            cy="90" 
            r="20" 
            fill="hsl(var(--accent))" 
            opacity="0.9"
          />
          
          {/* Hair/headband */}
          <ellipse 
            cx="145" 
            cy="85" 
            rx="22" 
            ry="12" 
            fill="hsl(var(--primary))" 
            opacity="0.8"
          />

          {/* Body */}
          <path 
            d="M145 110 Q135 140 130 160" 
            stroke="hsl(var(--accent))" 
            strokeWidth="20" 
            strokeLinecap="round"
            opacity="0.9"
            className="animate-scale-bounce"
          />

          {/* Arms */}
          <g className="origin-center" style={{ transformBox: 'fill-box' }}>
            <path 
              d="M140 120 Q120 135 130 160" 
              stroke="hsl(var(--accent))" 
              strokeWidth="12" 
              strokeLinecap="round"
              opacity="0.9"
              className="animate-bounce-gentle"
              style={{ animationDelay: '0.1s' }}
            />
            <path 
              d="M150 120 Q170 135 160 150" 
              stroke="hsl(var(--accent))" 
              strokeWidth="12" 
              strokeLinecap="round"
              opacity="0.9"
              className="animate-bounce-gentle"
              style={{ animationDelay: '0.2s' }}
            />
          </g>

          {/* Legs */}
          <g>
            <path 
              d="M130 160 Q120 190 115 210" 
              stroke="hsl(var(--accent))" 
              strokeWidth="14" 
              strokeLinecap="round"
              opacity="0.9"
              className="animate-slide-up"
              style={{ animationDelay: '0.15s' }}
            />
            <path 
              d="M135 160 Q145 180 140 200" 
              stroke="hsl(var(--accent))" 
              strokeWidth="14" 
              strokeLinecap="round"
              opacity="0.9"
              className="animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            />
          </g>
        </g>

        {/* Floating elements */}
        <circle 
          cx="220" 
          cy="80" 
          r="8" 
          fill="hsl(var(--warning))" 
          opacity="0.6"
          className="animate-bounce-gentle"
          style={{ animationDelay: '0.5s' }}
        />
        <circle 
          cx="70" 
          cy="100" 
          r="6" 
          fill="hsl(var(--primary))" 
          opacity="0.5"
          className="animate-bounce-gentle"
          style={{ animationDelay: '0.8s' }}
        />
        <circle 
          cx="240" 
          cy="200" 
          r="10" 
          fill="hsl(var(--accent))" 
          opacity="0.4"
          className="animate-pulse-soft"
        />
      </svg>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExerciseAnimation;
