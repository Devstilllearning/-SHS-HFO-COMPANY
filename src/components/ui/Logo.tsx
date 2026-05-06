import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light' | 'gold';
}

export default function Logo({ className, size = 'md', showText = false, textColor = 'gold' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textColors = {
    dark: 'text-bg-dark',
    light: 'text-white',
    gold: 'text-brand-gold',
  };

  return (
    <div className={cn("flex items-center space-x-3 group cursor-pointer", className)}>
      <div className={cn(
        "flex items-center justify-center transition-transform group-hover:scale-110",
        sizes[size]
      )}>
        <img 
          src="/logo.png" 
          alt="Berrionaire Logo" 
          className="w-full h-full object-contain drop-shadow-md"
          onError={(e) => {
            // Fallback if logo.png is missing
            e.currentTarget.src = 'https://api.iconify.design/noto:strawberry.svg';
          }}
        />
      </div>
      {showText && (
        <span className={cn(
          "font-serif font-bold tracking-tight",
          size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl',
          textColors[textColor]
        )}>
          Berrionaire
        </span>
      )}
    </div>
  );
}
