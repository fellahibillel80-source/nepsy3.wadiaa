'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function GenderThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const updateTheme = () => {
    try {
      // If on registration home page (/), prioritize form selection (tempGender)
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        const tempGender = localStorage.getItem('tempGender');
        if (tempGender === 'female' || tempGender === 'male') {
          setGender(tempGender);
          return;
        }
        setGender('male');
        return;
      }

      // For other pages, check childData from the active test session
      const childData = localStorage.getItem('childData');
      if (childData) {
        const parsed = JSON.parse(childData);
        if (parsed && parsed.gender) {
          setGender(parsed.gender === 'female' ? 'female' : 'male');
          return;
        }
      }
      
      const tempGender = localStorage.getItem('tempGender');
      if (tempGender === 'female' || tempGender === 'male') {
        setGender(tempGender);
        return;
      }
      
      setGender('male');
    } catch (e) {
      setGender('male');
    }
  };

  useEffect(() => {
    updateTheme();

    // Listen to storage events
    window.addEventListener('storage', updateTheme);

    // Listen to custom gender-change events
    window.addEventListener('gender-change', updateTheme);

    return () => {
      window.removeEventListener('storage', updateTheme);
      window.removeEventListener('gender-change', updateTheme);
    };
  }, []);

  // Run updateTheme when user navigates
  useEffect(() => {
    updateTheme();
  }, [pathname]);

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (gender === 'female') {
      root.classList.add('theme-female');
      root.classList.remove('theme-male');
    } else {
      root.classList.add('theme-male');
      root.classList.remove('theme-female');
    }
  }, [gender]);

  return <>{children}</>;
}
