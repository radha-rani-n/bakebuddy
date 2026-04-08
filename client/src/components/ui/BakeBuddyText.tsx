interface BakeBuddyTextProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl sm:text-4xl',
  xl: 'text-5xl sm:text-6xl',
};

const emojiSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
};

export default function BakeBuddyText({ size = 'md', className = '' }: BakeBuddyTextProps) {
  return (
    <span
      className={`inline-flex items-center font-extrabold ${sizes[size]} ${className}`}
      style={{ fontFamily: "'Bubblegum Sans', 'Baloo 2', cursive" }}
    >
      <span className="text-amber-800">Bake</span>
      <span className={`mx-0.5 ${emojiSizes[size]}`}>🧁</span>
      <span className="text-orange-600">Buddy</span>
    </span>
  );
}
