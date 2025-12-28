import React from 'react';

export const QuarryExtractionLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-200">
      <div className="relative w-96 h-72 mb-8">
        {/* Mountain Quarry */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 384 288" fill="none">
          <path
            d="M0 220 L100 120 L200 160 L300 100 L384 140 L384 288 L0 288 Z"
            fill="url(#quarryMountain)"
          />
          <defs>
            <linearGradient id="quarryMountain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8f9fa" />
              <stop offset="100%" stopColor="#6c757d" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Extraction Equipment */}
        <div className="absolute top-16 left-20">
          <div className="w-16 h-8 bg-black rounded-sm relative">
            {/* Cutting Arm */}
            <div className="absolute top-full left-1/2 w-1 h-16 bg-black transform -translate-x-1/2 animate-cutting-arm"></div>
            {/* Wire Wheel */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-16">
              <div className="w-8 h-8 border-2 border-black rounded-full animate-spin-slow relative">
                <div className="absolute inset-1 border border-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Horizontal Cutting Wire */}
        <div className="absolute top-32 left-20 right-20 h-0.5 bg-black animate-horizontal-cut"></div>
        
        {/* Vertical Cutting Wire */}
        <div className="absolute top-32 left-32 bottom-16 w-0.5 bg-black animate-vertical-cut"></div>
        
        {/* Extracted Block */}
        <div className="absolute bottom-16 left-32 w-24 h-16 bg-gradient-to-br from-white to-gray-400 rounded shadow-lg animate-block-extraction"></div>
        
        {/* Cutting Debris */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gray-600 rounded-full animate-cutting-debris"
              style={{
                left: `${25 + Math.random() * 30}%`,
                top: `${30 + Math.random() * 40}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          ))}
        </div>
        
        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-gray-300 rounded-full overflow-hidden">
          <div className="h-full bg-black rounded-full animate-extraction-progress"></div>
        </div>
      </div>
      
        <style>{`
        .animate-cutting-arm {
          animation: cuttingArm 3s ease-in-out infinite;
        }
        
        .animate-horizontal-cut {
          animation: horizontalCut 4s ease-in-out infinite;
        }
        
        .animate-vertical-cut {
          animation: verticalCut 4s ease-in-out infinite 1s;
        }
        
        .animate-block-extraction {
          animation: blockExtraction 6s ease-in-out infinite;
        }
        
        .animate-cutting-debris {
          animation: cuttingDebris 2s ease-out infinite;
        }
        
        .animate-extraction-progress {
          animation: extractionProgress 6s ease-in-out infinite;
        }
        
        @keyframes cuttingArm {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          50% { transform: translateX(-50%) rotate(5deg); }
        }
        
        @keyframes horizontalCut {
          0% { width: 0%; opacity: 0; }
          25% { opacity: 1; }
          50% { width: 100%; }
          100% { width: 100%; opacity: 0.5; }
        }
        
        @keyframes verticalCut {
          0% { height: 0%; opacity: 0; }
          25% { opacity: 1; }
          50% { height: 100%; }
          100% { height: 100%; opacity: 0.5; }
        }
        
        @keyframes blockExtraction {
          0%, 60% { transform: translateY(0); opacity: 0; }
          70% { opacity: 1; }
          100% { transform: translateY(-20px); opacity: 1; }
        }
        
        @keyframes cuttingDebris {
          0% { opacity: 0; transform: translateY(0) scale(0); }
          50% { opacity: 1; transform: translateY(-15px) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(0.5); }
        }
        
        @keyframes extractionProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

const LoadingSpinner = () => {
  return <QuarryExtractionLoader />;
};

export default LoadingSpinner;
