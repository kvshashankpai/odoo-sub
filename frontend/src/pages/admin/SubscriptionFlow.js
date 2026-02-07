import React from 'react';

const SubscriptionFlow = ({ currentStatus }) => {
  // These steps follow the lifecycle defined in the documentation 
  const steps = ["Draft", "Confirmed", "Active", "Closed"];
  
  // Find the index of the current status to highlight progress
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="w-full py-6 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-center space-x-4 max-w-4xl mx-auto">
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex items-center space-x-2">
              {/* Step Circle */}
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                  idx <= currentIndex 
                    ? 'border-purple-600 bg-purple-600 text-white' 
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {idx + 1}
              </div>
              
              {/* Step Label */}
              <span 
                className={`text-xs font-bold uppercase tracking-wider ${
                  idx <= currentIndex ? 'text-purple-700' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connecting Line */}
            {idx < steps.length - 1 && (
              <div 
                className={`w-12 h-0.5 transition-colors ${
                  idx < currentIndex ? 'bg-purple-600' : 'bg-gray-200'
                }`} 
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Ensure the export name matches exactly what you import in SubscriptionDetails.js
export default SubscriptionFlow;