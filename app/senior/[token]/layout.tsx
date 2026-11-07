import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#2F7CF6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/** The senior screen never scrolls and uses the whole viewport. */
export default function SeniorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-dvh overflow-hidden bg-background text-[length:var(--s-base)]"
      style={
        {
          // Fluid type scale: ≥ 24 px on a real tablet, scales down only inside small demo frames.
          "--s-base": "clamp(17px, 3.4vmin, 26px)",
          "--s-greet": "clamp(30px, 7vmin, 56px)",
          "--s-clock": "clamp(16px, 3.6vmin, 28px)",
          "--s-caption": "clamp(19px, 3.9vmin, 30px)",
          "--s-btn": "clamp(190px, 42vh, 360px)",
          "--s-btn-label": "clamp(17px, 3.4vmin, 26px)",
          "--s-help": "clamp(64px, 13vmin, 104px)",
          "--s-help-text": "clamp(20px, 4.2vmin, 32px)",
          "--s-pad": "clamp(14px, 3.5vmin, 36px)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
