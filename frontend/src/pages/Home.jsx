import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import mainLogo from '../assets/mainPage_Logo.png';

//임시
const TempButton = styled(Link)`
  display: inline-block;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  text-decoration: none;
  transition: all 0.3s ease;
  text-align: center;
`;

const PrimaryButton = styled(TempButton)`
  background-color: #3b82f6;
  color: white;
  &:hover {
    background-color: #2563eb;
  }
`;

const SecondaryButton = styled(TempButton)`
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  &:hover {
    background-color: #f3f4f6;
  }
`;
//임시 끝

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: white;
`;

// ▼▼▼ 2. 로고 이미지를 표시할 간단한 img 태그로 변경합니다. ▼▼▼
const LogoImage = styled.img`
  max-width: 48rem; /* 이미지 크기 조절 */
  height: 42rem; /* 이미지 크기 조절 */
  object-fit: contain; /* 이미지 비율 유지 */
  margin-top: -12rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 3rem;
  margin-top: 2 rem; 
`;

// --- Home 컴포넌트 ---
function Home() {
  return (
    <HomeContainer>
      {/* ▼▼▼ 3. 단일 로고 이미지만 렌더링합니다. ▼▼▼ */}
      <LogoImage src={mainLogo} alt="YeoBi Main Logo" />
      
      <ButtonContainer>
        <PrimaryButton to="/Login">시작하기</PrimaryButton>
        <SecondaryButton to="/Signup">회원가입</SecondaryButton>
      </ButtonContainer>
    </HomeContainer>
  );
} 

export default Home;