import {useEffect, useState} from "react";

export const useKonamiCode = (callback: () => void) => {
    const [input, setInput] = useState<string[]>([]);

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
            setInput((prevInput) =>
                [...prevInput, event.code].slice(-konamiCode.length)
            );

            if (input.join('') === konamiCode.join('')) {
                callback();
                setInput([]); // Reset input after code is detected
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [input, callback]);

    return null;
};