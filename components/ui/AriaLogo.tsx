import { cn } from "@/lib/utils";

interface AriaLogoProps {
  size?: number;
  className?: string;
  ringClassName?: string;
}

export function AriaLogo({ size = 38, className, ringClassName }: AriaLogoProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-paper-2 border-2 border-ink flex items-center justify-center flex-shrink-0",
        ringClassName
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="#F2A900"
        style={{ width: size * 0.55, height: size * 0.55 }}
        className={className}
      >
        <g>
          <ellipse cx="12" cy="6.2" rx="2.2" ry="4.2" />
          <ellipse cx="12" cy="6.2" rx="2.2" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="6.2" rx="2.2" ry="4.2" transform="rotate(120 12 12)" />
          <ellipse cx="12" cy="6.2" rx="2.2" ry="4.2" transform="rotate(180 12 12)" />
          <ellipse cx="12" cy="6.2" rx="2.2" ry="4.2" transform="rotate(240 12 12)" />
          <ellipse cx="12" cy="6.2" rx="2.2" ry="4.2" transform="rotate(300 12 12)" />
          <circle cx="12" cy="12" r="2.1" fill="#0F2A54" />
        </g>
      </svg>
    </div>
  );
}
