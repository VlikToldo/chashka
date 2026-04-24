interface LoaderProps {
  className?: string;
  size?: number;
}

export default function Loader({ className, size = 48 }: LoaderProps) {
  const h = Math.round(size * 56 / 48);
  return (
    <div className={`flex justify-center items-center py-12 ${className ?? ""}`}>
      <svg
        width={size}
        height={h}
        viewBox="0 0 48 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Steam lines */}
        <line
          x1="16" y1="10" x2="16" y2="2"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          style={{ animation: "steam-left 1.6s ease-in-out 0.2s infinite" }}
        />
        <line
          x1="24" y1="10" x2="24" y2="0"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          style={{ animation: "steam-center 1.6s ease-in-out 0s infinite" }}
        />
        <line
          x1="32" y1="10" x2="32" y2="2"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          style={{ animation: "steam-right 1.6s ease-in-out 0.4s infinite" }}
        />

        {/* Cup body */}
        <path
          d="M8 14 L12 50 Q12 52 14 52 L34 52 Q36 52 36 50 L40 14 Z"
          stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"
        />

        {/* Saucer */}
        <ellipse
          cx="24" cy="53" rx="18" ry="2.5"
          stroke="currentColor" strokeWidth="1.5" fill="none"
        />

        {/* Handle */}
        <path
          d="M36 22 Q46 22 46 30 Q46 38 36 38"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"
        />

        {/* Coffee fill */}
        <clipPath id="cup-clip">
          <path d="M8.5 14.5 L12.3 49.5 Q12.3 51.2 13.8 51.2 L34.2 51.2 Q35.7 51.2 35.7 49.5 L39.5 14.5 Z" />
        </clipPath>
        <rect
          x="0" y="0" width="48" height="56"
          fill="currentColor"
          clipPath="url(#cup-clip)"
          style={{ opacity: 0.7, animation: "coffee-fill 1.6s ease-in-out infinite" }}
        />
      </svg>

      <style>{`
        @keyframes coffee-fill {
          0%   { transform: translateY(56px); }
          60%  { transform: translateY(20px); }
          80%  { transform: translateY(20px); }
          100% { transform: translateY(56px); }
        }
        @keyframes steam-left {
          0%   { opacity: 0; transform: translateY(0px); }
          40%  { opacity: 0.5; }
          70%  { opacity: 0.6; transform: translateY(-6px); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes steam-center {
          0%   { opacity: 0; transform: translateY(0px); }
          40%  { opacity: 0.6; }
          70%  { opacity: 0.7; transform: translateY(-8px); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
        @keyframes steam-right {
          0%   { opacity: 0; transform: translateY(0px); }
          40%  { opacity: 0.5; }
          70%  { opacity: 0.6; transform: translateY(-6px); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
