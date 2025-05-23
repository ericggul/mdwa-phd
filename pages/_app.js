import "@/styles/globals.css";
import { ThemeProvider } from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';
import theme from '../styles/theme';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
  console.log("App component rendering");
  const [isClient, setIsClient] = useState(false);
  console.log("App component - initial isClient:", isClient);

  useEffect(() => {
    console.log("App component - useEffect running");
    setIsClient(true); // Set to true once mounted on the client

    const handleResize = () => {
      console.log("App component - handleResize called");
      // Directly mutating the theme object. This is generally not recommended
      // as it might not trigger re-renders in consuming components as expected.
      // However, the immediate issue is the blank screen caused by state toggling.
      if (typeof window !== 'undefined') {
        theme.windowWidth = window.innerWidth;
        theme.windowHeight = window.innerHeight;
      }
    };

    if (typeof window !== 'undefined') {
      console.log("App component - useEffect - adding resize listener");
      handleResize(); // Set initial size
      window.addEventListener('resize', handleResize);
    }

    return () => {
      console.log("App component - useEffect cleanup - removing resize listener");
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  console.log("App component - before isClient check, isClient:", isClient);
  if (!isClient) {
    console.log("App component - isClient is false, returning null");
    // Render nothing on the server or before client-side hydration is complete
    return null; 
  }

  console.log("App component - isClient is true, rendering ThemeProvider");
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
