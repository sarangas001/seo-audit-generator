import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Listen to the current URL path location
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantly snap to the top-left coordinates of the viewport
    window.scrollTo(0, 0);
    
    // Optional: If you want a smooth sliding effect instead, use this line:
    // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]); // This fires every single time the path changes

  return null; // This component doesn't render any visible UI elements
};

export default ScrollToTop;