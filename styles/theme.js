import { css } from 'styled-components';

const theme = {
  dynamicFontSize: (value) => `${value / 16}rem`, // Example, adjust as needed
  dynamicAnimationTiming: (value) => `${value}s`, // Example, adjust as needed
  windowWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  windowHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  // Add other theme variables here
};

export default theme; 