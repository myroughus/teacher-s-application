export function SuccessScreen() {
  const referenceNumber = `TCH${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-[600px] w-full">
        <div className="bg-[#0f1524] border border-[#1c2540] rounded-2xl p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <div className="w-[70px] h-[70px] rounded-full bg-[rgba(92,248,160,0.08)] border border-[rgba(92,248,160,0.25)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#5cf8a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="font-['Cormorant_Garamond'] text-[28px] text-[#5cf8a0] mb-3 font-semibold">
            আবেদন জমা হয়েছে!<br />
            Application Submitted
          </h1>

          <p className="text-[11px] text-[#6a7194] leading-relaxed mb-8">
            আপনার শিক্ষক আবেদন সফলভাবে গৃহীত হয়েছে।<br />
            Your teacher application has been successfully received.<br /><br />
            অনুগ্রহ করে আপনার আবেদন পর্যালোচনার জন্য <strong className="text-[#f8c05c]">কমপক্ষে ৫-৭ কার্যদিবস</strong> অপেক্ষা করুন।<br />
            Please allow at least <strong className="text-[#f8c05c]">5-7 business days</strong> for your application to be reviewed.
          </p>

          {/* Reference Number */}
          <div className="inline-block px-6 py-4 bg-[#141b2d] border border-[#00e0c7] rounded-lg mb-8">
            <div className="text-[9px] tracking-[0.14em] uppercase text-[#6a7194] mb-2">
              আবেদন আইডি · Application ID
            </div>
            <div className="font-['DM_Mono'] text-[20px] text-[#00e0c7] tracking-[0.12em] font-medium">
              {referenceNumber}
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-left mb-8 p-5 bg-[rgba(0,224,199,0.03)] border border-[rgba(0,224,199,0.12)] rounded-lg">
            <h3 className="font-['Cormorant_Garamond'] text-[16px] text-[#00e0c7] mb-3">
              What happens next? · পরবর্তী কী?
            </h3>
            <ul className="text-[11px] text-[#6a7194] leading-relaxed space-y-2">
              <li>✓ Confirmation email within 24 hours · ২৪ ঘন্টার মধ্যে নিশ্চিতকরণ ইমেইল</li>
              <li>✓ Application review (5-7 business days) · আবেদন পর্যালোচনা (৫-৭ দিন)</li>
              <li>✓ Shortlisted candidates contacted for interview · সাক্ষাৎকারের জন্য যোগাযোগ</li>
              <li>✓ Final decision via email · চূড়ান্ত সিদ্ধান্ত ইমেইলে</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="font-['DM_Mono'] text-[11px] tracking-[0.08em] uppercase px-6 py-3 bg-[rgba(0,224,199,0.08)] border border-[rgba(0,224,199,0.25)] text-[#00e0c7] rounded-lg hover:bg-[rgba(0,224,199,0.12)] transition-colors">
              📥 Download Receipt
            </button>
            <button className="font-['DM_Mono'] text-[11px] tracking-[0.08em] uppercase px-6 py-3 bg-transparent border border-[#1c2540] text-[#6a7194] rounded-lg hover:border-[#00e0c7] hover:text-[#00e0c7] transition-all">
              ← Back to Home
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-[#1c2540]">
            <p className="text-[10px] text-[#444d6e]">
              Questions? Contact us at{' '}
              <a href="mailto:hr@school.edu" className="text-[#00e0c7] hover:underline">
                hr@school.edu
              </a>
              {' '}or{' '}
              <a href="tel:+8801234567890" className="text-[#00e0c7] hover:underline">
                +880 1234-567890
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
