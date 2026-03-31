import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Checkbox, CheckboxGroup } from './Checkbox';
import { DateField } from './DateField';
import { StepTracker } from './StepTracker';
import { ProgressBar } from './ProgressBar';
import { FormSection } from './FormSection';
import { FormField } from './FormField';
import { PhotoUpload } from './PhotoUpload';
import { SuccessScreen } from './SuccessScreen';

const TOTAL_STEPS = 10;

// Required fields by step for navigation guidance
const STEP_REQUIRED_FIELDS: Record<number, string[]> = {
  1: ['fullNameEnglish', 'fullNameBangla', 'fathersName', 'mothersName', 'dateOfBirth', 'gender', 'maritalStatus', 'nationalId'],
  2: ['mobileNumber', 'email', 'presentAddress', 'permanentAddress', 'district', 'thana', 'applyingForPost', 'subjectDepartment'],
  3: ['examDegreeName1', 'examDegreeName2'],
  4: ['ntrcaStatus', 'mpoExperience'],
  7: ['emergencyContactName', 'emergencyContactNumber', 'emergencyContactRelation'],
  10: ['signatureCanvas']
};

// All required fields across all steps
const ALL_REQUIRED_FIELDS = [
  { step: 1, field: 'fullNameEnglish' },
  { step: 1, field: 'fullNameBangla' },
  { step: 1, field: 'fathersName' },
  { step: 1, field: 'mothersName' },
  { step: 1, field: 'dateOfBirth' },
  { step: 1, field: 'gender' },
  { step: 1, field: 'maritalStatus' },
  { step: 1, field: 'nationality' },
  { step: 1, field: 'nationalId' },
  { step: 2, field: 'mobileNumber' },
  { step: 2, field: 'email' },
  { step: 2, field: 'presentAddress' },
  { step: 2, field: 'permanentAddress' },
  { step: 2, field: 'district' },
  { step: 2, field: 'thana' },
  { step: 2, field: 'applyingForPost' },
  { step: 2, field: 'subjectDepartment' },
  { step: 3, field: 'examDegreeName1' },
  { step: 3, field: 'examDegreeName2' },
  { step: 4, field: 'ntrcaStatus' },
  { step: 4, field: 'mpoExperience' },
  { step: 7, field: 'emergencyContactName' },
  { step: 7, field: 'emergencyContactNumber' },
  { step: 7, field: 'emergencyContactRelation' },
  { step: 10, field: 'signatureCanvas' },
];

export function TeacherApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({
    nationality: 'Bangladeshi',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{step: number | null; fields: Record<string, boolean>}>({ step: null, fields: {} });
  const [showMissingFieldsPopup, setShowMissingFieldsPopup] = useState(false);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const getMissingRequiredFields = () => {
    return ALL_REQUIRED_FIELDS.filter(({ field }) => {
      const value = formData[field];
      return !value || (typeof value === 'string' && (value.trim() === '' || value === '-- Select --'));
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    const hasValue = Array.isArray(value)
      ? value.length > 0
      : value !== undefined && value !== null && String(value).trim() !== '' && String(value) !== '-- Select --';

    setValidationErrors(prev => ({
      ...prev,
      fields: { ...prev.fields, [field]: !hasValue }
    }));
  };

  const validateCurrentStep = (): { isValid: boolean; emptyFields: string[] } => {
    const requiredFields = STEP_REQUIRED_FIELDS[currentStep] || [];
    const emptyFields: string[] = [];
    
    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && (value.trim() === '' || value === '-- Select --'))) {
        emptyFields.push(field);
      }
    });
    
    return { isValid: emptyFields.length === 0, emptyFields };
  };

  const findFirstIncompleteStep = (): number => {
    // Simple heuristic: check if required fields for each step have values
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      const requiredFields = STEP_REQUIRED_FIELDS[step];
      if (!requiredFields) continue;
      
      const hasEmptyField = requiredFields.some(field => {
        const value = formData[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (hasEmptyField) return step;
    }
    return 10; // All steps appear complete
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const missingFields = getMissingRequiredFields();

    if (missingFields.length > 0) {
      const firstMissing = missingFields[0];
      const errorFields: Record<string, boolean> = {};
      missingFields.forEach(({ field }) => {
        errorFields[field] = true;
      });

      setValidationErrors({ step: firstMissing.step, fields: errorFields });
      setShowMissingFieldsPopup(true);
      setCurrentStep(firstMissing.step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors({ step: null, fields: {} });
    setShowMissingFieldsPopup(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToField = (targetStep: number, field: string) => {
    if (targetStep !== currentStep) {
      setCurrentStep(targetStep);
    }

    // Keep popup visible, just highlight the field
    setHighlightedField(field);

    setTimeout(() => {
      const element = document.getElementById(`field-${field}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = element.querySelector('input, select, textarea, canvas, button') as HTMLElement | null;
        focusable?.focus();
      }
    }, targetStep !== currentStep ? 250 : 80);

    setTimeout(() => {
      setHighlightedField(null);
    }, 3500);
  };

  if (isSubmitted) {
    return <SuccessScreen />;
  }

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="max-w-[980px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block text-[9px] tracking-[0.25em] uppercase text-[#00e0c7] bg-[rgba(0,224,199,0.08)] border border-[rgba(0,224,199,0.2)] px-4 py-1.5 rounded mb-4">
          শিক্ষক আবেদনপত্র · Teacher Application
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-[38px] text-[#e2e4ea] mb-3 font-semibold">
          Teacher Application Form
        </h1>
        <p className="text-[11px] text-[#6a7194] tracking-[0.04em] leading-relaxed max-w-[600px] mx-auto">
          সকল প্রয়োজনীয় তথ্য পূরণ করুন এবং আবেদন জমা দিন।<br />
          Fill out all required fields and submit your application.<br />
          প্রতিষ্ঠান আবেদন পর্যালোচনা করে যোগাযোগ করবে।
        </p>
      </div>

      {/* Step Tracker */}
      <StepTracker 
        currentStep={currentStep} 
        totalSteps={TOTAL_STEPS}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Progress Bar */}
      <ProgressBar progress={progress} currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Form Content */}
      {/* Missing Fields Notification — portal-rendered, floats top-right */}
      <MissingFieldsPopup 
        allFields={ALL_REQUIRED_FIELDS}
        formData={formData}
        currentStep={currentStep}
        onNavigate={handleNavigateToField}
        onClose={() => setShowMissingFieldsPopup(false)}
        visible={showMissingFieldsPopup}
      />

      <div className="mb-8">
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && <Step1BasicIdentity formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 2 && <Step2ContactJob formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 3 && <Step3Academics formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 4 && <Step4ProfessionalQualifications formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 5 && <Step5TeachingExperience formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 6 && <Step6SuitabilitySkills formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 7 && <Step7PersonalBackground formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 8 && <Step8Documents formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 9 && <Step9References formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
          {currentStep === 10 && <Step10Declaration formData={formData} updateField={updateField} validationErrors={validationErrors.fields} attemptedSubmit={submitAttempted} highlightedField={highlightedField} />}
        </form>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-[#1c2540]">
        <div className="text-[11px] text-[#6a7194]">
          Step <span className="text-[#00e0c7] font-medium">{currentStep}</span> of {TOTAL_STEPS}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] rounded-lg hover:border-[#00e0c7] hover:text-[#00e0c7] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[12px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00e0c7] text-[#040913] rounded-lg hover:bg-[#00b8ae] transition-all font-medium text-[12px]"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00e0c7] text-[#040913] rounded-lg hover:bg-[#00b8ae] transition-all font-medium text-[12px]"
            >
              Submit Application
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components - Props with Validation
interface StepProps {
  formData: Record<string, any>;
  updateField: (field: string, value: any) => void;
  validationErrors: Record<string, boolean>;
  attemptedSubmit: boolean;
  highlightedField?: string | null;
}

// Helper component for field error message
function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return (
    <span className="text-[11px] text-[#f85c5c] mt-1 block">
      ⚠️ {message}
    </span>
  );
}

// Field label registry
const FIELD_LABELS: Record<string, string> = {
  fullNameEnglish: 'Full Name (English)',
  fullNameBangla: 'Full Name (Bangla)',
  fathersName: "Father's Name",
  mothersName: "Mother's Name",
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  maritalStatus: 'Marital Status',
  nationality: 'Nationality',
  nationalId: 'National ID Number',
  mobileNumber: 'Mobile Number',
  email: 'Email Address',
  presentAddress: 'Present Address',
  permanentAddress: 'Permanent Address',
  district: 'District',
  thana: 'Thana / Upazila',
  applyingForPost: 'Applying For Post',
  subjectDepartment: 'Subject / Department',
  examDegreeName1: 'Exam / Degree (1st Qualification)',
  examDegreeName2: 'Exam / Degree (2nd Qualification)',
  ntrcaStatus: 'NTRCA Registration Status',
  mpoExperience: 'MPO Experience',
  emergencyContactName: 'Emergency Contact Person',
  emergencyContactNumber: 'Emergency Contact Number',
  emergencyContactRelation: 'Emergency Contact Relation',
  signatureCanvas: 'Applicant Signature',
};

// Step names for the grouping headers in MissingFieldsPopup
const STEP_NAMES: Record<number, string> = {
  1:  'Basic Identity',
  2:  'Contact & Job',
  3:  'Academics',
  4:  'Professional',
  5:  'Teaching Experience',
  6:  'Skills',
  7:  'Personal Background',
  8:  'Documents',
  9:  'References',
  10: 'Declaration',
};

// Fields that are considered critical (shown with a red CRITICAL badge)
const CRITICAL_FIELDS = new Set([
  'fullNameEnglish',
  'nationalId',
  'dateOfBirth',
  'gender',
  'mobileNumber',
  'email',
  'signatureCanvas',
]);

// Enhanced portal-based draggable notification panel for missing fields
function MissingFieldsPopup({ 
  allFields, 
  formData, 
  currentStep, 
  onNavigate, 
  onClose,
  visible,
}: { 
  allFields: Array<{ step: number; field: string }>; 
  formData: Record<string, any>; 
  currentStep: number;
  onNavigate: (step: number, field: string) => void;
  onClose: () => void;
  visible: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string[]>([]);
  const [collapsedSteps, setCollapsedSteps] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);
  const prevMissingRef = useRef<string[]>([]);
  const prevVisibleRef = useRef(false);

  // Drag state
  const [pos, setPos] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth - 340 : 0,
    y: 88,
  }));
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const missingFields = allFields.filter(({ field }) => {
    const value = formData[field];
    return !value || (typeof value === 'string' && (value.trim() === '' || value === '-- Select --'));
  });

  const total = missingFields.length;
  const filledCount = allFields.length - total;
  const completionPct = (filledCount / allFields.length) * 100;

  // Shake on initial show (visible false → true)
  useEffect(() => {
    if (visible && !prevVisibleRef.current && total > 0) {
      setIsShaking(true);
      const t = setTimeout(() => setIsShaking(false), 600);
      prevVisibleRef.current = true;
      return () => clearTimeout(t);
    }
    if (!visible) prevVisibleRef.current = false;
  }, [visible, total]);

  // Track newly completed fields to animate them out
  useEffect(() => {
    const prevMissing = prevMissingRef.current;
    const currentMissing = missingFields.map(f => f.field);
    const newlyDone = prevMissing.filter(f => !currentMissing.includes(f));
    if (newlyDone.length > 0) {
      setJustCompleted(prev => [...prev, ...newlyDone]);
      setTimeout(() => {
        setJustCompleted(prev => prev.filter(f => !newlyDone.includes(f)));
      }, 650);
    }
    prevMissingRef.current = currentMissing;
  }, [formData]);

  // Confetti when all fields complete
  useEffect(() => {
    if (visible && total === 0 && !confettiFired) {
      setConfettiFired(true);
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 90,
          spread: 65,
          origin: { y: 0.5 },
          colors: ['#00e0c7', '#6366f1', '#fbbf24', '#f85c5c'],
        });
      });
    }
    if (!visible) setConfettiFired(false);
  }, [total, visible, confettiFired]);

  // Auto-close popup when all required fields are filled
  useEffect(() => {
    if (visible && total === 0) {
      const timer = setTimeout(() => onClose(), 2000);
      return () => clearTimeout(timer);
    }
  }, [total, visible, onClose]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [visible, onClose]);

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    isDraggingRef.current = false;
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: pos.x, startPosY: pos.y };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDraggingRef.current = true;
        setIsDragging(true);
      }
      const newX = Math.max(0, Math.min(window.innerWidth - 320, dragRef.current.startPosX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.startPosY + dy));
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      dragRef.current = null;
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!visible) return null;

  // Filter missing fields by search query
  const filteredMissing = searchQuery.trim()
    ? missingFields.filter(({ field }) =>
        (FIELD_LABELS[field] || field).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : missingFields;

  // Group filtered fields by step, preserving global indices for animation delay
  const groupedByStep: Record<number, Array<{ step: number; field: string; globalIndex: number }>> = {};
  filteredMissing.forEach((item, i) => {
    if (!groupedByStep[item.step]) groupedByStep[item.step] = [];
    groupedByStep[item.step].push({ ...item, globalIndex: i });
  });

  // Progress bar color: red → amber → green
  const barColor = completionPct >= 80 ? '#00e0c7' : completionPct >= 50 ? '#fbbf24' : '#f85c5c';
  const hasManyMissing = total > 10;

  // SVG ring circumference for r=9
  const circumference = 2 * Math.PI * 9;

  // Outer wrapper CSS classes
  const outerClasses = [
    'mfp-outer',
    isShaking                              ? 'mfp-shake'      : '',
    hasManyMissing && !isShaking           ? 'mfp-pulse-glow' : '',
    total > 0 && !isDragging && !isShaking ? 'mfp-float-anim' : '',
  ].filter(Boolean).join(' ');

  const content = (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 9999,
        width: '310px',
        fontFamily: 'inherit',
        animation: 'missingPopupSlideIn 0.32s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      {/* Gradient-border wrapper */}
      <div
        className={outerClasses}
        style={{ padding: '1px', borderRadius: '18px', boxShadow: '0 24px 64px rgba(0,0,0,0.65)' }}
      >
        {/* Glassmorphism panel */}
        <div
          style={{
            background: 'rgba(8,12,24,0.88)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            borderRadius: '17px',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {/* ── Header / drag handle ─────────────────── */}
          <div
            onMouseDown={onMouseDown}
            style={{
              padding: '14px 14px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'grab',
              borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Animated grip lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '2px', flexShrink: 0 }}>
                {[1, 0.65, 0.9].map((opacity, i) => (
                  <div
                    key={i}
                    style={{
                      width: '18px',
                      height: '2px',
                      borderRadius: '2px',
                      background: 'linear-gradient(90deg, #6366f1, #00e0c7)',
                      opacity,
                    }}
                  />
                ))}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e4ea', letterSpacing: '-0.01em' }}>
                  {total > 0 ? `${total} field${total !== 1 ? 's' : ''} required` : '✓ All fields complete!'}
                </div>
                <div style={{ fontSize: '10px', color: '#4a5272', marginTop: '2px' }}>
                  {filledCount}/{allFields.length} completed · Esc to close
                </div>
              </div>
            </div>

            <div
              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
              onMouseDown={e => e.stopPropagation()}
            >
              <button
                className="mfp-btn"
                onClick={() => setIsCollapsed(c => !c)}
                title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
                style={{
                  width: '26px', height: '26px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#6a7194', cursor: 'pointer', fontSize: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isCollapsed ? '▼' : '▲'}
              </button>
              <button
                className="mfp-btn"
                onClick={onClose}
                title="Close (Esc)"
                style={{
                  width: '26px', height: '26px', borderRadius: '8px',
                  border: '1px solid rgba(248,92,92,0.28)',
                  background: 'rgba(248,92,92,0.07)',
                  color: '#f85c5c', cursor: 'pointer', fontSize: '16px', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* ── Shimmer progress bar ─────────────────── */}
          <div style={{ height: '3px', background: 'rgba(0,0,0,0.4)' }}>
            <div
              className="mfp-progress-bar"
              style={{
                height: '100%',
                width: `${completionPct}%`,
                '--mfp-bar-color': barColor,
                borderRadius: '0 3px 3px 0',
              } as React.CSSProperties}
            />
          </div>

          {/* ── Accordion body ───────────────────────── */}
          <div
            className={`mfp-accordion${isCollapsed ? ' collapsed' : ''}`}
            style={{ maxHeight: isCollapsed ? '0' : '460px' }}
          >
            {/* Search input (shown when > 8 missing fields) */}
            {total > 8 && (
              <div style={{ padding: '8px 12px 4px' }} onMouseDown={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="🔍  Filter fields..."
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: '#e2e4ea',
                    fontSize: '11px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* ── Field list, grouped by step ───────── */}
            <div
              className="mfp-scroll"
              style={{ maxHeight: '370px', overflowY: 'auto', padding: '4px 0 8px' }}
            >
              {Object.entries(groupedByStep).map(([stepStr, items]) => {
                const stepNum = parseInt(stepStr, 10);
                const stepCollapsed = collapsedSteps.has(stepNum);
                const isStepCurrent = stepNum === currentStep;
                const stepName = STEP_NAMES[stepNum] || `Step ${stepNum}`;

                return (
                  <div key={stepStr}>
                    {/* Step group header */}
                    <div
                      onClick={() =>
                        setCollapsedSteps(prev => {
                          const next = new Set(prev);
                          if (next.has(stepNum)) next.delete(stepNum);
                          else next.add(stepNum);
                          return next;
                        })
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px 4px',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <span style={{ fontSize: '11px' }}>⚠️</span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: '10px',
                          fontWeight: 700,
                          color: isStepCurrent ? '#818cf8' : '#4a5272',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                        }}
                      >
                        Step {stepNum} — {stepName}
                        <span style={{ fontWeight: 400, marginLeft: '4px' }}>({items.length})</span>
                      </span>
                      <span style={{ fontSize: '9px', color: '#4a5272' }}>
                        {stepCollapsed ? '▶' : '▼'}
                      </span>
                    </div>

                    {/* Step group items */}
                    {!stepCollapsed &&
                      items.map(({ step, field, globalIndex }) => {
                        const isOnCurrentStep = step === currentStep;
                        const isJustDone = justCompleted.includes(field);
                        const isCritical = CRITICAL_FIELDS.has(field);
                        const ringFill = circumference * ((total - globalIndex) / total) * 0.72;

                        return (
                          <div
                            key={`${step}-${field}`}
                            className={`mfp-item${isJustDone ? ' mfp-item-done' : ''}`}
                            onClick={() => !isJustDone && onNavigate(step, field)}
                            title={`Step ${stepNum} — ${stepName}${isCritical ? ' · Critical field' : ' · Required field'}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 14px',
                              cursor: 'pointer',
                              background: isOnCurrentStep ? 'rgba(99,102,241,0.08)' : 'transparent',
                              animation: `mfpFieldIn 0.3s ease ${globalIndex * 0.04}s both`,
                            }}
                          >
                            {/* Numbered circle with SVG ring */}
                            <div style={{ position: 'relative', width: '22px', height: '22px', flexShrink: 0 }}>
                              <svg width="22" height="22" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <circle
                                  cx="11" cy="11" r="9"
                                  fill="none"
                                  stroke="rgba(99,102,241,0.12)"
                                  strokeWidth="1.5"
                                />
                                <circle
                                  cx="11" cy="11" r="9"
                                  fill="none"
                                  stroke={isOnCurrentStep ? '#6366f1' : isCritical ? '#f85c5c' : '#2a2a4a'}
                                  strokeWidth="1.5"
                                  strokeDasharray={String(circumference)}
                                  strokeDashoffset={String(circumference - ringFill)}
                                  strokeLinecap="round"
                                  transform="rotate(-90 11 11)"
                                  style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.2s ease' }}
                                />
                              </svg>
                              <div
                                style={{
                                  position: 'absolute', top: 0, left: 0,
                                  width: '22px', height: '22px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '10px', fontWeight: 700,
                                  color: isOnCurrentStep ? '#818cf8' : isCritical ? '#f87171' : '#4a5272',
                                }}
                              >
                                {globalIndex + 1}
                              </div>
                            </div>

                            <span
                              style={{
                                flex: 1,
                                fontSize: '12px',
                                color: isOnCurrentStep ? '#e2e4ea' : '#8d98ae',
                                lineHeight: 1.3,
                              }}
                            >
                              {FIELD_LABELS[field] || field}
                            </span>

                            {/* Priority badges */}
                            {isCritical && (
                              <span
                                style={{
                                  fontSize: '8px', padding: '2px 5px', borderRadius: '4px',
                                  background: 'rgba(248,92,92,0.12)',
                                  color: '#f87171',
                                  fontWeight: 700, letterSpacing: '0.04em',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                CRITICAL
                              </span>
                            )}
                            {!isOnCurrentStep && !isCritical && (
                              <span
                                style={{
                                  fontSize: '9px', padding: '2px 6px', borderRadius: '5px',
                                  background: 'rgba(18,18,42,0.8)', color: '#4a5272',
                                  fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap',
                                }}
                              >
                                Step {step}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}

              {/* No search results */}
              {filteredMissing.length === 0 && total > 0 && (
                <div
                  style={{
                    padding: '16px 14px', textAlign: 'center',
                    color: '#4a5272', fontSize: '12px',
                  }}
                >
                  No fields match your search.
                </div>
              )}

              {/* All done */}
              {total === 0 && (
                <div
                  className="mfp-all-done"
                  style={{
                    padding: '22px 14px', textAlign: 'center',
                    color: '#00e0c7', fontSize: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>✓</span>
                  All required fields completed!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}

function Step1BasicIdentity({ formData, updateField, validationErrors, attemptedSubmit, highlightedField }: StepProps) {
  const showError = (fieldName: string) => attemptedSubmit && validationErrors[fieldName];
  const isHighlighted = (fieldName: string) => highlightedField === fieldName;
  
  const getFieldWrapperClass = (fieldName: string) => {
    const hasError = showError(fieldName);
    const isGlow = isHighlighted(fieldName);
    
    if (isGlow) {
      return 'p-2 bg-[rgba(0,224,199,0.08)] border-2 border-[#00e0c7] rounded shadow-[0_0_20px_rgba(0,224,199,0.3)] animate-pulse';
    }
    if (hasError) {
      return 'p-2 bg-[rgba(248,92,92,0.05)] border border-[rgba(248,92,92,0.2)] rounded';
    }
    return '';
  };

  return (
    <>
      <FormSection title="Basic Identity · ব্যক্তিগত পরিচয়" icon="👤">
        <PhotoUpload />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="field-fullNameEnglish" className={getFieldWrapperClass('fullNameEnglish')}>
            <FormField
              label="Full Name (English)"
              sublabel="পূর্ণ নাম (ইংরেজি)"
              placeholder="As per National ID"
              required
              value={formData.fullNameEnglish || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('fullNameEnglish', e.target.value)}
            />
            <FieldError show={showError('fullNameEnglish')} message="Full name is required" />
          </div>
          <div id="field-fullNameBangla" className={getFieldWrapperClass('fullNameBangla')}>
            <FormField
              label="পূর্ণ নাম (বাংলা)"
              sublabel="Full Name (Bangla)"
              placeholder="বাংলায় লিখুন"
              bengali
              required
              value={formData.fullNameBangla || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('fullNameBangla', e.target.value)}
            />
            <FieldError show={showError('fullNameBangla')} message="Bangla name is required" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="field-fathersName" className={getFieldWrapperClass('fathersName')}>
            <FormField
              label="Father's Name"
              sublabel="পিতার নাম"
              placeholder="Father's full name"
              required
              value={formData.fathersName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('fathersName', e.target.value)}
            />
            <FieldError show={showError('fathersName')} message="Father's name is required" />
          </div>
          <div id="field-mothersName" className={getFieldWrapperClass('mothersName')}>
            <FormField
              label="Mother's Name"
              sublabel="মাতার নাম"
              placeholder="Mother's full name"
              required
              value={formData.mothersName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('mothersName', e.target.value)}
            />
            <FieldError show={showError('mothersName')} message="Mother's name is required" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div id="field-dateOfBirth" className={getFieldWrapperClass('dateOfBirth')}>
            <DateField
              label="Date of Birth"
              sublabel="জন্ম তারিখ"
              required
              value={formData.dateOfBirth || ''}
              onChange={(value: string) => updateField('dateOfBirth', value)}
            />
            <FieldError show={showError('dateOfBirth')} message="Date of birth is required" />
          </div>
          <div id="field-gender" className={getFieldWrapperClass('gender')}>
            <FormField
              label="Gender"
              sublabel="লিঙ্গ"
              type="select"
              options={['', 'Male', 'Female', 'Other']}
              required
              value={formData.gender || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('gender', e.target.value)}
            />
            <FieldError show={showError('gender')} message="Gender is required" />
          </div>
          <div id="field-maritalStatus" className={getFieldWrapperClass('maritalStatus')}>
            <FormField
              label="Marital Status"
              sublabel="বৈবাহিক অবস্থা"
              type="select"
              options={['', 'Single', 'Married', 'Divorced', 'Widowed']}
              required
              value={formData.maritalStatus || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('maritalStatus', e.target.value)}
            />
            <FieldError show={showError('maritalStatus')} message="Marital status is required" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="field-nationality" className={getFieldWrapperClass('nationality')}>
            <FormField
              label="Nationality"
              sublabel="জাতীয়তা"
              placeholder="e.g., Bangladeshi"
              defaultValue="Bangladeshi"
              required
              value={formData.nationality || 'Bangladeshi'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('nationality', e.target.value)}
            />
            <FieldError show={showError('nationality')} message="Nationality is required" />
          </div>
          <div id="field-nationalId" className={getFieldWrapperClass('nationalId')}>
            <FormField
              label="National ID Number"
              sublabel="জাতীয় পরিচয়পত্র নম্বর"
              placeholder="NID Number"
              maxLength={17}
              required
              value={formData.nationalId || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('nationalId', e.target.value)}
            />
            <FieldError show={showError('nationalId')} message="National ID is required" />
          </div>
        </div>

        <FormField
          label="Birth Registration Number"
          sublabel="জন্ম নিবন্ধন নম্বর (Optional)"
          placeholder="17-digit number"
          maxLength={17}
          value={formData.birthRegistrationNumber || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('birthRegistrationNumber', e.target.value)}
        />
      </FormSection>
    </>
  );
}

function Step2ContactJob({ formData, updateField, validationErrors, attemptedSubmit, highlightedField }: StepProps) {
  const showError = (fieldName: string) => attemptedSubmit && validationErrors[fieldName];
  const getFieldWrapperClass = (fieldName: string) => {
    if (highlightedField === fieldName) return 'p-2 bg-[rgba(0,224,199,0.08)] border-2 border-[#00e0c7] rounded shadow-[0_0_20px_rgba(0,224,199,0.3)] animate-pulse';
    if (showError(fieldName)) return 'p-2 bg-[rgba(248,92,92,0.05)] border border-[rgba(248,92,92,0.2)] rounded';
    return '';
  };

  return (
    <>
      <FormSection title="Contact Information · যোগাযোগের তথ্য" icon="📞">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div id="field-mobileNumber" className={getFieldWrapperClass('mobileNumber')}>
            <FormField label="Mobile Number" sublabel="মোবাইল নম্বর" type="tel" placeholder="+880 1X-XXXX-XXXX" required value={formData.mobileNumber || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('mobileNumber', e.target.value)} />
            <FieldError show={showError('mobileNumber')} message="Mobile number is required" />
          </div>
          <FormField label="Alternative Mobile" sublabel="বিকল্প মোবাইল (Optional)" type="tel" placeholder="+880 1X-XXXX-XXXX" value={formData.alternativeMobile || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('alternativeMobile', e.target.value)} />
          <div id="field-email" className={getFieldWrapperClass('email')}>
            <FormField label="Email Address" sublabel="ইমেইল" type="email" placeholder="teacher@example.com" required value={formData.email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('email', e.target.value)} />
            <FieldError show={showError('email')} message="Email is required" />
          </div>
        </div>

        <div id="field-presentAddress" className={getFieldWrapperClass('presentAddress')}>
          <FormField label="Present Address" sublabel="বর্তমান ঠিকানা" type="textarea" placeholder="House, Road, Area..." rows={3} required value={formData.presentAddress || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('presentAddress', e.target.value)} />
          <FieldError show={showError('presentAddress')} message="Present address is required" />
        </div>

        <div id="field-permanentAddress" className={getFieldWrapperClass('permanentAddress')}>
          <FormField label="Permanent Address" sublabel="স্থায়ী ঠিকানা" type="textarea" placeholder="House, Road, Area..." rows={3} required value={formData.permanentAddress || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('permanentAddress', e.target.value)} />
          <FieldError show={showError('permanentAddress')} message="Permanent address is required" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div id="field-district" className={getFieldWrapperClass('district')}>
            <FormField label="District" sublabel="জেলা" type="select" options={['', 'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Comilla', 'Mymensingh', 'Rangpur', 'Gazipur', 'Narayanganj', 'Tangail', 'Jessore', 'Bogra', 'Dinajpur', 'Other']} required value={formData.district || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('district', e.target.value)} />
            <FieldError show={showError('district')} message="District is required" />
          </div>
          <div id="field-thana" className={getFieldWrapperClass('thana')}>
            <FormField label="Thana / Upazila" sublabel="থানা / উপজেলা" placeholder="Thana or Upazila name" required value={formData.thana || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('thana', e.target.value)} />
            <FieldError show={showError('thana')} message="Thana / Upazila is required" />
          </div>
          <FormField label="Post Code" sublabel="পোস্টাল কোড" placeholder="e.g. 1207" maxLength={6} value={formData.postCode || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('postCode', e.target.value)} />
        </div>
      </FormSection>

      <FormSection title="Job Application Details · পদের তথ্য" icon="💼">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="field-applyingForPost" className={getFieldWrapperClass('applyingForPost')}>
            <FormField label="Applying For Post" sublabel="পদের নাম" type="select" options={['', 'Assistant Teacher', 'Senior Teacher', 'Subject Teacher', 'Lecturer', 'Senior Lecturer', 'Head of Department', 'Lab Assistant']} required value={formData.applyingForPost || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('applyingForPost', e.target.value)} />
            <FieldError show={showError('applyingForPost')} message="Applying post is required" />
          </div>
          <div id="field-subjectDepartment" className={getFieldWrapperClass('subjectDepartment')}>
            <FormField label="Subject / Department" sublabel="বিষয়" type="select" options={['', 'Bangla', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'ICT / Computer Science', 'History', 'Geography', 'Economics', 'Accounting', 'Business Studies', 'Islamic Studies', 'Civics', 'Arts & Crafts', 'Physical Education', 'Other']} required value={formData.subjectDepartment || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('subjectDepartment', e.target.value)} />
            <FieldError show={showError('subjectDepartment')} message="Subject / Department is required" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField label="Expected Joining Date" sublabel="যোগদানের তারিখ" required value={formData.expectedJoiningDate || ''} onChange={(value) => updateField('expectedJoiningDate', value)} />
          <FormField label="Employment Type" sublabel="চাকরির ধরন" type="select" options={['', 'Full-time', 'Part-time', 'Contractual']} required value={formData.employmentType || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('employmentType', e.target.value)} />
        </div>
      </FormSection>
    </>
  );
}

function Step3Academics({ formData, updateField, validationErrors, attemptedSubmit }: StepProps) {
  return (
    <FormSection title="Academic Qualifications · শিক্ষাগত যোগ্যতা" icon="🎓">
      {/* Qualification #1 - SSC (Default) */}
      <div className="mb-6 p-5 bg-[#0f1524] border border-[#1c2540] rounded-lg">
        <h3 className="text-[11px] tracking-[0.1em] uppercase text-[#00e0c7] mb-4">Qualification #1</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div id="field-examDegreeName1">
            <FormField
              label="Exam / Degree Name"
              sublabel="পরীক্ষা / ডিগ্রি"
              type="select"
              options={['-- Select --', 'SSC', 'HSC', 'Dakhil', 'Alim', 'Fazil', 'Kamil', 'Diploma', 'Honours / B.A. / B.Sc. / B.Com', 'Masters / M.A. / M.Sc. / M.Com', 'B.Ed', 'M.Ed', 'Ph.D', 'Other']}
              required
              value={formData.examDegreeName1 || '-- Select --'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('examDegreeName1', e.target.value)}
            />
            <FieldError show={attemptedSubmit && validationErrors.examDegreeName1} message="Qualification #1 is required" />
          </div>
          <FormField
            label="Group / Subject"
            sublabel="বিভাগ / বিষয়"
            placeholder="e.g. Science, Arts, Mathematics"
          />
          <FormField
            label="Board / University"
            sublabel="বোর্ড / বিশ্ববিদ্যালয়"
            placeholder="Board or University name"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            label="Institution Name"
            sublabel="প্রতিষ্ঠানের নাম"
            placeholder="School / College / University"
          />
          <FormField
            label="Passing Year"
            sublabel="পাশের সাল"
            type="number"
            placeholder="e.g. 2015"
            min={1970}
            max={2030}
          />
          <FormField
            label="Result / GPA / CGPA"
            sublabel="ফলাফল / জিপিএ"
            placeholder="e.g. GPA 5.00 / A+ / Division 1"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 items-start">
          <FormField
            label="Out Of"
            sublabel="সর্বোচ্চ নম্বর"
            placeholder="e.g. 5.00 / 4.00 / 800"
          />
          <FormField
            label="Duration"
            sublabel="মেয়াদকাল"
            placeholder="e.g. 2 years / 4 semesters"
          />
          <div className="h-full flex flex-col">
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2 leading-tight">
              Certificate Upload<br/>সনদ যুক্ত করুন
            </label>
            <div className="flex-1 relative flex flex-col items-center justify-center gap-2 w-full min-h-[100px] px-4 py-4 border-2 border-dashed border-[#1c2540] rounded-lg hover:border-[#00e0c7] hover:bg-[#0f1524] transition-all bg-[#0d1220]">
              <input
                type="file"
                accept=".pdf,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-[16px]">📎</span>
              <span className="text-[11px] text-[#6a7194]">Browse file</span>
            </div>
          </div>
          <div className="h-full flex flex-col">
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2 leading-tight">
              Transcript/Marksheet<br/>ট্রান্সক্রিপ্ট/মার্কশিট
            </label>
            <div className="flex-1 relative flex flex-col items-center justify-center gap-2 w-full min-h-[100px] px-4 py-4 border-2 border-dashed border-[#1c2540] rounded-lg hover:border-[#00e0c7] hover:bg-[#0f1524] transition-all bg-[#0d1220]">
              <input
                type="file"
                accept=".pdf,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-[16px]">📄</span>
              <span className="text-[11px] text-[#6a7194]">Browse file</span>
            </div>
          </div>
        </div>
      </div>

      {/* Qualification #2 - HSC (Default) */}
      <div className="mb-6 p-5 bg-[#0f1524] border border-[#1c2540] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] tracking-[0.1em] uppercase text-[#00e0c7]">Qualification #2</h3>
          <button className="w-6 h-6 rounded-full border border-[rgba(240,113,113,0.3)] bg-[rgba(240,113,113,0.15)] text-[#f07171] flex items-center justify-center text-[14px] hover:bg-[#f07171] hover:text-white transition-colors" title="Remove">×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div id="field-examDegreeName2">
            <FormField
              label="Exam / Degree Name"
              sublabel="পরীক্ষা / ডিগ্রি"
              type="select"
              options={['-- Select --', 'SSC', 'HSC', 'Dakhil', 'Alim', 'Fazil', 'Kamil', 'Diploma', 'Honours / B.A. / B.Sc. / B.Com', 'Masters / M.A. / M.Sc. / M.Com', 'B.Ed', 'M.Ed', 'Ph.D', 'Other']}
              required
              value={formData.examDegreeName2 || '-- Select --'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('examDegreeName2', e.target.value)}
            />
            <FieldError show={attemptedSubmit && validationErrors.examDegreeName2} message="Qualification #2 is required" />
          </div>
          <FormField
            label="Group / Subject"
            sublabel="বিভাগ / বিষয়"
            placeholder="e.g. Science, Arts, Mathematics"
          />
          <FormField
            label="Board / University"
            sublabel="বোর্ড / বিশ্ববিদ্যালয়"
            placeholder="Board or University name"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            label="Institution Name"
            sublabel="প্রতিষ্ঠানের নাম"
            placeholder="School / College / University"
          />
          <FormField
            label="Passing Year"
            sublabel="পাশের সাল"
            type="number"
            placeholder="e.g. 2017"
            min={1970}
            max={2030}
          />
          <FormField
            label="Result / GPA / CGPA"
            sublabel="ফলাফল / জিপিএ"
            placeholder="e.g. GPA 5.00 / A+ / Division 1"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 items-start">
          <FormField
            label="Out Of"
            sublabel="সর্বোচ্চ নম্বর"
            placeholder="e.g. 5.00 / 4.00 / 800"
          />
          <FormField
            label="Duration"
            sublabel="মেয়াদকাল"
            placeholder="e.g. 2 years / 4 semesters"
          />
          <div className="h-full flex flex-col">
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2 leading-tight">
              Certificate Upload<br/>সনদ যুক্ত করুন
            </label>
            <div className="flex-1 relative flex flex-col items-center justify-center gap-2 w-full min-h-[100px] px-4 py-4 border-2 border-dashed border-[#1c2540] rounded-lg hover:border-[#00e0c7] hover:bg-[#0f1524] transition-all bg-[#0d1220]">
              <input
                type="file"
                accept=".pdf,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-[16px]">📎</span>
              <span className="text-[11px] text-[#6a7194]">Browse file</span>
            </div>
          </div>
          <div className="h-full flex flex-col">
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2 leading-tight">
              Transcript/Marksheet<br/>ট্রান্সক্রিপ্ট/মার্কশিট
            </label>
            <div className="flex-1 relative flex flex-col items-center justify-center gap-2 w-full min-h-[100px] px-4 py-4 border-2 border-dashed border-[#1c2540] rounded-lg hover:border-[#00e0c7] hover:bg-[#0f1524] transition-all bg-[#0d1220]">
              <input
                type="file"
                accept=".pdf,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-[16px]">📄</span>
              <span className="text-[11px] text-[#6a7194]">Browse file</span>
            </div>
          </div>
        </div>
      </div>

      <button className="text-[11px] px-4 py-2 bg-[rgba(0,224,199,0.08)] border border-dashed border-[rgba(0,224,199,0.4)] text-[#00e0c7] rounded hover:bg-[rgba(0,224,199,0.15)] transition-colors">
        ＋ Add Qualification
      </button>
    </FormSection>
  );
}

function Step4ProfessionalQualifications({ formData, updateField, validationErrors, attemptedSubmit, highlightedField }: StepProps) {
  const [hasQualifications, setHasQualifications] = useState(true);
  const showError = (fieldName: string) => attemptedSubmit && validationErrors[fieldName];
  const getFieldWrapperClass = (fieldName: string) => {
    if (highlightedField === fieldName) return 'p-2 bg-[rgba(0,224,199,0.08)] border-2 border-[#00e0c7] rounded shadow-[0_0_20px_rgba(0,224,199,0.3)] animate-pulse';
    if (showError(fieldName)) return 'p-2 bg-[rgba(248,92,92,0.05)] border border-[rgba(248,92,92,0.2)] rounded';
    return '';
  };

  return (
    <FormSection title="Professional & Teaching Qualifications" sublabel="পেশাগত যোগ্যতা ও প্রশিক্ষণ" icon="📜">
      <div className="mb-6">
        <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
          Do you have professional qualifications? · আপনার পেশাগত যোগ্যতা আছে?
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setHasQualifications(true)} className={`px-4 py-2 rounded text-[12px] transition-all ${hasQualifications ? 'bg-[#00e0c7] text-[#040913] font-medium' : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'}`}>Yes</button>
          <button type="button" onClick={() => { setHasQualifications(false); updateField('ntrcaStatus', 'Not Applicable'); updateField('mpoExperience', 'No'); }} className={`px-4 py-2 rounded text-[12px] transition-all ${!hasQualifications ? 'bg-[#f85c5c] text-white font-medium' : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'}`}>No</button>
        </div>
      </div>

      {hasQualifications && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="B.Ed / M.Ed Degree" sublabel="বি.এড / এম.এড ডিগ্রি" type="select" options={['Select', 'B.Ed', 'M.Ed', 'Both B.Ed and M.Ed', 'Not Applicable']} value={formData.bedMedDegree || 'Select'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('bedMedDegree', e.target.value)} />
            <div id="field-ntrcaStatus" className={getFieldWrapperClass('ntrcaStatus')}>
              <FormField label="NTRCA Status" sublabel="এনটিআরসিএ অবস্থা" type="select" options={['', 'Registered (Certificate Obtained)', 'Awaiting Result', 'Not Registered', 'Exempted']} required value={formData.ntrcaStatus || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('ntrcaStatus', e.target.value)} />
              <FieldError show={showError('ntrcaStatus')} message="NTRCA status is required" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="NTRCA Certificate Number" sublabel="এনটিআরসিএ সার্টিফিকেট নম্বর" placeholder="If registered" value={formData.ntrcaCertificateNumber || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('ntrcaCertificateNumber', e.target.value)} />
            <FormField label="NTRCA Level" sublabel="এনটিআরসিএ লেভেল" type="select" options={['Select', 'School', 'School-2', 'College', 'N/A']} value={formData.ntrcaLevel || 'Select'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('ntrcaLevel', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div id="field-mpoExperience" className={getFieldWrapperClass('mpoExperience')}>
              <FormField label="MPO Experience" sublabel="এমপিও অভিজ্ঞতা" type="select" options={['', 'Yes', 'No']} required value={formData.mpoExperience || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('mpoExperience', e.target.value)} />
              <FieldError show={showError('mpoExperience')} message="MPO experience is required" />
            </div>
            <FormField label="Teaching License / Certification" sublabel="শিক্ষকতা লাইসেন্স (Optional)" placeholder="Certificate name if any" value={formData.teachingLicense || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('teachingLicense', e.target.value)} />
          </div>

          <FormField label="Training Received" sublabel="গৃহীত প্রশিক্ষণ (Optional)" type="textarea" placeholder="List any training programs, workshops, or professional development received..." rows={4} value={formData.trainingReceived || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('trainingReceived', e.target.value)} />
        </>
      )}
    </FormSection>
  );
}

function Step5TeachingExperience({ formData, updateField, validationErrors, attemptedSubmit }: StepProps) {
  const [hasExperience, setHasExperience] = useState(true);
  const [experiences, setExperiences] = useState([
    { id: 1, institutionName: '', institutionType: '', subjectTaught: '', classRange: '', servingTime: '', currentlyWorking: 'No', reasonForLeaving: '' }
  ]);
  
  const addExperience = () => {
    const newId = experiences.length > 0 ? Math.max(...experiences.map(e => e.id)) + 1 : 1;
    setExperiences([...experiences, { 
      id: newId, 
      institutionName: '', 
      institutionType: '', 
      subjectTaught: '', 
      classRange: '', 
      servingTime: '', 
      currentlyWorking: 'No', 
      reasonForLeaving: '' 
    }]);
  };
  
  const removeExperience = (id: number) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };
  
  const updateExperience = (id: number, field: string, value: string) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };
  
  return (
    <FormSection title="Work Experience · কর্ম অভিজ্ঞতা" icon="💼">
      <div className="mb-6">
        <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
          Do you have teaching experience? · আপনার শিক্ষকতার অভিজ্ঞতা আছে?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHasExperience(true)}
            className={`px-4 py-2 rounded text-[12px] transition-all ${
              hasExperience
                ? 'bg-[#00e0c7] text-[#040913] font-medium'
                : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setHasExperience(false)}
            className={`px-4 py-2 rounded text-[12px] transition-all ${
              !hasExperience
                ? 'bg-[#f85c5c] text-white font-medium'
                : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {hasExperience && (
        <>
          {experiences.map((exp, index) => (
            <div key={exp.id} className="mb-6 p-5 bg-[#0f1524] border border-[#1c2540] rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] tracking-[0.1em] uppercase text-[#00e0c7]">
                  Experience #{index + 1} · অভিজ্ঞতা #{index + 1}
                </h3>
                {experiences.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="w-6 h-6 rounded-full border border-[rgba(240,113,113,0.3)] bg-[rgba(240,113,113,0.15)] text-[#f07171] flex items-center justify-center text-[14px] hover:bg-[#f07171] hover:text-white transition-colors"
                    title="Remove Experience"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField 
                    label="Institution Name" 
                    sublabel="প্রতিষ্ঠানের নাম" 
                    placeholder="School / College name"
                    value={exp.institutionName}
                    onChange={(e) => updateExperience(exp.id, 'institutionName', e.target.value)}
                  />
                  <FormField 
                    label="Institution Type" 
                    sublabel="প্রতিষ্ঠানের ধরন" 
                    type="select"
                    options={['Select Type', 'School', 'College', 'University', 'Private Tutoring', 'Coaching Center', 'Other']}
                    value={exp.institutionType}
                    onChange={(e) => updateExperience(exp.id, 'institutionType', e.target.value)}
                  />
                  <FormField 
                    label="Subject Taught" 
                    sublabel="পড়ানো বিষয়" 
                    placeholder="e.g. Physics, Mathematics"
                    value={exp.subjectTaught}
                    onChange={(e) => updateExperience(exp.id, 'subjectTaught', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <FormField 
                    label="Class Range Taught" 
                    sublabel="পড়ানো শ্রেণির সীমা" 
                    placeholder="e.g. Class 9-12"
                    value={exp.classRange}
                    onChange={(e) => updateExperience(exp.id, 'classRange', e.target.value)}
                  />
                  <FormField 
                    label="Serving / Total Time" 
                    sublabel="কর্মকাল / মোট সময়" 
                    placeholder="e.g. 3 years 6 months"
                    value={exp.servingTime}
                    onChange={(e) => updateExperience(exp.id, 'servingTime', e.target.value)}
                  />
                  <div>
                    <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
                      Currently Working Here? · এখানে এখনও কাজ করছেন?
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateExperience(exp.id, 'currentlyWorking', 'Yes')}
                        className={`px-4 py-2 rounded text-[12px] transition-all ${
                          exp.currentlyWorking === 'Yes'
                            ? 'bg-[#00e0c7] text-[#040913] font-medium'
                            : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => updateExperience(exp.id, 'currentlyWorking', 'No')}
                        className={`px-4 py-2 rounded text-[12px] transition-all ${
                          exp.currentlyWorking === 'No'
                            ? 'bg-[#00e0c7] text-[#040913] font-medium'
                            : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {exp.currentlyWorking === 'No' && (
                  <FormField
                    label="Reason for Leaving"
                    sublabel="ছেড়ে যাওয়ার কারণ"
                    placeholder="e.g. Better opportunity, Contract ended"
                    value={exp.reasonForLeaving}
                    onChange={(e) => updateExperience(exp.id, 'reasonForLeaving', e.target.value)}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="pt-2 pb-6">
            <button 
              type="button"
              onClick={addExperience}
              className="text-[11px] px-4 py-2 bg-[rgba(0,224,199,0.08)] border border-[rgba(0,224,199,0.25)] text-[#00e0c7] rounded hover:bg-[rgba(0,224,199,0.12)] transition-colors"
            >
              + Add Another Experience
            </button>
          </div>
        </>
      )}

      <FormField
        label="Why do you want to work with us?"
        sublabel="আমাদের সাথে কেন কাজ করতে চান?"
        type="textarea"
        placeholder="Describe your motivation and reasons for wanting to join our institution..."
        rows={4}
      />
    </FormSection>
  );
}

function Step6SuitabilitySkills({ formData, updateField, validationErrors, attemptedSubmit }: StepProps) {
  const [classesHandled, setClassesHandled] = useState<string[]>([]);
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [additionalSubjects, setAdditionalSubjects] = useState<string[]>([]);
  const [coaching, setCoaching] = useState('No');
  const [examInvigilation, setExamInvigilation] = useState('Yes');
  const [classTeacherDuty, setClassTeacherDuty] = useState('Yes');
  const [coCurricular, setCoCurricular] = useState('Yes');
  const [softwareSkills, setSoftwareSkills] = useState<string[]>([]);
  const [ictSkillsLevel, setIctSkillsLevel] = useState('Select');
  const [hasIctCertificates, setHasIctCertificates] = useState(false);
  const [ictCertificates, setIctCertificates] = useState([{ id: 1, file: null as File | null }]);
  const [hasAdditionalSkills, setHasAdditionalSkills] = useState(false);
  const [hasIctSkills, setHasIctSkills] = useState(false);
  const [hasLanguageCertificates, setHasLanguageCertificates] = useState(false);
  const [languageCertificates, setLanguageCertificates] = useState([{ id: 1, file: null as File | null }]);

  const addLanguageCertificate = () => {
    const newId = languageCertificates.length > 0 ? Math.max(...languageCertificates.map(c => c.id)) + 1 : 1;
    setLanguageCertificates([...languageCertificates, { id: newId, file: null }]);
  };

  const removeLanguageCertificate = (id: number) => {
    setLanguageCertificates(languageCertificates.filter(cert => cert.id !== id));
  };

  const clearLanguageCertificate = (id: number) => {
    setLanguageCertificates(languageCertificates.map(cert => 
      cert.id === id ? { ...cert, file: null } : cert
    ));
    const input = document.getElementById(`lang-cert-${id}`) as HTMLInputElement;
    if (input) input.value = '';
  };

  const addIctCertificate = () => {
    const newId = ictCertificates.length > 0 ? Math.max(...ictCertificates.map(c => c.id)) + 1 : 1;
    setIctCertificates([...ictCertificates, { id: newId, file: null }]);
  };

  const removeIctCertificate = (id: number) => {
    setIctCertificates(ictCertificates.filter(cert => cert.id !== id));
  };

  const clearIctCertificate = (id: number) => {
    setIctCertificates(ictCertificates.map(cert => 
      cert.id === id ? { ...cert, file: null } : cert
    ));
    const input = document.getElementById(`ict-cert-${id}`) as HTMLInputElement;
    if (input) input.value = '';
  };
  
  const toggleClass = (cls: string) => {
    setClassesHandled(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };
  
  const isPrimaryClassSelected = classesHandled.includes('Class 0-5');
  const isSecondaryClassSelected = classesHandled.includes('Class 6-8');
  const isClass9to10Selected = classesHandled.includes('Class 9/10');
  
  const primarySubjects0to5 = [
    { value: 'Quran Majid and Tajbid', label: 'কুরআন মাজিদ ও তাজভিদ · Quran Majid & Tajbid' },
    { value: 'Aqaid and Fiqh', label: 'আকাইদ ও ফিকহ · Aqaid & Fiqh' },
    { value: 'Arabic', label: 'আদ্দুরুসুল আরাবিয়্যাহ / আরবি · Arabic' },
    { value: 'Bengali', label: 'আমার বাংলা বই · Bengali' },
    { value: 'English', label: 'English For Today · English' },
    { value: 'Primary Mathematics', label: 'প্রাথমিক গণিত · Mathematics' }
  ];
  
  const secondarySubjects0to5 = [
    { value: 'Primary Science', label: 'প্রাথমিক বিজ্ঞান · Primary Science' },
    { value: 'Bangladesh and Global Studies', label: 'বাংলাদেশ ও বিশ্বপরিচয় · Bangladesh and Global Studies' }
  ];
  
  const primarySubjects6to8 = [
    { value: 'Quran Majid and Tajbid 6-8', label: 'কুরআন মাজিদ ও তাজভিদ · Quran Majid & Tajbid' },
    { value: 'Aqaid and Fiqh 6-8', label: 'আকাইদ ও ফিকহ · Aqaid & Fiqh' },
    { value: 'Arabic 1st and 2nd Paper', label: 'আরবি ১ম ও ২য় পত্র · Arabic 1st & 2nd Paper' },
    { value: 'Bengali 1st and 2nd Paper 6-8', label: 'বাংলা ১ম ও ২য় পত্র · Bengali 1st & 2nd Paper' },
    { value: 'English 1st and 2nd Paper 6-8', label: 'ইংরেজি ১ম ও ২য় পত্র · English 1st & 2nd Paper' },
    { value: 'Mathematics 6-8', label: 'গণিত · Mathematics' },
    { value: 'General Science', label: 'সাধারণ বিজ্ঞান · General Science' }
  ];
  
  const secondarySubjects6to8 = [
    { value: 'Bangladesh and Global Studies 6-8', label: 'বাংলাদেশ ও বিশ্বপরিচয় · Bangladesh & Global Studies' },
    { value: 'ICT 6-8', label: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT) · ICT' },
    { value: 'Agriculture or Home Science 6-8', label: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান (যেকোনো একটি) · Agriculture / Home Science' },
    { value: 'Career and Life Skills', label: 'কর্ম ও জীবনমুখী শিক্ষা · Career & Life Skills' },
    { value: 'Arts and Crafts', label: 'চারু ও কারুকলা · Arts & Crafts' }
  ];
  
  const primarySubjects9to10 = [
    { value: 'Quran Majid and Tajbid 9-10', label: 'কুরআন মাজিদ ও তাজভিদ · Quran Majid & Tajbid' },
    { value: 'Hadith Sharif', label: 'হাদিস শরিফ · Hadith Sharif' },
    { value: 'Aqaid and Fiqh 9-10', label: 'আকাইদ ও ফিকহ · Aqaid & Fiqh' },
    { value: 'Arabic 1st and 2nd Paper 9-10', label: 'আরবি ১ম ও ২য় পত্র · Arabic 1st & 2nd Paper' },
    { value: 'Bengali 1st and 2nd Paper 9-10', label: 'বাংলা ১ম ও ২য় পত্র · Bengali 1st & 2nd Paper' },
    { value: 'English 1st and 2nd Paper 9-10', label: 'ইংরেজি ১ম ও ২য় পত্র · English 1st & 2nd Paper' },
    { value: 'Mathematics 9-10', label: 'গণিত · Mathematics' },
    { value: 'ICT 9-10', label: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT) · ICT' }
  ];
  
  const secondarySubjects9to10 = [
    { value: 'History of Islam', label: 'ইসলামের ইতিহাস · History of Islam' },
    { value: 'Bangladesh and Global Studies 9-10', label: 'বাংলাদেশ ও বিশ্বপরিচয় · Bangladesh & Global Studies' },
    { value: 'Agriculture or Home Science 9-10', label: 'কৃষি শিক্ষা/গার্হস্থ্য বিজ্ঞান · Agriculture / Home Science' },
    { value: 'Physics', label: 'পদার্থবিজ্ঞান · Physics' },
    { value: 'Chemistry', label: 'রসায়ন · Chemistry' },
    { value: 'Biology', label: 'জীববিজ্ঞান · Biology' },
    { value: 'Higher Mathematics', label: 'উচ্চতর গণিত · Higher Mathematics' }
  ];
  
  // Helper function to merge subject arrays - union (all unique subjects)
  // Common subjects appear once, uncommon subjects appear individually
  const getUnion = (arrays: Array<typeof primarySubjects0to5>) => {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0];
    
    const merged: typeof primarySubjects0to5 = [];
    const seenValues = new Set<string>();
    
    // First pass: collect all unique subjects by value
    for (const arr of arrays) {
      for (const subject of arr) {
        if (!seenValues.has(subject.value)) {
          seenValues.add(subject.value);
          merged.push(subject);
        }
      }
    }
    
    return merged;
  };
  
  // Build arrays of selected primary and secondary subjects
  const selectedPrimaryArrays = [];
  const selectedSecondaryArrays = [];
  
  if (isPrimaryClassSelected) {
    selectedPrimaryArrays.push(primarySubjects0to5);
    selectedSecondaryArrays.push(secondarySubjects0to5);
  }
  if (isSecondaryClassSelected) {
    selectedPrimaryArrays.push(primarySubjects6to8);
    selectedSecondaryArrays.push(secondarySubjects6to8);
  }
  if (isClass9to10Selected) {
    selectedPrimaryArrays.push(primarySubjects9to10);
    selectedSecondaryArrays.push(secondarySubjects9to10);
  }
  
  // Get all unique subjects from selected classes (union)
  const primarySubjects = getUnion(selectedPrimaryArrays);
  const secondarySubjects = getUnion(selectedSecondaryArrays);
  
  // Filter out subjects already selected as preferred from additional list
  const availableAdditionalSubjects = primarySubjects.filter(
    subject => !preferredSubjects.includes(subject.value)
  );
  
  // Auto-remove from additional if selected as preferred
  useEffect(() => {
    setAdditionalSubjects(prev => prev.filter(sub => !preferredSubjects.includes(sub)));
  }, [preferredSubjects]);
  
  return (
    <>
      <FormSection title="Teaching Suitability & Skills" sublabel="পাঠদান উপযুক্ততা ও দক্ষতা" icon="🎯">
        <div>
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
            Classes Able to Handle · যে শ্রেণিগুলো পরিচালনা করতে পারেন <span className="text-[#f85c5c]">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {['Class 0-5', 'Class 6-8', 'Class 9/10'].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => toggleClass(cls)}
                className={`px-4 py-2 rounded text-[12px] transition-all ${
                  classesHandled.includes(cls)
                    ? 'bg-[#00e0c7] text-[#040913] font-medium'
                    : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isPrimaryClassSelected || isSecondaryClassSelected || isClass9to10Selected ? (
            <>
              <div>
                <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
                  Preferred Subjects to Teach · পাঠদানের জন্য পছন্দের বিষয় <span className="text-[#f85c5c]">*</span>
                </label>
                <CheckboxGroup
                  options={primarySubjects}
                  selected={preferredSubjects}
                  onChange={setPreferredSubjects}
                  columns={2}
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
                  Additional Subjects Able to Teach · অতিরিক্ত বিষয় যেগুলো পড়াতে পারেন
                </label>
                <CheckboxGroup
                  options={secondarySubjects}
                  selected={additionalSubjects}
                  onChange={setAdditionalSubjects}
                  columns={2}
                />
              </div>
            </>
          ) : (
            <div className="col-span-2 p-6 bg-[#0d1220] border border-[#1c2540] rounded-lg text-center">
              <p className="text-[12px] text-[#6a7194]">
                Please select at least one class to view available subjects
              </p>
              <p className="text-[11px] text-[#4a5068] mt-1">
                অন্তত একটি শ্রেণি নির্বাচন করুন বিষয়গুলো দেখতে
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
              Coaching / Private Tutoring? · কোচিং/প্রাইভেট টিউটরিং? <span className="text-[#f85c5c]">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCoaching('Yes')}
                className={`px-4 py-2 rounded text-[12px] transition-all ${
                  coaching === 'Yes'
                    ? 'bg-[#00e0c7] text-[#040913] font-medium'
                    : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setCoaching('No')}
                className={`px-4 py-2 rounded text-[12px] transition-all ${
                  coaching === 'No'
                    ? 'bg-[#00e0c7] text-[#040913] font-medium'
                    : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
              Willing: Exam Invigilation? · পরীক্ষা পর্যবেক্ষণ? <span className="text-[#f85c5c]">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExamInvigilation('Yes')}
                className={`px-4 py-2 rounded text-[12px] transition-all ${
                  examInvigilation === 'Yes'
                    ? 'bg-[#00e0c7] text-[#040913] font-medium'
                    : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setExamInvigilation('No')}
                className={`px-4 py-2 rounded text-[12px] transition-all ${
                  examInvigilation === 'No'
                    ? 'bg-[#00e0c7] text-[#040913] font-medium'
                    : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
              Willing: Class Teacher Duty? · শ্রেণি শিক্ষকের দায়িত্ব?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setClassTeacherDuty('Yes')}
                className={`px-4 py-2 rounded text-[12px] transition-all ${
                  classTeacherDuty === 'Yes'
                    ? 'bg-[#00e0c7] text-[#040913] font-medium'
                    : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setClassTeacherDuty('No')}
                className={`px-4 py-2 rounded text-[12px] transition-all ${
                  classTeacherDuty === 'No'
                    ? 'bg-[#00e0c7] text-[#040913] font-medium'
                    : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
            Willing: Co-Curricular Activities? · সহ-পাঠক্রমিক কার্যক্রম?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCoCurricular('Yes')}
              className={`px-4 py-2 rounded text-[12px] transition-all ${
                coCurricular === 'Yes'
                  ? 'bg-[#00e0c7] text-[#040913] font-medium'
                  : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setCoCurricular('No')}
              className={`px-4 py-2 rounded text-[12px] transition-all ${
                coCurricular === 'No'
                  ? 'bg-[#00e0c7] text-[#040913] font-medium'
                  : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Language Proficiency" sublabel="ভাষা দক্ষতা" icon="🌐">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="English Proficiency"
            sublabel="ইংরেজি দক্ষতা"
            type="select"
            options={['Select', 'Beginner', 'Elementary (A2)', 'Intermediate (B1)', 'Upper Intermediate (B2)', 'Advanced (C1)', 'Fluent (C2)', 'Native']}
          />
          <FormField
            label="Spoken English Level"
            sublabel="বলিত ইংরেজির স্তর"
            type="select"
            options={['Select', 'Beginner', 'Intermediate', 'Fluent', 'Native']}
          />
          <FormField
            label="Arabic Proficiency"
            sublabel="আরবি দক্ষতা"
            type="select"
            options={['Select', 'Beginner', 'Elementary (A2)', 'Intermediate (B1)', 'Upper Intermediate (B2)', 'Advanced (C1)', 'Fluent (C2)', 'Native']}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Spoken Arabic Level"
            sublabel="বলিত আরবির স্তর"
            type="select"
            options={['Select', 'Beginner', 'Intermediate', 'Fluent', 'Native']}
          />
          <FormField
            label="Additional Languages You Know"
            sublabel="আপনার জানা অতিরিক্ত ভাষা"
            placeholder="e.g., Hindi, Urdu, French, etc."
          />
        </div>

        <div className="pt-4">
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
            Do you have any certificate related to language proficiency? · ভাষা দক্ষতা সম্পর্কিত কোনো সার্টিফিকেট আছে?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHasLanguageCertificates(true)}
              className={`px-4 py-2 rounded text-[12px] transition-all ${
                hasLanguageCertificates
                  ? 'bg-[#00e0c7] text-[#040913] font-medium'
                  : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setHasLanguageCertificates(false)}
              className={`px-4 py-2 rounded text-[12px] transition-all ${
                !hasLanguageCertificates
                  ? 'bg-[#f85c5c] text-white font-medium'
                  : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {hasLanguageCertificates && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {languageCertificates.map((cert, index) => (
              <div key={cert.id} className="relative">
                <label className="flex items-center text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">
                  <span>Certificate {index + 1}</span>
                  {languageCertificates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLanguageCertificate(cert.id)}
                      className="ml-2 w-5 h-5 rounded-full bg-[#f07171] text-white flex items-center justify-center text-[12px] font-bold hover:bg-[#f85c5c] transition-colors shadow-sm border border-[#1c2540]"
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </label>
                <div className="relative flex flex-col items-center justify-center gap-1 w-full px-3 py-2 border-2 border-dashed border-[#1c2540] rounded-lg hover:border-[#00e0c7] hover:bg-[#0f1524] transition-all bg-[#0d1220]">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id={`lang-cert-${cert.id}`}
                  />
                  <span className="text-[14px]">📜</span>
                  <span className="text-[10px] text-[#6a7194]">Browse file</span>
                  {index === languageCertificates.length - 1 && (
                    <button
                      type="button"
                      onClick={addLanguageCertificate}
                      className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#00e0c7] text-[#040913] flex items-center justify-center text-[16px] font-bold hover:bg-[#00b8ae] transition-colors shadow-lg z-20 border-2 border-[#1c2540]"
                      title="Add Another Certificate"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      <FormSection title="Skills Assessment" sublabel="দক্ষতা মূল্যায়ন" icon="💻">
        {/* Conditional: Do you have ICT/Computer skills? */}
        <div className="mb-6">
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
            Do you have any skills related to computer or ICT? · আপনার কি কম্পিউটার বা আইসিটি সম্পর্কিত দক্ষতা আছে?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHasIctSkills(true)}
              className={`px-4 py-2 rounded text-[12px] transition-all ${
                hasIctSkills
                  ? 'bg-[#00e0c7] text-[#040913] font-medium'
                  : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setHasIctSkills(false);
                setIctSkillsLevel('Select');
                setSoftwareSkills([]);
                setHasIctCertificates(false);
              }}
              className={`px-4 py-2 rounded text-[12px] transition-all ${
                !hasIctSkills
                  ? 'bg-[#f85c5c] text-white font-medium'
                  : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* ICT Skills sections - only show if hasIctSkills is true */}
        {hasIctSkills && (
          <>
            {/* ICT Skills Level & Certificate - 50/50 Split Layout */}
            <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
              {/* Left - ICT Skills Level & Software Proficiency (50%) */}
              <div className="w-full md:w-1/2 shrink-0">
                <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">
                  ICT Skills Level · আইসিটি দক্ষতার স্তর
                </label>
                <select
                  value={ictSkillsLevel}
                  onChange={(e) => {
                    setIctSkillsLevel(e.target.value);
                    setSoftwareSkills([]);
                  }}
                  className="w-full max-w-[280px] px-3 py-2 bg-[#0a0e1a] border border-[#1c2540] rounded text-[13px] text-[#e2e4ea] font-['DM_Mono'] focus:outline-none focus:border-[#00e0c7] focus:ring-1 focus:ring-[rgba(0,224,199,0.12)]"
                >
                  <option value="Select">Select</option>
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                {/* Software / Platform Proficiency - Now on left side */}
                {ictSkillsLevel !== 'Select' && (
                  <div className="mt-6 pt-6 border-t border-[#1c2540]">
                    <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
                      Software / Platform Proficiency · সফটওয়্যার/প্ল্যাটফর্ম দক্ষতা
                    </label>
                    <CheckboxGroup
                      options={
                        ictSkillsLevel === 'Basic'
                          ? [
                              { value: 'MS Word', label: 'MS Word' },
                              { value: 'MS Excel', label: 'MS Excel' },
                              { value: 'PowerPoint', label: 'PowerPoint' },
                              { value: 'Google Classroom', label: 'Google Classroom' },
                              { value: 'Bangla Typing', label: 'Bangla Typing' },
                              { value: 'English Typing', label: 'English Typing' }
                            ]
                          : ictSkillsLevel === 'Intermediate'
                          ? [
                              { value: 'MS Word', label: 'MS Word' },
                              { value: 'MS Excel', label: 'MS Excel' },
                              { value: 'PowerPoint', label: 'PowerPoint' },
                              { value: 'Google Classroom', label: 'Google Classroom' },
                              { value: 'Bangla Typing', label: 'Bangla Typing' },
                              { value: 'English Typing', label: 'English Typing' },
                              { value: 'Google Docs', label: 'Google Docs' },
                              { value: 'Google Sheets', label: 'Google Sheets' },
                              { value: 'Canva', label: 'Canva' },
                              { value: 'Filmora / Video Editing', label: 'Filmora / Video Editing' },
                              { value: 'Basic Graphic Design', label: 'Basic Graphic Design' },
                              { value: 'Zoom / Online Meeting Tools', label: 'Zoom / Online Meeting Tools' }
                            ]
                          : [
                              { value: 'MS Word', label: 'MS Word' },
                              { value: 'MS Excel', label: 'MS Excel' },
                              { value: 'PowerPoint', label: 'PowerPoint' },
                              { value: 'Google Classroom', label: 'Google Classroom' },
                              { value: 'Bangla Typing', label: 'Bangla Typing' },
                              { value: 'English Typing', label: 'English Typing' },
                              { value: 'Adobe Photoshop', label: 'Adobe Photoshop' },
                              { value: 'Adobe Illustrator', label: 'Adobe Illustrator' },
                              { value: 'Canva Pro', label: 'Canva Pro' },
                              { value: 'Premiere Pro / Video Editing', label: 'Premiere Pro / Video Editing' },
                              { value: 'HTML / CSS / Web Design', label: 'HTML / CSS / Web Design' },
                              { value: 'JavaScript / Programming', label: 'JavaScript / Programming' },
                              { value: 'Python / Data Analysis', label: 'Python / Data Analysis' },
                              { value: 'Database Management', label: 'Database Management' }
                            ]
                      }
                      selected={softwareSkills}
                      onChange={setSoftwareSkills}
                      columns={2}
                    />
                  </div>
                )}
              </div>

              {/* Vertical divider line */}
              <div className="hidden md:block w-px bg-[#1c2540] self-stretch"></div>

              {/* Right - Certificate Only (50%) */}
              <div className="w-full md:w-1/2">
                <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">
                  Certificate? · সার্টিফিকেট আছে?
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasIctCertificates(true)}
                      className={`px-3 py-1.5 rounded text-[11px] transition-all ${
                        hasIctCertificates
                          ? 'bg-[#00e0c7] text-[#040913] font-medium'
                          : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasIctCertificates(false)}
                      className={`px-3 py-1.5 rounded text-[11px] transition-all ${
                        !hasIctCertificates
                          ? 'bg-[#f85c5c] text-white font-medium'
                          : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                
                {/* Certificate list with plus button on last certificate */}
                {hasIctCertificates && ictCertificates.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {ictCertificates.map((cert, index) => (
                      <div key={cert.id} className="relative">
                        <label className="flex items-center text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">
                          <span>Certificate {index + 1}</span>
                          {ictCertificates.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeIctCertificate(cert.id)}
                              className="ml-2 w-5 h-5 rounded-full bg-[#f07171] text-white flex items-center justify-center text-[12px] font-bold hover:bg-[#f85c5c] transition-colors shadow-sm border border-[#1c2540]"
                              title="Remove"
                            >
                              ×
                            </button>
                          )}
                        </label>
                        <div className="relative flex flex-col items-center justify-center gap-1 w-full px-3 py-2 border-2 border-dashed border-[#1c2540] rounded-lg hover:border-[#00e0c7] hover:bg-[#0f1524] transition-all bg-[#0d1220]">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id={`ict-cert-${cert.id}`}
                          />
                          <span className="text-[14px]">💻</span>
                          <span className="text-[10px] text-[#6a7194]">Browse file</span>
                          {/* Plus button on the last certificate */}
                          {index === ictCertificates.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addIctCertificate();
                              }}
                              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#00e0c7] text-[#040913] flex items-center justify-center text-[16px] font-bold hover:bg-[#00b8ae] transition-colors shadow-lg z-20 border-2 border-[#1c2540]"
                              title="Add Another Certificate"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Additional Skills Toggle - always visible */}
        <div className="pt-6 border-t border-[#1c2540]">
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
            Do you have any additional skills? · আপনার কি অতিরিক্ত দক্ষতা আছে?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHasAdditionalSkills(true)}
              className={`px-4 py-2 rounded text-[12px] transition-all ${
                hasAdditionalSkills
                  ? 'bg-[#00e0c7] text-[#040913] font-medium'
                  : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setHasAdditionalSkills(false)}
              className={`px-4 py-2 rounded text-[12px] transition-all ${
                !hasAdditionalSkills
                  ? 'bg-[#f85c5c] text-white font-medium'
                  : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {hasAdditionalSkills && (
          <div className="pt-4">
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
              Describe your additional skills · আপনার অতিরিক্ত দক্ষতা বর্ণনা করুন
            </label>
            <textarea
              rows={3}
              placeholder="Describe any type of skills (technical, creative, soft skills, hobbies, etc.) that may be relevant..."
              className="w-full px-3 py-2.5 bg-[#0a0e1a] border border-[#1c2540] rounded text-[13px] text-[#e2e4ea] font-['DM_Mono'] focus:outline-none focus:border-[#00e0c7] focus:ring-2 focus:ring-[rgba(0,224,199,0.12)] placeholder:text-[#4a5068]"
            />
          </div>
        )}
      </FormSection>
    </>
  );
}

function Step7PersonalBackground({ formData, updateField, validationErrors, attemptedSubmit, highlightedField }: StepProps) {
  const showError = (fieldName: string) => attemptedSubmit && validationErrors[fieldName];
  const getFieldWrapperClass = (fieldName: string) => {
    if (highlightedField === fieldName) return 'p-2 bg-[rgba(0,224,199,0.08)] border-2 border-[#00e0c7] rounded shadow-[0_0_20px_rgba(0,224,199,0.3)] animate-pulse';
    if (showError(fieldName)) return 'p-2 bg-[rgba(248,92,92,0.05)] border border-[rgba(248,92,92,0.2)] rounded';
    return '';
  };

  return (
    <FormSection title="Personal & Background Information" sublabel="ব্যাকগ্রাউন্ড তথ্য" icon="👤">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">Blood Group · রক্তের গ্রুপ</label>
          <select value={formData.bloodGroup || ''} onChange={(e) => updateField('bloodGroup', e.target.value)} className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#1c2540] rounded text-[13px] text-[#e2e4ea] font-['DM_Mono'] focus:outline-none focus:border-[#00e0c7] focus:ring-1 focus:ring-[rgba(0,224,199,0.12)]">
            <option value="">Select</option><option value="Never checked">Never checked · পরীক্ষা করা হয়নি</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">Physical Disability · শারীরিক অক্ষমতা <span className="text-[#4a5068]">(Optional)</span></label>
          <div className="flex gap-2">
            <button type="button" onClick={() => updateField('hasDisability', true)} className={`px-3 py-1.5 rounded text-[11px] transition-all ${formData.hasDisability ? 'bg-[#00e0c7] text-[#040913] font-medium' : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'}`}>Yes</button>
            <button type="button" onClick={() => { updateField('hasDisability', false); updateField('disabilityDetails', ''); }} className={`px-3 py-1.5 rounded text-[11px] transition-all ${!formData.hasDisability ? 'bg-[#f85c5c] text-white font-medium' : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'}`}>No</button>
          </div>
          {formData.hasDisability && <input type="text" value={formData.disabilityDetails || ''} onChange={(e) => updateField('disabilityDetails', e.target.value)} placeholder="Specify disability" className="w-full mt-2 px-3 py-2 bg-[#0a0e1a] border border-[#1c2540] rounded text-[13px] text-[#e2e4ea] font-['DM_Mono'] focus:outline-none focus:border-[#00e0c7] focus:ring-1 focus:ring-[rgba(0,224,199,0.12)] placeholder:text-[#4a5068]" />}
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">Relatives in this Institution? · এই প্রতিষ্ঠানে আত্মীয়?</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => updateField('hasRelatives', true)} className={`px-3 py-1.5 rounded text-[11px] transition-all ${formData.hasRelatives ? 'bg-[#00e0c7] text-[#040913] font-medium' : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'}`}>Yes</button>
            <button type="button" onClick={() => { updateField('hasRelatives', false); updateField('relativeDetails', ''); }} className={`px-3 py-1.5 rounded text-[11px] transition-all ${!formData.hasRelatives ? 'bg-[#f85c5c] text-white font-medium' : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'}`}>No</button>
          </div>
          {formData.hasRelatives && <input type="text" value={formData.relativeDetails || ''} onChange={(e) => updateField('relativeDetails', e.target.value)} placeholder="Name, Designation, Relation" className="w-full mt-2 px-3 py-2 bg-[#0a0e1a] border border-[#1c2540] rounded text-[13px] text-[#e2e4ea] font-['DM_Mono'] focus:outline-none focus:border-[#00e0c7] focus:ring-1 focus:ring-[rgba(0,224,199,0.12)] placeholder:text-[#4a5068]" />}
        </div>
      </div>

      <div className="pt-4 border-t border-[#1c2540] mt-4">
        <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">Emergency Contact Information · জরুরী যোগাযোগের তথ্য</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div id="field-emergencyContactName" className={getFieldWrapperClass('emergencyContactName')}>
            <FormField label="Emergency Contact Person" sublabel="জরুরী যোগাযোগের ব্যক্তি" placeholder="Full name" required value={formData.emergencyContactName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('emergencyContactName', e.target.value)} />
            <FieldError show={showError('emergencyContactName')} message="Emergency contact person is required" />
          </div>
          <div id="field-emergencyContactNumber" className={getFieldWrapperClass('emergencyContactNumber')}>
            <FormField label="Emergency Contact Number" sublabel="জরুরী ফোন নম্বর" type="tel" placeholder="+880 1X-XXXX-XXXX" required value={formData.emergencyContactNumber || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('emergencyContactNumber', e.target.value)} />
            <FieldError show={showError('emergencyContactNumber')} message="Emergency contact number is required" />
          </div>
          <div id="field-emergencyContactRelation" className={getFieldWrapperClass('emergencyContactRelation')}>
            <FormField label="Relation with Emergency Contact" sublabel="সম্পর্ক" type="select" options={['', 'Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Friend', 'Colleague', 'Other']} required value={formData.emergencyContactRelation || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('emergencyContactRelation', e.target.value)} />
            <FieldError show={showError('emergencyContactRelation')} message="Emergency relation is required" />
          </div>
        </div>
      </div>
    </FormSection>
  );
}

function Step8Documents({ formData, updateField, validationErrors, attemptedSubmit }: StepProps) {
  return (
    <FormSection title="Document Upload · নথিপত্র আপলোড" icon="📁">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Passport-size Photo', icon: '🖼️', required: true },
          { name: 'National ID Copy', icon: '📇', required: true },
          { name: 'Birth Certificate', icon: '📄', required: true },
          { name: 'Experience Certificates', icon: '🏅', required: false, multiple: true },
          { name: 'Signature Upload', icon: '✍️', required: true },
        ].map((doc) => (
          <div key={doc.name}>
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">
              {doc.name} {doc.required && <span className="text-[#f85c5c]">*</span>}
            </label>
            <div className="relative border-[1.5px] border-dashed border-[#1c2540] rounded-lg hover:border-[#00e0c7] hover:bg-[#0f1524] transition-all bg-[#0d1220]">
              <input
                type="file"
                accept={doc.name === 'Signature Upload' || doc.name === 'Passport-size Photo' ? 'image/*' : '.pdf,image/*'}
                multiple={doc.multiple}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id={`doc-${doc.name.replace(/\s+/g, '-')}`}
              />
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 pointer-events-none">
                <span className="text-[20px]">{doc.icon}</span>
                <span className="text-[11px] text-[#6a7194]">
                  {doc.multiple ? 'Multiple files ' : 'Drop or '}
                  <strong className="text-[#00e0c7]">{doc.multiple ? 'OK' : 'Browse'}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}

function Step9References({ formData, updateField, validationErrors, attemptedSubmit }: StepProps) {
  const [hasReferences, setHasReferences] = useState(true);
  const [showSecondReference, setShowSecondReference] = useState(false);
  
  return (
    <FormSection title="Professional References · পেশাদার রেফারেন্স" icon="👥">
      <div className="mb-4">
        <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
          Do you have professional references? · কি আপনার পেশাদার রেফারেন্স আছে?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setHasReferences(true)}
            className={`px-4 py-2 rounded text-[12px] transition-all ${
              hasReferences 
                ? 'bg-[#00e0c7] text-[#040913] font-medium' 
                : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#00e0c7]'
            }`}
          >
            Yes, I have references
          </button>
          <button
            type="button"
            onClick={() => setHasReferences(false)}
            className={`px-4 py-2 rounded text-[12px] transition-all ${
              !hasReferences 
                ? 'bg-[#f85c5c] text-white font-medium' 
                : 'bg-[#0d1220] border border-[#1c2540] text-[#8d98ae] hover:border-[#f85c5c]'
            }`}
          >
            No, I don't have
          </button>
        </div>
      </div>

      {hasReferences && (
        <>
          {/* Reference 1 - Required */}
          <div className="p-5 bg-[#0f1524] border border-[#1c2540] rounded-lg mb-4">
            <h3 className="text-[11px] tracking-[0.1em] uppercase text-[#00e0c7] mb-4">Reference 1</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name" sublabel="পূর্ণ নাম" placeholder="Reference person's name" required />
                <FormField label="Designation" sublabel="পদবি" placeholder="Their position" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Organization" sublabel="প্রতিষ্ঠান" placeholder="Where they work" required />
                <FormField label="Relationship" sublabel="সম্পর্ক" placeholder="e.g., Former supervisor" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Phone Number" sublabel="ফোন নম্বর" type="tel" placeholder="Contact number" required />
                <FormField label="Email" sublabel="ইমেইল" type="email" placeholder="Email address" required />
              </div>
            </div>
          </div>

          {/* Reference 2 - Optional */}
          {showSecondReference && (
            <div className="p-5 bg-[#0f1524] border border-[#1c2540] rounded-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] tracking-[0.1em] uppercase text-[#00e0c7]">Reference 2</h3>
                <button 
                  type="button"
                  onClick={() => setShowSecondReference(false)}
                  className="w-6 h-6 rounded-full border border-[rgba(240,113,113,0.3)] bg-[rgba(240,113,113,0.15)] text-[#f07171] flex items-center justify-center text-[14px] hover:bg-[#f07171] hover:text-white transition-colors"
                  title="Remove Reference 2"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Full Name" sublabel="পূর্ণ নাম" placeholder="Reference person's name" required />
                  <FormField label="Designation" sublabel="পদবি" placeholder="Their position" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Organization" sublabel="প্রতিষ্ঠান" placeholder="Where they work" required />
                  <FormField label="Relationship" sublabel="সম্পর্ক" placeholder="e.g., Academic mentor" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Phone Number" sublabel="ফোন নম্বর" type="tel" placeholder="Contact number" required />
                  <FormField label="Email" sublabel="ইমেইল" type="email" placeholder="Email address" required />
                </div>
              </div>
            </div>
          )}

          {!showSecondReference && (
            <button 
              type="button"
              onClick={() => setShowSecondReference(true)}
              className="text-[11px] px-4 py-2 bg-[rgba(0,224,199,0.08)] border border-[rgba(0,224,199,0.25)] text-[#00e0c7] rounded hover:bg-[rgba(0,224,199,0.12)] transition-colors"
            >
              + Add Second Reference
            </button>
          )}
        </>
      )}
    </FormSection>
  );
}

function Step10Declaration({ formData, updateField, validationErrors, attemptedSubmit, highlightedField }: StepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDrawn, setSignatureDrawn] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left) * scaleX;
    const y = (('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#00e0c7';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left) * scaleX;
    const y = (('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setSignatureDrawn(true);
    updateField('signatureCanvas', 'signed');
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDrawn(false);
    updateField('signatureCanvas', '');
  };

  return (
    <FormSection title="Declaration & Submission · ঘোষণা ও জমা" icon="✓">
      <div className="space-y-3 mb-6">
        <Checkbox
          label="I hereby confirm that all information provided in this application form is true, complete, and accurate to the best of my knowledge. I understand that any false or misleading information may result in immediate disqualification or termination. · আমি এতদ্বারা নিশ্চিত করছি যে এই আবেদনপত্রে প্রদত্ত সমস্ত তথ্য আমার জ্ঞানমতে সত্য, সম্পূর্ণ এবং সঠিক। আমি বুঝি যে কোনো মিথ্যা বা বিভ্রান্তিকর তথ্যের ফলে অবিলম্বে অযোগ্যতা বা চাকরিচ্যুতি হতে পারে।"
          required
        />
        <Checkbox
          label="I agree that the institution has the right to verify all information provided in this application, including contacting previous employers, educational institutions, and references listed herein. · আমি একমত যে প্রতিষ্ঠানের এই আবেদনে প্রদত্ত সমস্ত তথ্য যাচাই করার অধিকার আছে, যার মধ্যে রয়েছে পূর্ববর্তী নিয়োগকর্তা, শিক্ষা প্রতিষ্ঠান এবং এখানে তালিকাভুক্ত রেফারেন্সের সাথে যোগাযোগ।"
          required
        />
        <Checkbox
          label="I understand that submission of false information, misrepresentation of qualifications, or fraudulent documents may result in permanent cancellation of my application and possible legal consequences. · মিথ্যা তথ্য জমা দেওয়া, যোগ্যতার ভুল উপস্থাপনা, বা প্রতারণামূলক নথিপত্রের ফলে আমার আবেদনের স্থায়ী বাতিল এবং সম্ভাব্য আইনি পরিণতি হতে পারে তা আমি বুঝি।"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1c2540]">
        <div id="field-signatureCanvas" className={highlightedField === 'signatureCanvas' ? 'p-2 bg-[rgba(0,224,199,0.08)] border-2 border-[#00e0c7] rounded shadow-[0_0_20px_rgba(0,224,199,0.3)] animate-pulse' : attemptedSubmit && validationErrors.signatureCanvas ? 'p-2 bg-[rgba(248,92,92,0.05)] border border-[rgba(248,92,92,0.2)] rounded' : ''}>
          <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-2">
            Applicant Signature (Draw) <span className="text-[#f85c5c]">*</span>
          </label>
          <div 
            className="border-[1.5px] border-dashed border-[#1c2540] rounded-lg overflow-hidden hover:border-[#00e0c7] transition-colors"
          >
            <canvas 
              ref={canvasRef}
              width={400} 
              height={100}
              className="block w-full h-[100px] bg-[#0d1220] cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex gap-2 mt-2 items-center">
            <button 
              type="button"
              onClick={clearSignature}
              className="px-3 py-1.5 text-[11px] border border-[#1c2540] rounded text-[#6a7194] hover:border-[#00e0c7] hover:text-[#00e0c7] transition-colors"
            >
              Clear
            </button>
            {signatureDrawn && (
              <span className="text-[11px] text-[#00e0c7] flex items-center gap-1">
                <span>✓</span> Signature drawn
              </span>
            )}
          </div>
          <FieldError show={attemptedSubmit && validationErrors.signatureCanvas} message="Applicant signature is required" />
        </div>
        <DateField
          label="Submission Date"
          sublabel="জমার তারিখ"
          defaultValue={new Date().toISOString().split('T')[0]}
          readOnly
        />
      </div>

    </FormSection>
  );
}
