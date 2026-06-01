'use client';

import { useEffect } from 'react';

export default function SecurityProtection() {
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();

    const blockDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    const blockPrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        void navigator.clipboard?.writeText('تم التقاط صورة شاشة - تم تسجيلك');
      }
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockDevTools);
    document.addEventListener('keyup', blockPrintScreen);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockDevTools);
      document.removeEventListener('keyup', blockPrintScreen);
    };
  }, []);

  return null;
}
