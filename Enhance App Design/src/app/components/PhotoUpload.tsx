import { useState } from 'react';

interface PhotoUploadProps {
  onUpload?: (value: string) => void;
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ছবি ২ MB এর বেশি হবে না · File size must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onUpload?.('yes');
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPreview(null);
    onUpload?.('');
  };

  return (
    <div className="mb-6">
      <label className="block text-[10px] tracking-[0.12em] uppercase text-[#6a7194] mb-3">
        Applicant Photo · শিক্ষকের ছবি <span className="text-[#f85c5c]">*</span>
      </label>

      <div className="flex items-start gap-4 flex-wrap">
        {/* Photo Preview */}
        <div className="relative">
          <div
            className="w-[90px] h-[90px] rounded-lg bg-[#0d1220] border-2 border-dashed border-[#1c2540] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#00e0c7] transition-colors"
            onClick={() => !preview && document.getElementById('photo-input')?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-7 h-7 text-[#444d6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" strokeWidth={1.4} />
                <path strokeWidth={1.4} d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            )}
          </div>
          {preview && (
            <button
              onClick={removePhoto}
              className="absolute -top-2 -right-2 w-6 h-6 bg-[#f85c5c] hover:bg-[#e04848] rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Upload Info */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-[10px] text-[#6a7194] leading-relaxed mb-3">
            পাসপোর্ট সাইজ ছবি · Passport size photo<br />
            JPG/PNG · সর্বোচ্চ 2MB · Max 2MB<br />
            প্রস্তাবিত: 300×400 পিক্সেল
          </p>
          <input
            type="file"
            id="photo-input"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="photo-input"
            className="inline-block text-[10px] px-3.5 py-2 bg-[rgba(0,224,199,0.08)] border border-[rgba(0,224,199,0.25)] text-[#00e0c7] rounded cursor-pointer hover:bg-[rgba(0,224,199,0.12)] transition-colors"
          >
            ছবি নির্বাচন · Choose Photo
          </label>
          {preview && (
            <button
              onClick={removePhoto}
              className="inline-block ml-2 text-[10px] px-3.5 py-2 bg-[rgba(248,92,92,0.08)] border border-[rgba(248,92,92,0.2)] text-[#f85c5c] rounded hover:bg-[rgba(248,92,92,0.12)] transition-colors"
            >
              মুছুন · Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
