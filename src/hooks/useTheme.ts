import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        // Get theme from local storage or default to 'winter'
        return localStorage.getItem('theme') || 'winter';
    });

    useEffect(() => {
        // Apply the theme to the html tag
        document.documentElement.setAttribute('data-theme', theme);
        // Save the theme to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'winter' ? 'dim' : 'winter'));
    };

    return { theme, toggleTheme };
};