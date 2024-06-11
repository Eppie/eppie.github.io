import { useEffect, useRef } from 'react';

export const useKonamiCode = (callback: () => void) => {
  const inputRef = useRef<string[]>([]);

  useEffect(() => {
    const konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'KeyB',
      'KeyA',
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      inputRef.current = [...inputRef.current, event.code].slice(
        -konamiCode.length
      );

      if (inputRef.current.join('') === konamiCode.join('')) {
        callback();
        inputRef.current = []; // Reset input after code is detected
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback]);

  return null;
};
