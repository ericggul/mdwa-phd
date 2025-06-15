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
        <title>MDWA - Multi-Device Web Artwork | Jeanyoon Choi PhD Research</title>
        <meta name="description" content="Multi-Device Web Artwork: A Semantic and Modular Framework for Interactive Systems Art - PhD Qualification Research by Jeanyoon Choi at KAIST XD Lab" />
        <meta name="keywords" content="MDWA, Multi-Device Web Artwork, Systems Art, Interactive Art, PhD Research, KAIST, XD Lab, Jeanyoon Choi" />
        <meta name="author" content="Jeanyoon Choi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainContainer>
        <InteractivePresentationV7 />
      </MainContainer>
    </>
  );
} 