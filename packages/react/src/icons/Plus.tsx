import * as React from 'react';
import type { IconProps } from '../types';

export const Plus = React.forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M11.02 20.2 11 13l-7.2-.02-.36-.15-.15-.12-.21-.33L3 12l.08-.38.21-.33.33-.21.18-.06L11 11l.02-7.2.15-.36.12-.15.33-.21L12 3l.38.08.18.09.27.27.15.36L13 11l7.2.02.18.06.33.21.21.33.08.38-.08.38-.21.33-.33.21-.18.06L13 13l-.02 7.2-.06.18-.21.33-.33.21L12 21l-.38-.08-.33-.21-.21-.33Z"/>
    </svg>
  )
);

Plus.displayName = 'Plus';
