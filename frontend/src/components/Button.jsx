// src/components/Button.jsx
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

const StyledButton = styled.button`
  padding: 0.75rem 2rem;
  font-weight: bold;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
  border: none;
  font-weight: normal;

  ${({ variant }) =>
    variant === "primary"
      ? css`
          background-color: #3b82f6;
          color: white;
          &:hover {
            background-color: #2563eb;
          }
        `
      : css`
          background-color: white;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover {
            background-color: #f3f4f6;
            outline: none;
            box-shadow: none;
          }
        `}

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  display: inline-block;
`;

export default function Button({
  text,
  to,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary", // 기본값: 파란색 버튼
}) {
  const button = (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
    >
      {text}
    </StyledButton>
  );

  return to ? <StyledLink to={to}>{button}</StyledLink> : button;
}