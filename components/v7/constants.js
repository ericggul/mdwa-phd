// Spring config for animations
export const SPRING_CONFIG_NORMAL = { tension: 170, friction: 26 }; // Default for direct transitions
export const SPRING_CONFIG_FLYOVER = { tension: 160, friction: 28 }; // Adjusted for more assertive fly-over
export const FLY_OVER_PAUSE_DURATION = 0; // ms to pause at overview

// Layout constants - using v4's approach but for front-facing slides
export const SLIDE_WIDTH_16 = 16; 
export const SLIDE_DEPTH_9 = 9;   
export const SLIDE_THICKNESS = 0.8; // Thickness of individual slides
export const SLIDE_COMPONENT_SLOT_THICKNESS = 0.1; // Individual slide thickness
export const SLIDE_SPACING = 1.0; // Spacing between slides
export const EDGE_TITLE_Z_OFFSET = 2; // Added for Z-offsetting titles

// BoxGeometry: [width, height, depth] where slides face forward (positive Z)
export const slideBoxArgs = [SLIDE_WIDTH_16, SLIDE_DEPTH_9, SLIDE_THICKNESS]; 