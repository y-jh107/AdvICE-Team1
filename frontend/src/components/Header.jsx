import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "./Button";
import logoImage from "../assets/Logo.png";

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
  cursor: default; /* 클릭 불가 표시 */
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

function Header() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("accessToken");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <HeaderContainer>
      {/* 클릭 불가 로고 */}
      <Logo src={logoImage} alt="YeoBi Logo" />

      <NavLinks>
        {isLoggedIn && <StyledLink to="/groups">내 여행</StyledLink>}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#555",
              fontSize: "1rem",
            }}
          >
            로그아웃
          </button>
        ) : (
          <StyledLink to="/login">로그인</StyledLink>
        )}

        {isLoggedIn && (
          <Button text="마이페이지" variant="primary" onClick={() => navigate("/mypage")} />
        )}
      </NavLinks>
    </HeaderContainer>
  );
}

export default Header;
