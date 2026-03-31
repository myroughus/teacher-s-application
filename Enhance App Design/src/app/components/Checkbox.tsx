import { useState } from 'react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  sublabel?: string;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export function Checkbox({ 
  checked, 
  onChange, 
  label, 
  sublabel,
  required = false,
  className = '',
  name,
  id
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(checked || false);
  
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;
  
  const handleChange = () => {
    const newValue = !isChecked;
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onChange?.(newValue);
  };

  const checkboxId = id || name || Math.random().toString(36).substr(2, 9);

  return (
    <label 
      className={`flex items-start gap-3 p-4 bg-[#0d1220] border border-[#1c2540] rounded cursor-pointer transition-all hover:border-[rgba(0,224,199,0.4)] hover:bg-[#0f1524] ${isChecked ? 'border-[rgba(0,224,199,0.5)] bg-[rgba(0,224,199,0.05)]' : ''} ${className}`}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={isChecked}
          onChange={handleChange}
          required={required}
          className="peer sr-only"
        />
        <div 
          className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
            ${isChecked 
              ? 'bg-[#00e0c7] border-[#00e0c7] shadow-[0_0_8px_rgba(0,224,199,0.4)]' 
              : 'bg-[#0a0e1a] border-[#1c2540] peer-hover:border-[rgba(0,224,199,0.4)]'
            }`}
        >
          {isChecked && (
            <svg 
              className="w-3 h-3 text-[#040913]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          )}
        </div>
      </div>
      {(label || sublabel) && (
        <div className="flex-1">
          {label && (
            <span className={`text-[11px] leading-relaxed block ${isChecked ? 'text-[#e2e4ea]' : 'text-[#8d98ae]'}`}>
              {label}
              {required && <span className="text-[#f85c5c] ml-1">*</span>}
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] text-[#6a7194] block mt-0.5">{sublabel}</span>
          )}
        </div>
      )}
    </label>
  );
}

interface CheckboxGroupProps {
  options: { value: string; label: string; icon?: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: 2 | 3 | 4;
}

export function CheckboxGroup({ options, selected, onChange, columns = 4 }: CheckboxGroupProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-2`}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <label 
            key={option.value}
            className={`flex items-center gap-2 p-2.5 rounded cursor-pointer transition-all border
              ${isSelected 
                ? 'bg-[rgba(0,224,199,0.08)] border-[rgba(0,224,199,0.4)]' 
                : 'bg-[#0d1220] border-[#1c2540] hover:border-[rgba(0,224,199,0.3)]'
              }`}
          >
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(option.value)}
                className="peer sr-only"
              />
              <div 
                className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center
                  ${isSelected 
                    ? 'bg-[#00e0c7] border-[#00e0c7]' 
                    : 'bg-[#0a0e1a] border-[#1c2540] peer-hover:border-[rgba(0,224,199,0.4)]'
                  }`}
              >
                {isSelected && (
                  <svg className="w-2.5 h-2.5 text-[#040913]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            {option.icon && <span className="text-[14px]">{option.icon}</span>}
            <span className={`text-[11px] ${isSelected ? 'text-[#e2e4ea]' : 'text-[#8d98ae]'}`}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
