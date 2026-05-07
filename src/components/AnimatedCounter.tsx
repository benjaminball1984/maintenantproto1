import { useEffect, useRef, useState } from 'react';

type Props = {
  value: number | null;
  duration?: number;
  className?: string;
};

export default function AnimatedCounter({ value, duration = 1200, className = '' }: Props) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (value === null) return;
    fromRef.current = display;
    startRef.current = null;

    let raf = 0;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const progress = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(fromRef.current + (value - fromRef.current) * eased);
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className={className}>
      {value === null ? '—' : display.toLocaleString('fr-FR')}
    </span>
  );
}
