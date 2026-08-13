import Image from "next/image";

interface FeedbackHeaderProps {
  robotName: string;
  locationName: string;
  formDescription: string;
}

export function KioskHeader({ robotName, locationName, formDescription }: FeedbackHeaderProps) {
  return (
    <div className="text-center mb-8">

      {/* Brand block */}
      <div className="flex flex-col items-center gap-2 mb-5">

        {/* Row: icon + BoA names */}
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

        {/* Sub-brand below the icon row */}
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-soft/50">
          Robot Feedback
        </div>
      </div>

      {/* Robot + location badge */}
      <div className="flex justify-center mb-5">
        <div className="inline-flex items-center gap-1.5 font-mono text-[11.5px] tracking-wider text-ink-soft bg-paper-2 border border-line px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-positive flex-shrink-0" />
          {robotName} · {locationName}
        </div>
      </div>

      <h1 className="font-serif font-semibold text-[30px] leading-tight mb-2.5 text-ink">
        የሮቦት አገልግሎት አስተያየት መስጫ
      </h1>
      <p className="text-ink-soft text-[15px] max-w-md mx-auto leading-relaxed">
        {formDescription}
      </p>
    </div>
  );
}
