import Head from 'next/head';
import styled from 'styled-components';
import InteractivePresentationV4 from '@/components/v4'; // Assuming component will be named InteractivePresentationV4

const MainContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #1a1a1a; // Slightly different background for v4
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function V4Page() {
  console.log("V4Page component rendering");
  return (
    <>
      <Head>
        <title>PhD Interactive Presentation - V4</title>
        <meta name="description" content="An interactive 3D presentation (V4)" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainContainer>
        <InteractivePresentationV4 />
      </MainContainer>
    </>
  );
} 