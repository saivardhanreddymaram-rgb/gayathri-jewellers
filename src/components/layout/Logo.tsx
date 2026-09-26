import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Use 'light' on dark backgrounds (footer, hero) */
  variant?: 'dark' | 'light';
}

export function Logo({ size = 'md', className, variant = 'dark' }: LogoProps) {
  // Sizes for the premium diamond logo
  const imgSize = { sm: 50, md: 60, lg: 75 }[size];

  const textSize = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-brown-800';
  const goldColor = variant === 'light' ? 'text-gold-300' : 'text-gold-500';

  return (
    <Link
      to="/"
      className={`flex items-center gap-3 group select-none ${className ?? ''}`}
      aria-label="Gayathri Jewellers — Home"
    >
      {/* Premium Diamond GJ Logo - Round Shape */}
      <div className="shrink-0 transition-transform duration-200 group-hover:scale-105 rounded-full overflow-hidden shadow-lg">
        <img
          src="/logo-premium.png"
          alt="Gayathri Jewellers"
          width={imgSize}
          height={imgSize}
          className="object-cover rounded-full"
          draggable={false}
        />
      </div>

      {/* Brand text */}
      <div className="flex flex-col leading-none">
        <span className={`font-serif font-bold ${textSize} ${textColor} tracking-wide transition-colors duration-150 group-hover:text-gold-600`}>
          Gayathri
        </span>
        <span className={`font-sans text-[10px] tracking-[0.22em] uppercase ${goldColor} font-semibold mt-0.5`}>
          Jewellers
        </span>
      </div>
    </Link>
  );
}
