// src/pages/Home.jsx
import React from "react";
import styled from "styled-components";
import mainLogo from "../assets/mainPage_Logo.png";
import Button from "../components/Button";
import { Link } from "react-router-dom";

const HomeContainer = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.08)"/><circle cx="80" cy="80" r="3" fill="rgba(255,255,255,0.12)"/></svg>') repeat;
    opacity: 0.3;
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  text-align: center;
  z-index: 10;
  max-width: 90%;
`;

const LogoImage = styled.img`
  width: 580px;
  max-width: 180vw;
  height: auto;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
  margin-bottom: 3rem;
  animation: float 6s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @media (max-width: 768px) {
    width: 320px;
  }

  @media (max-width: 480px) {
    width: 260px;
  }
`;

const Title = styled.h1`
  font-size: 4.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem 0;
  letter-spacing: -2px;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    font-size: 3.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 3rem 0;
  font-weight: 400;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.8rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
  }
`;

const GlowButton = styled(Button)`
  padding: 1rem 3rem;
  font-size: 1.3rem;
  font-weight: 600;
  border-radius: 50px;
  min-width: 220px;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.6);
  }

  ${props => props.variant === "primary" && `
    background: white;
    color: #3b82f6;
  `}

  ${props => props.variant === "secondary" && `
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: white;
    }
  `}
`;

function Home() {
  return (
    <HomeContainer>
      <ContentWrapper>
        <LogoImage src={mainLogo} alt="여비" />
        <ButtonContainer>
          <Link to="/login">
            <GlowButton text="시작하기" variant="primary" />
          </Link>
          
          <Link to="/signup">
            <GlowButton text="회원가입" variant="secondary" />
          </Link>
        </ButtonContainer>
      </ContentWrapper>
    </HomeContainer>
  );
}

export default Home;