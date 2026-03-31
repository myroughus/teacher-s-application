import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

export function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <div className="mb-7 px-6 py-6 bg-[#0f1524] border border-[#1c2540] rounded-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1c2540]">
        {icon && <span className="text-xl">{icon}</span>}
        <h2 className="font-['Cormorant_Garamond'] text-[18px] text-[#00e0c7] font-medium">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
