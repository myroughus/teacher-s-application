import type { ChangeEventHandler } from 'react';

interface FormFieldProps {
  label: string;
  sublabel?: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  rows?: number;
  maxLength?: number;
  defaultValue?: string;
  bengali?: boolean;
  value?: string | number;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  min?: number;
  max?: number;
  id?: string;
  name?: string;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
  pattern?: string;
  title?: string;
}

export function FormField({
  label,
  sublabel,
  type = 'text',
  placeholder,
  required = false,
  options,
  rows = 3,
  maxLength,
  defaultValue,
  bengali,
  value,
  onChange,
  min,
  max,
  id,
  name,
  className = '',
  readOnly = false,
  disabled = false,
  pattern,
  title,
}: FormFieldProps) {
  const inputId = id || name || `field-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

  const baseInputClasses = `
    w-full px-3.5 py-[11px] bg-[#0d1220] border border-[#1c2540] rounded-md
    text-[13px] text-[#e2e4ea] font-['DM_Mono']
    placeholder:text-[#444d6e]
    focus:outline-none focus:border-[#00e0c7] focus:ring-2 focus:ring-[rgba(0,224,199,0.12)]
    hover:border-[#242e4a]
    transition-all
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const commonProps = {
    id: inputId,
    name,
    required,
    disabled,
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block">
        <span className="text-[10px] tracking-[0.12em] uppercase text-[#6a7194]">
          {label} {required && <span className="text-[#f85c5c]">*</span>}
        </span>
        {sublabel && (
          <span className={`block mt-0.5 text-[10px] text-[#444d6e] ${bengali ? 'font-["Noto_Sans_Bengali"]' : 'font-sans'}`}>
            {sublabel}
          </span>
        )}
      </label>

      {type === 'select' ? (
        <select
          {...commonProps}
          className={baseInputClasses}
          value={value ?? defaultValue ?? ''}
          onChange={onChange}
        >
          {options?.map((option, index) => (
            <option key={`${option}-${index}`} value={option} className="bg-[#0f1524]">
              {option || '— Select an option —'}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          {...commonProps}
          className={baseInputClasses}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          value={value ?? defaultValue ?? ''}
          onChange={onChange}
          readOnly={readOnly}
        />
      ) : (
        <input
          {...commonProps}
          type={type}
          className={`${baseInputClasses} ${bengali ? 'font-["Noto_Sans_Bengali"]' : ''}`}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value ?? defaultValue ?? ''}
          onChange={onChange}
          min={min}
          max={max}
          readOnly={readOnly}
          pattern={pattern}
          title={title}
        />
      )}
    </div>
  );
}
