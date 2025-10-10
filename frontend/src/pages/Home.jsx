// src/pages/Home.jsx
import React from "react";
import styled from "styled-components";
import mainLogo from "../assets/mainPage_Logo.png";
import Button from "../components/Button";

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: white;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const LogoImage = styled.img`
  max-width: 40rem;
  height: auto;
  object-fit: contain;
  margin-top: -8rem;

  @media (max-width: 1024px) {
    max-width: 30rem;
    margin-top: -6rem;
  }

  @media (max-width: 768px) {
    max-width: 20rem;
    margin-top: -2rem;
  }

  @media (max-width: 480px) {
    max-width: 14rem;
    margin-top: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }
`;

function Home() {
  return (
    <HomeContainer>
      <LogoImage src={mainLogo} alt="YeoBi Main Logo" />
      <ButtonContainer>
        <Button text="시작하기" to="/Trips" variant="primary" />
        <Button text="회원가입" to="/Signup" variant="secondary" />
      </ButtonContainer>
    </HomeContainer>
  );
}

export default Home;
