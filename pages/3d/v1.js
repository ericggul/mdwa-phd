import Head from 'next/head';
import styled from 'styled-components';
import ThreeDPresentation from '../components/ThreeDPresentation';
import InteractivePresentation from '../components/InteractivePresentation';

const MainContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: black;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function Home() {
  console.log("Home component rendering");
  return (
    <>
      <Head>
        <title>PhD Interactive Presentation</title>
        <meta name="description" content="An interactive 3D presentation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainContainer>
        <InteractivePresentation />
      </MainContainer>
    </>
  );
}
