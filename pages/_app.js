import "@/styles/globals.css";
import { ThemeProvider } from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';
import theme from '../styles/theme';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true once mounted on the client

    const handleResize = () => {
      // Directly mutating the theme object. This is generally not recommended
      // as it might not trigger re-renders in consuming components as expected.
      // However, the immediate issue is the blank screen caused by state toggling.
      if (typeof window !== 'undefined') {
        theme.windowWidth = window.innerWidth;
        theme.windowHeight = window.innerHeight;
      }
    };

    if (typeof window !== 'undefined') {
      handleResize(); // Set initial size
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  if (!isClient) {
    // Render nothing on the server or before client-side hydration is complete
    return null; 
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
