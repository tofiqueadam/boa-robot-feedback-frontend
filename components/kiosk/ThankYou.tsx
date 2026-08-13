"use client";
import Image from "next/image";

interface ThankYouProps {
  message: string;
  locationName: string;
  onReset: () => void;
}

export function ThankYou({ message, locationName, onReset }: ThankYouProps) {
  return (
    <div className="text-center py-16 px-6">

      {/* Brand */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex items-center gap-3">
          <Image
            src="/boa-logo.jpeg"
            alt="Bank of Abyssinia"
            width={52}
            height={52}
            className="rounded-[12px] shadow-card flex-shrink-0"
            priority
          />
          <div className="text-left">
            <div className="font-semibold text-[15px] text-ink leading-tight" style={{ fontFamily: "serif" }}>
              አቢሲንያ ባንክ
            </div>
            <div className="text-ink-soft text-[12px] leading-tight mt-0.5">
              Bank of Abyssinia
            </div>
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-soft/50">
          የሮቦት አገልግሎት አስተያየት
        </div>
      </div>

      <h2 className="font-serif font-semibold text-[28px] mb-3 text-ink">
        እናመሰግናለን!
      </h2>
      <p className="text-ink-soft text-[15px] max-w-sm mx-auto leading-relaxed">
        {message}
      </p>

      <div className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-widest text-positive border-[1.5px] border-positive rounded-full px-4 py-1.5">
        <span>✓</span>
        <span>ተመዝግቧል · {locationName}</span>
      </div>

      <div className="mt-8">
        <button
          onClick={onReset}
          className="bg-paper-2 text-ink border border-line rounded-[12px] px-6 py-3 font-semibold text-sm hover:bg-paper transition-colors shadow-card"
        >
          ሌላ አስተያየት ለመስጠት
        </button>
      </div>
    </div>
  );
}
