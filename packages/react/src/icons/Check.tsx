import * as React from 'react';
import type { IconProps } from '../types';

export const Check = React.forwardRef<SVGSVGElement, IconProps>(
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
      <path d="m8.29 18.71-5.12-5.15-.09-.18L3 13l.08-.38.21-.33.33-.21L4 12l.2.02.36.15 4.41 4.38L19.26 5.32l.32-.23.38-.09.38.06.34.2.23.32.09.38-.06.38-.2.34-11 12-.15.13-.18.1-.19.07-.2.02-.2-.02-.19-.05-.18-.1Z"/>
    </svg>
  )
);

Check.displayName = 'Check';
