import type { CSSProperties } from "react";

const LOGO = `${import.meta.env.BASE_URL}the-space-os-logo.png`;

interface LogoImgProps {
  height: number;
  /**
   * "adaptive" — no background in light mode; white rounded pill in CSS dark mode.
   * "always"   — always shows white rounded pill (hardcoded dark-bg pages).
   * "print"    — CSS filter invert to white (logo on coloured/purple backgrounds).
   */
  variant?: "adaptive" | "always" | "print";
  alt?: string;
  className?: string;
  style?: CSSProperties;
}

export function LogoImg({
  height,
  variant = "adaptive",
  alt = "The Space OS",
  className,
  style,
}: LogoImgProps) {
  const padV = Math.max(3, Math.round(height * 0.08));
  const padH = Math.max(6, Math.round(height * 0.16));
  const radius = Math.max(8, Math.round(height * 0.22));

  if (variant === "print") {
    return (
      <img
        src={LOGO}
        alt={alt}
        className={className}
        style={{
          height,
          width: "auto",
          objectFit: "contain",
          objectPosition: "left center",
          filter: "brightness(0) invert(1)",
          flexShrink: 0,
          position: "relative",
          ...style,
        }}
      />
    );
  }

  const wrapperStyle: CSSProperties =
    variant === "always"
      ? {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "rgba(236, 238, 245, 0.97)",
          borderRadius: radius,
          padding: `${padV}px ${padH}px`,
          boxShadow:
            height >= 40
              ? "0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)"
              : undefined,
        }
      : {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        };

  const adaptiveClass =
    variant === "adaptive"
      ? height >= 80
        ? "dark:bg-[#eceff8] dark:rounded-2xl dark:shadow-md dark:px-5 dark:py-3"
        : "dark:bg-[#eceff8] dark:rounded-xl dark:shadow dark:px-3 dark:py-1.5"
      : "";

  return (
    <span style={wrapperStyle} className={adaptiveClass}>
      <img
        src={LOGO}
        alt={alt}
        className={className}
        style={{
          height,
          width: "auto",
          objectFit: "contain",
          display: "block",
          ...style,
        }}
      />
    </span>
  );
}
