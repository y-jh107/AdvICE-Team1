// src/components/Header.jsx

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "./Button"; // Button 컴포넌트 경로 확인

// 로고 이미지
import logoImage from "../assets/Logo.png";

// --- Styled Components ---
const HeaderContainer = styled.header`
 display: flex;
  justify-content: space-between;
  align-items: center;
  height: 6.1rem;
  width: 100%;
  padding: 1rem 2%;
  background-color: white;
  border-bottom: 1.9rem solid #3b82f6;
  box-sizing: border-box;
  position: fixed; 
  top: 0;          
  left: 0;         
  z-index: 1000;
`;

const Logo = styled.img`
  height: 40px;
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
function Header({ userName = "Guest" }) {
  // 기본값 추가
  const location = useLocation();
  const navigate = useNavigate();

  const handleMyPageClick = () => {
    if (location.pathname === "/mypage") {
      window.location.reload();
    } else {
      navigate("/mypage");
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
