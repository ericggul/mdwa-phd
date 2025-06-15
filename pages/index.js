import styled from 'styled-components';
import InteractivePresentationV7 from '@/components/v7';
import SEO from '@/components/v7/Seo';

const MainContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #1e1e1e;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function V5Page() {
  console.log("V5Page component rendering");
  return (
    <>
      <SEO />
      <MainContainer>
        <InteractivePresentationV7 />
      </MainContainer>
    </>
  );
} 