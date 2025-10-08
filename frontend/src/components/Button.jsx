// src/components/Button.jsx
import styled from "styled-components";

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export default function Button({ text, onClick, type = 
"button", disabled = false }) {
  return (
    <StyledButton type={type} onClick={onClick} 
disabled={disabled}>
      {text}
    </StyledButton>
  );
}
