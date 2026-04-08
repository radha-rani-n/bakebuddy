interface LogoProps {
  size?: number;
  className?: string;
}

export default function BakeBuddyLogo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="url(#logo-gradient)" />

      {/* Cupcake base */}
      <path
        d="M32 58 L38 78 Q39 80 41 80 L59 80 Q61 80 62 78 L68 58 Z"
        fill="#A16207"
        opacity="0.9"
      />
      {/* Wrapper lines */}
      <path d="M36 62 L40 78" stroke="#92400E" strokeWidth="1" opacity="0.4" />
      <path d="M44 60 L46 78" stroke="#92400E" strokeWidth="1" opacity="0.4" />
      <path d="M52 59 L52 79" stroke="#92400E" strokeWidth="1" opacity="0.4" />
      <path d="M60 60 L58 78" stroke="#92400E" strokeWidth="1" opacity="0.4" />
      <path d="M64 62 L60 78" stroke="#92400E" strokeWidth="1" opacity="0.4" />

      {/* Frosting swirl */}
      <path
        d="M28 58 Q30 48 38 46 Q42 45 44 48 Q46 44 50 43 Q54 44 56 48 Q58 45 62 46 Q70 48 72 58 Z"
        fill="#FDE68A"
      />
      {/* Frosting highlight */}
      <path
        d="M32 56 Q34 50 40 48 Q44 47 46 50 Q48 46 50 45"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />

      {/* Cherry on top */}
      <circle cx="50" cy="38" r="7" fill="#DC2626" />
      <circle cx="47" cy="36" r="2" fill="white" opacity="0.5" />
      {/* Cherry stem */}
      <path
        d="M50 31 Q52 24 58 22"
        stroke="#166534"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Leaf */}
      <ellipse cx="58" cy="22" rx="4" ry="2" fill="#22C55E" transform="rotate(-20 58 22)" />

      {/* Sparkle left */}
      <g transform="translate(22, 38)" opacity="0.7">
        <line x1="0" y1="4" x2="0" y2="-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Sparkle right */}
      <g transform="translate(76, 42)" opacity="0.7">
        <line x1="0" y1="3" x2="0" y2="-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-3" y1="0" x2="3" y2="0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Sprinkles on frosting */}
      <rect x="36" y="50" width="3" height="1.5" rx="0.75" fill="#EC4899" transform="rotate(-30 36 50)" />
      <rect x="44" y="47" width="3" height="1.5" rx="0.75" fill="#8B5CF6" transform="rotate(20 44 47)" />
      <rect x="54" y="48" width="3" height="1.5" rx="0.75" fill="#3B82F6" transform="rotate(-15 54 48)" />
      <rect x="62" y="51" width="3" height="1.5" rx="0.75" fill="#10B981" transform="rotate(25 62 51)" />
      <rect x="40" y="53" width="3" height="1.5" rx="0.75" fill="#F59E0B" transform="rotate(10 40 53)" />
      <rect x="58" y="54" width="3" height="1.5" rx="0.75" fill="#EF4444" transform="rotate(-20 58 54)" />

      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
