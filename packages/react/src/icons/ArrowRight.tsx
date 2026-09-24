import * as React from 'react';
import type { IconProps } from '../types';

export const ArrowRight = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      {...props}
    >
      <path d="M4 11h12.59l-4.42-4.44-.15-.36L12 6l.02-.2.15-.36.12-.15.33-.21L13 5l.38.08.33.21 6 6 .21.33.08.38-.08.38-.21.33-6 6-.33.21L13 19l-.2-.02-.36-.15-.15-.12-.21-.33L12 18l.08-.38.09-.18L16.59 13 3.8 12.98l-.36-.15-.15-.12-.21-.33L3 12l.08-.38.21-.33.33-.21Z"/>
    </svg>
  )
);

ArrowRight.displayName = 'ArrowRight';
