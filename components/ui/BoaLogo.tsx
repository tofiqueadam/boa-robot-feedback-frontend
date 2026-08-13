import Image from "next/image";

type BrandVariant = "sidebar" | "login" | "kiosk";

const MARK_W = 69;
const MARK_H = 55;

/**
 * Bank of Abyssinia brand header.
 *
 * sidebar — compact, for dark sidebar
 * login   — larger, for the login card dark band
 * kiosk   — for the light feedback form header
 */
export function BoaLogo({ variant = "sidebar" }: { variant?: BrandVariant }) {
  const isLogin  = variant === "login";
  const isKiosk  = variant === "kiosk";
  const markH    = isLogin ? 44 : isKiosk ? 40 : 36;
  const markW    = Math.round(markH * (MARK_W / MARK_H));

  // On kiosk (light background) wrap in a dark pill so the gold mark is visible
  if (isKiosk) {
    return (
      <div className="inline-flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 bg-[#0D0D0D] rounded-[14px] px-4 py-2.5">
          <Image
            src="/boa-mark.png"
            alt="Bank of Abyssinia"
            width={markW}
            height={markH}
            style={{ width: markW, height: markH, objectFit: "contain" }}
            priority
          />
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.90)",
              lineHeight: 1.3,
              fontFamily: "serif",
            }}>
              አቢሲንያ ባንክ
            </div>
            <div style={{
              fontSize: 10.5,
              fontWeight: 400,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.3,
              marginTop: 2,
              letterSpacing: "0.01em",
            }}>
              Bank of Abyssinia
            </div>
          </div>
        </div>
        {/* Sub-brand */}
        <div style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#888",
          fontWeight: 600,
        }}>
          Robot Feedback
        </div>
      </div>
    );
  }

  // sidebar / login — dark background, white text
  const nameSize    = isLogin ? 15   : 13;
  const subSize     = isLogin ? 12   : 10.5;
  const nameMuted   = isLogin ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.62)";
  const subMuted    = isLogin ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.35)";
  const dividerColor = "rgba(255,255,255,0.08)";
  const tagColor    = "rgba(255,255,255,0.28)";
  const goldColor   = "rgba(242,169,0,0.90)";

  return (
    <div>
      {/* Mark + names */}
      <div style={{ display: "flex", alignItems: "center", gap: isLogin ? 14 : 10 }}>
        <div style={{ flexShrink: 0, width: markW, height: markH, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image
            src="/boa-mark.png"
            alt="Bank of Abyssinia"
            width={markW}
            height={markH}
            style={{ width: markW, height: markH, objectFit: "contain" }}
            priority
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Amharic */}
          <div style={{
            fontSize: nameSize,
            fontWeight: 600,
            color: nameMuted,
            lineHeight: 1.3,
            fontFamily: "serif",
          }}>
            አቢሲንያ ባንክ
          </div>
          {/* English */}
          <div style={{
            fontSize: subSize,
            fontWeight: 400,
            color: subMuted,
            lineHeight: 1.3,
            marginTop: 3,
            letterSpacing: "0.01em",
          }}>
            Bank of Abyssinia
          </div>
        </div>
      </div>

      {/* Sub-brand divider */}
      <div style={{
        marginTop: isLogin ? 12 : 10,
        paddingTop: isLogin ? 12 : 10,
        borderTop: `1px solid ${dividerColor}`,
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap" as const,
      }}>
        <span style={{
          fontFamily: "monospace",
          fontSize: isLogin ? 13 : 11,
          fontWeight: 700,
          color: nameMuted,
          letterSpacing: "0.01em",
        }}>
          Robot
        </span>
        <span style={{
          fontFamily: "monospace",
          fontSize: isLogin ? 13 : 11,
          fontWeight: 700,
          color: goldColor,
          letterSpacing: "0.01em",
        }}>
          Feedback
        </span>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase" as const,
          color: tagColor,
          paddingLeft: 6,
          borderLeft: `1px solid ${dividerColor}`,
          marginLeft: 2,
          fontFamily: "monospace",
        }}>
          Admin
        </span>
      </div>
    </div>
  );
}
