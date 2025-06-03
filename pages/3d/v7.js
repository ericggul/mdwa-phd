import Head from 'next/head';
import styled from 'styled-components';
import InteractivePresentationV7 from '@/components/v7';

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
      <Head>
        <title>PhD Interactive Presentation - V5</title>
        <meta name="description" content="An interactive 3D presentation (V5) with frontal grid layout" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainContainer>
        <InteractivePresentationV7 />
      </MainContainer>
    </>
  );
} 