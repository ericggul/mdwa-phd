import "@/styles/globals.css";
import { ThemeProvider } from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';
import theme from '../styles/theme';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
  const [windowReady, setWindowReady] = useState(false);

  useEffect(() => {
    setWindowReady(true);
    const handleResize = () => {
      // We need to update the theme object directly, this is a bit of a hack
      // but necessary for styled-components to pick up the new values without
      // a full re-render of the ThemeProvider, which can be costly.
      theme.windowWidth = window.innerWidth;
      theme.windowHeight = window.innerHeight;
      // Force a re-render of components that use the theme by updating a dummy state
      // This is not ideal, but a common workaround.
      // A more robust solution might involve a context API or a state management library.
      setWindowReady(prev => !prev); // Toggle to ensure re-render
    };

    window.addEventListener('resize', handleResize);
    // Set initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!windowReady) {
    // You might want to render a loader here or nothing until the window object is available
    return null; 
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
