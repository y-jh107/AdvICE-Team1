// src/components/Header.jsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button'; 

// 1. 로고 이미지를 import 합니다.
import logoImage from '../assets/Logo.png'; // 로고 이미지 파일 경로를 확인하세요.

// --- Styled Components ---

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  hight: 6.1rem;
  weight: 140rem;
  max-width: 160rem;
  align-items: center;
  padding: 1rem 2%;
  background-color: white;
  border-bottom: 1.9rem solid #3b82f6;
  //box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
`;

const Logo = styled.img`
  height: 40px; /* 로고 이미지의 세로 크기를 조절하세요. */
  cursor: pointer;
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #555;
  font-weight: 500;
  &:hover {
    color: #000;
  }
`;



// --- Header Component ---
function Header({ userName }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMyPageClick = () => {
    if (location.pathname === '/mypage') {
      window.location.reload();
    } else {
      navigate('/mypage');
    }
  };

  return (
    <HeaderContainer>
      <Link to="/">
        <Logo src={logoImage} alt="YeoBi Logo" />
      </Link>
      
      <NavLinks>
        <StyledLink to="/trips">내 여행</StyledLink>
        <StyledLink to="/">로그아웃</StyledLink> 
        <Button onClick={handleMyPageClick} variant="primary" text={userName} />
      </NavLinks>
    </HeaderContainer>
  );
}

export default Header;