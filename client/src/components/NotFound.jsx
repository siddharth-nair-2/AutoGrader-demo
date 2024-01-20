import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url("404confused.jpg");
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 0;
`;

const BlackBox = styled.div`
  position: absolute;
  background-color: black;
  width: 100vw;
  height: 100vh;
  opacity: 0.8;
  z-index: 1;
`;

const TextDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 120px;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  height: 100%;
  width: 100%;
  color: white;
  z-index: 10;
`;

const SmallTextDiv = styled.div`
  font-size: 40px;
  font-weight: 500;
  display: flex;
`;

const Navbar = styled.nav`
  width: 100%;
  height: 70px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: "Poppins", sans-serif;
  z-index: 10;
`;
const LeftLogo = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

const LogoImg = styled.img`
  max-width: 50px;
  @media (max-height: 425px) {
    opacity: 0;
  }
`;

const BoldText = styled.div`
  font-weight: 600;
  transition: "all 0.2s";
  margin-left: 10px;
  margin-right: 10px;
  &:hover {
    transform: scale(1.05);
    text-decoration: underline;
  }
`;
export default function NotFound() {
  return (
    <Container>
      <Navbar>
        <LeftLogo>
          <LogoImg src="loginLogo.png" alt="Autograder logo" />
        </LeftLogo>
      </Navbar>
      <BlackBox />
      <TextDiv>
        404 Not Found!{" "}
        <SmallTextDiv>
          Return to{" "}
          <Link to={"/"}>
            <BoldText>Homepage</BoldText>
          </Link>
          ?
        </SmallTextDiv>
      </TextDiv>
    </Container>
  );
}
