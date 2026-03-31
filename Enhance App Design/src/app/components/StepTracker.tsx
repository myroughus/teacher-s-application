import React from 'react';

interface StepTrackerProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { num: 1, label: 'Identity' },
  { num: 2, label: 'Contact' },
  { num: 3, label: 'Academics' },
  { num: 4, label: 'Professional' },
  { num: 5, label: 'Experience' },
  { num: 6, label: 'Suitability' },
  { num: 7, label: 'Background' },
  { num: 8, label: 'Documents' },
  { num: 9, label: 'References' },
  { num: 10, label: 'Declaration' },
];

export function StepTracker({ currentStep, totalSteps, onStepClick }: StepTrackerProps) {
  return (
    <div
      className="mb-9 px-6 py-5 rounded-[18px]"
      style={{
        background: 'linear-gradient(180deg, rgba(8,16,30,0.92) 0%, rgba(6,12,24,0.96) 100%)',
        border: '1px solid rgba(133,153,194,0.14)',
        boxShadow: 'inset 0 1px 0 rgba(0,224,199,0.16), 0 8px 32px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 0 
        }}
      >
        {steps.map((step, index) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <React.Fragment key={step.num}>
              {/* Step Dot */}
              <div
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                style={{ cursor: onStepClick ? 'pointer' : 'default' }}
                onClick={() => onStepClick && onStepClick(step.num)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold relative z-[1] transition-all"
                  style={{
                    border: `2px solid ${isActive || isCompleted ? '#00e0c7' : 'rgba(133,153,194,0.14)'}`,
                    background: isCompleted ? '#00e0c7' : isActive ? 'rgba(0,224,199,0.12)' : '#0a1120',
                    color: isCompleted ? '#040913' : isActive ? '#00e0c7' : '#566074',
                    boxShadow: isActive ? '0 0 12px rgba(0,224,199,0.22)' : 'none',
                  }}
                >
                  {isCompleted ? <span className="text-[13px]">✓</span> : <span>{step.num}</span>}
                </div>
                <span
                  className="text-[9px] font-semibold uppercase whitespace-nowrap text-center leading-tight"
                  style={{
                    maxWidth: '64px',
                    letterSpacing: '0.06em',
                    color: isActive ? '#00e0c7' : isCompleted ? '#8d98ae' : '#566074',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className="flex-shrink-0"
                  style={{
                    flex: 1,
                    minWidth: '20px',
                    maxWidth: '48px',
                    height: '2px',
                    margin: '0 4px',
                    marginBottom: '20px',
                    background: isCompleted ? 'linear-gradient(90deg, #00e0c7, rgba(0,224,199,0.12))' : 'rgba(133,153,194,0.14)',
                    transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
