
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: { number: number; label: string }[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between relative">
        {steps.map(step => (
          <div
            key={step.number}
            className={`flex flex-col items-center ${
              currentStep >= step.number ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.number ? 'border-primary bg-primary/10' : 'border-gray-300'
              }`}
            >
              {step.number}
            </div>
            <span className="mt-2 text-sm font-medium">{step.label}</span>
            
            {step.number < steps.length && (
              <div className="absolute top-5 left-0 right-0 flex items-center pointer-events-none">
                <div 
                  className={`h-1 flex-1 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  style={{
                    marginLeft: `calc(${(step.number - 0.5) * 100 / steps.length}% + 1rem)`,
                    width: `calc(${100 / steps.length}% - 2rem)`
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
