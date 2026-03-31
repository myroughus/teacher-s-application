interface ProgressBarProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ progress, currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="mb-8">
      <div
        className="rounded-[99px] overflow-hidden"
        style={{
          height: '3px',
          background: 'rgba(133,153,194,0.14)',
        }}
      >
        <div
          className="h-full rounded-[99px]"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00e0c7, #2b7fff)',
            boxShadow: '0 0 8px rgba(0,224,199,0.22)',
            transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}
