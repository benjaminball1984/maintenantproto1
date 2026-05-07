import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-bca-green-dark/95 backdrop-blur p-3 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.4)]">
      <Link to="/signer" className="btn-primary w-full !py-3 !text-base">
        Signer la pétition
      </Link>
    </div>
  );
}
