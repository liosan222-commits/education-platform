'use client';

import { useEffect, useState } from 'react';

export default function Watermark({ userName, userPhone }: { userName: string; userPhone: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}%`,
        top: `${position.y}%`,
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.15)',
        pointerEvents: 'none',
        zIndex: -1,
        transform: 'rotate(-12deg)',
        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
        whiteSpace: 'nowrap'
      }}
    >
      {userName} - {userPhone}
    </div>
  );
}
