import QRCode from "qrcode";

/** Server component: renders a QR code as inline SVG (Ink on white). */
export async function QrCode({ value, size = 240, label }: { value: string; size?: number; label: string }) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    margin: 1,
    width: size,
    errorCorrectionLevel: "M",
    color: { dark: "#202128", light: "#FFFFFF" },
  });
  return (
    <div
      role="img"
      aria-label={label}
      className="inline-block rounded-lg border border-line bg-white p-3 shadow-soft [&_svg]:block [&_svg]:h-auto [&_svg]:w-[var(--qr)]"
      style={{ "--qr": `${size}px` } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
