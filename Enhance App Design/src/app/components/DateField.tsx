import { useState, useEffect } from 'react';

interface DateFieldProps {
  label: string;
  sublabel?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
}

export function DateField({ 
  label, 
  sublabel, 
  value, 
  defaultValue,
  onChange, 
  required = false,
  placeholder = "DD/MM/YYYY",
  readOnly = false
}: DateFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  
  // Convert yyyy-mm-dd to dd/mm/yyyy for display
  const formatForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };
  
  // Convert dd/mm/yyyy to yyyy-mm-dd for storage
  const formatForStorage = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };
  
  // Validate dd/mm/yyyy format
  const isValidDate = (dateStr: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year &&
           year >= 1900 && 
           year <= 2100;
  };
  
  useEffect(() => {
    const initialValue = value !== undefined ? value : defaultValue || '';
    setInputValue(formatForDisplay(initialValue));
  }, [value, defaultValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Auto-format as user types
    newValue = newValue.replace(/[^\d/]/g, '');
    
    // Auto-add slashes
    if (newValue.length === 2 && !newValue.includes('/') && inputValue.length < 2) {
      newValue += '/';
    } else if (newValue.length === 5 && newValue.split('/').length === 2 && inputValue.length < 5) {
      newValue += '/';
    }
    
    setInputValue(newValue);
    
    if (newValue === '') {
      setError('');
      onChange?.('');
    } else if (isValidDate(newValue)) {
      setError('');
      onChange?.(formatForStorage(newValue));
    } else {
      setError('Invalid date format. Use DD/MM/YYYY');
    }
  };
  
  const handleBlur = () => {
    if (inputValue && !isValidDate(inputValue)) {
      setError('Invalid date. Please use DD/MM/YYYY format');
    }
  };

  const id = Math.random().toString(36).substr(2, 9);

  return (
    <div>
      <label htmlFor={id} className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">
        {label}
        {sublabel && <span className="block normal-case text-[9px] text-[#566074] mt-0.5">{sublabel}</span>}
        {required && <span className="text-[#f85c5c] ml-1">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        disabled={readOnly}
        className={`w-full px-3 py-2.5 bg-[#0a0e1a] border rounded text-[13px] text-[#e2e4ea] font-['DM_Mono'] focus:outline-none focus:border-[#00e0c7] focus:ring-2 focus:ring-[rgba(0,224,199,0.12)] transition-all ${
          error ? 'border-[#f85c5c]' : 'border-[#1c2540]'
        } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-[10px] text-[#f85c5c] mt-1">{error}</p>}
    </div>
  );
}
