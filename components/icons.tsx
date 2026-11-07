import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true } as const;

export const ArrowRight = (p: P) => (<svg {...base} {...p}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>);
export const Mic = (p: P) => (<svg {...base} {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
export const Phone = (p: P) => (<svg {...base} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>);
export const Bell = (p: P) => (<svg {...base} {...p}><path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 21h4" /></svg>);
export const Clock = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const Doc = (p: P) => (<svg {...base} {...p}><path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5" /></svg>);
export const Hand = (p: P) => (<svg {...base} {...p}><path d="M3 13h3l3 3h4a2 2 0 0 0 0-4h-3M6 13v7M13 12l5-3a2 2 0 0 1 2 3l-6 6H9" /></svg>);
export const Shield = (p: P) => (<svg {...base} {...p}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>);
export const Plus = (p: P) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const MenuIcon = (p: P) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const Close = (p: P) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const Heart = (p: P) => (<svg {...base} {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>);

export function CheckBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="11" fill="#E9F3DF" />
      <path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#0E7A36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export const Users = (p: P) => (<svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6" /></svg>);
