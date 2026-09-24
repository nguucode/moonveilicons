import * as React from 'react';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  size?: number | string;
  rotate?: 90 | 180 | 270;
  flip?: 'horizontal' | 'vertical';
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  title?: string;
}

export function transform(rotate?: number, flip?: string): string | undefined {
  const parts = [
    rotate && `rotate(${rotate}deg)`,
    flip === 'horizontal' && 'scaleX(-1)',
    flip === 'vertical' && 'scaleY(-1)',
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}

export function createIcon(displayName: string, viewBox: string, children: React.ReactNode) {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, color = 'currentColor', rotate, flip, title, style, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={size}
        height={size}
        fill={color}
        style={transform(rotate, flip) ? { transform: transform(rotate, flip), ...style } : style}
        {...(title ? { role: 'img' } : { 'aria-hidden': true })}
        {...props}
      >
        {title && <title>{title}</title>}
        {children}
      </svg>
    )
  );
  Icon.displayName = displayName;
  return Icon;
}
