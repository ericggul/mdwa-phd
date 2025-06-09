import React from 'react';
import styled from 'styled-components';

const NavContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 12px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
  // font-family: EB Garamond;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const NavButton = styled.button`
  background-color: #444;
  color: white;
  border: none;
  padding: 10px 12px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  &:hover {
    background-color: #666;
  }

  &:disabled {
    background-color: #222;
    color: #555;
    cursor: not-allowed;
  }
`;

const NavInfo = styled.div`
  font-size: 16px;
  min-width: 200px; /* Increased width for longer titles */
  text-align: center;
  line-height: 1.3;
  
  .top-line {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 2px;
  }
  
  .slide-counter {
    font-size: 14px;
    color: #aaa;
  }
  
  .component-title {
    font-weight: normal;
    color: #aaa;
    font-size: 14px;
  }
  
  .slide-title {
    font-weight: semi-bold;
    color: #fff;
    font-size: 16px;
  }
`;

const NavigationUI = ({
  onPrev,
  onNext,
  onOverview,
  currentIndex, // -1 for overview, 0 to N-1 for slides
  totalSlides,
  currentSlideTitle,
  currentComponentTitle,
  currentSlideType
}) => {
  const isOverview = currentIndex === -1;
  const isTitleSlide = currentSlideType === 'title';

  return (
    <NavContainer>
      <NavButton onClick={onPrev} title="Previous slide">
        ←
      </NavButton>
      <NavInfo>
        {isOverview ? (
          <div>Overview</div>
        ) : isTitleSlide ? (
          // For title slides, just show the component title (no slide count)
          <div className="component-title">
            {currentComponentTitle}
          </div>
        ) : (
          // For content slides, show slide count + component title + slide title
          <>
            <div className="top-line">
              <span className="slide-counter">
                Slide {currentIndex + 1} / {totalSlides}
              </span>
              {currentComponentTitle && (
                <>
                  <span>•</span>
                  <span className="component-title">
                    {currentComponentTitle}
                  </span>
                </>
              )}
            </div>
            {currentSlideTitle && currentSlideTitle !== currentComponentTitle && (
              <div className="slide-title">
                {currentSlideTitle}
              </div>
            )}
          </>
        )}
      </NavInfo>
      <NavButton onClick={onNext} title="Next slide">
        →
      </NavButton>
      <NavButton onClick={onOverview} disabled={isOverview} title="Close/Exit to Overview">
        ×
      </NavButton>
    </NavContainer>
  );
};

export default NavigationUI; 