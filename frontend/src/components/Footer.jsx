// src/components/Footer.jsx
import styled from "styled-components";

const FooterWrapper = styled.footer`
  width: 100%;
  padding: 1rem 0;
  background-color: #f5f5f5;
  color: #555;
  text-align: center;
  font-size: 0.9rem;
  border-top: 1px solid #ddd;
  position: fixed;
  bottom: 0;
  left: 0;
`;

export default function Footer() {
  return <FooterWrapper>© YeoBi | All Rights Reserved</FooterWrapper>;
}
