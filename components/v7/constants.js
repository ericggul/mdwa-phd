// Spring config for animations
export const SPRING_CONFIG_NORMAL = { tension: 170, friction: 26 }; // Default for direct transitions
export const SPRING_CONFIG_FLYOVER = { tension: 160, friction: 28 }; // Adjusted for more assertive fly-over
export const FLY_OVER_PAUSE_DURATION = 0; // ms to pause at overview

// Intro Animation Parameters - 쉽게 조절 가능
export const COMPONENT_DELAY_MS = 300; // 컴포넌트 간 딜레이
export const INTER_SECTION_OVERLAP_MS = -500; // 섹션 간 오버랩 (음수 = 이전꺼 끝나기전에 다음꺼 시작)
export const WITHIN_COMPONENT_DELAY_MS = 100; // 컴포넌트 내 슬라이드 간 딜레이
export const TOTAL_ANIMATION_DURATION_MS = 10000; // 전체 애니메이션 지속시간
export const INTRO_SPRING_TENSION = 150; // 인트로 애니메이션 spring tension
export const INTRO_SPRING_FRICTION = 50; // 인트로 애니메이션 spring friction

// Layout constants - using v4's approach but for front-facing slides
export const SLIDE_WIDTH_16 = 16; 
export const SLIDE_DEPTH_9 = 9;   
export const SLIDE_THICKNESS = 0.8; // Thickness of individual slides
export const SLIDE_COMPONENT_SLOT_THICKNESS = 0.1; // Individual slide thickness
export const SLIDE_SPACING = 3.0; // Spacing between slides
export const EDGE_TITLE_Z_OFFSET = 2; // Added for Z-offsetting titles

// BoxGeometry: [width, height, depth] where slides face forward (positive Z)
export const slideBoxArgs = [SLIDE_WIDTH_16, SLIDE_DEPTH_9, SLIDE_THICKNESS]; 