import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const IntroOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1f 0%, #2d2d35 50%, #1a1a1f 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  
  ${props => props.isExiting && css`
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
  `}
`;

const ContentContainer = styled.div`
  max-width: 800px;
  padding: 2rem;
  text-align: center;
  animation: ${fadeIn} 1s ease-out;
  
  @media (max-width: 768px) {
    padding: 1rem;
    max-width: 90%;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${slideUp} 1s ease-out 0.2s both;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  color: #b0b0b0;
  margin-bottom: 2rem;
  animation: ${slideUp} 1s ease-out 0.4s both;
`;

const Description = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #d0d0d0;
  margin-bottom: 3rem;
  animation: ${slideUp} 1s ease-out 0.6s both;
  
  p {
    margin-bottom: 1rem;
  }
  
  .highlight {
    color: #ffffff;
    font-weight: 500;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: ${slideUp} 1s ease-out 0.8s both;
  
  @media (max-width: 768px) {
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #5b52e8 0%, #8b47f0 100%);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const LoadingIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #888;
  font-size: 0.9rem;
  animation: ${fadeIn} 1s ease-out 1s both;
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    border-radius: 2px;
    transition: width 0.3s ease;
    width: ${props => props.progress}%;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #888;
    animation: pulse 1.5s infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
  
  @keyframes pulse {
    0%, 80%, 100% {
      opacity: 0.3;
    }
    40% {
      opacity: 1;
    }
  }
`;

const IntroPage = ({ onEnter, isLoading = true, loadingProgress = 0 }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnterClick = () => {
    console.log('🎯 [INTRO] User clicked "Enter Interactive 3D Experience" button');
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  const handleDownloadPDF = () => {
    console.log('📥 [INTRO] User clicked "Download PDF" button');
    // Create a link to download the PDF
    const link = document.createElement('a');
    link.href = '/pdf/jeanyoon_choi_mdwa.pdf';
    link.download = 'jeanyoon_choi_mdwa_phd_qualification.pdf';
    link.click();
  };

  return (
    <IntroOverlay isExiting={isExiting}>
      <ContentContainer>
        <Title>Multi-Device Web Artwork</Title>
        <Subtitle>A Semantic and Modular Framework for Interactive Systems Art</Subtitle>
        
        <Description>
          <p>
            <span className="highlight">MDWA</span> represents a novel approach to creating interactive art experiences 
            that bridge multiple devices through web technologies, enabling rich semantic interactions 
            and modular deployment across various exhibition contexts.
          </p>
          <p>
            This research explores how <span className="highlight">Systems Art</span> can be enhanced through 
            carefully designed interaction taxonomies, state-based architectures, and dimensional transformations 
            to create more engaging and meaningful audience experiences.
          </p>
          <p>
            <span className="highlight">Jeanyoon Choi</span> • PhD Qualification Research • XD Lab, Industrial Design, KAIST
          </p>
        </Description>

        <ButtonContainer>
          <PrimaryButton onClick={handleEnterClick} disabled={isLoading}>
            {isLoading ? 'Loading 3D Experience...' : 'Enter Interactive 3D Experience'}
            <span>→</span>
          </PrimaryButton>
          <SecondaryButton onClick={handleDownloadPDF}>
            Download PDF Document
            <span>↓</span>
          </SecondaryButton>
        </ButtonContainer>
      </ContentContainer>

      {isLoading && (
        <LoadingIndicator>
          <span>Preparing interactive experience ({Math.round(loadingProgress)}%)</span>
          <ProgressBar progress={loadingProgress}>
            <div className="progress-fill" />
          </ProgressBar>
          <LoadingDots>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </LoadingDots>
        </LoadingIndicator>
      )}
    </IntroOverlay>
  );
};

export default IntroPage; 