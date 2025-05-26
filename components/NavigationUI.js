import React from 'react';
import styled from 'styled-components';

const NavContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
  font-family: Arial, sans-serif;
`;

const NavButton = styled.button`
  background-color: #444;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #666;
  }

  &:disabled {
    background-color: #222;
    color: #555;
    cursor: not-allowed;
  }
`;

const NavInfo = styled.span`
  font-size: 14px;
  min-width: 80px; /* To prevent layout shifts */
  text-align: center;
`;

const NavigationUI = ({
  onPrev,
  onNext,
  onOverview,
  currentIndex, // -1 for overview, 0 to N-1 for slides
  totalSlides
}) => {
  const isOverview = currentIndex === -1;
  const currentSlideDisplay = isOverview ? 'Overview' : `Slide ${currentIndex + 1}`;

  return (
    <NavContainer>
      <NavButton onClick={onPrev}>
        Prev
      </NavButton>
      <NavInfo>
        {currentSlideDisplay} / {totalSlides}
      </NavInfo>
      <NavButton onClick={onNext}>
        Next
      </NavButton>
      <NavButton onClick={onOverview} disabled={isOverview}>
        Overview
      </NavButton>
    </NavContainer>
  );
};

export default NavigationUI; 