import type { SVGProps } from 'react';

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14 38c0-13 11-24 24-24-2 11-9 19-19 22-3 1-5 2-5 2Z"
        fill="#9DBE6F"
      />
      <path
        d="M30 32c5-6 13-9 20-9-2 9-9 16-18 18-3 1-5 1-5 1l3-10Z"
        fill="#8FBE3D"
      />
    </svg>
  );
}

export function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8 18c8-4 14 4 22 0s14-4 22 0v14c-8-4-14 4-22 0s-14-4-22 0V18Z"
        fill="#E76F4A"
      />
      <rect x="6" y="14" width="3" height="40" rx="1.5" fill="#1F3F2C" opacity=".15" />
    </svg>
  );
}

export function TriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M32 12 56 52H8L32 12Z" fill="#A6B6BB" />
    </svg>
  );
}
