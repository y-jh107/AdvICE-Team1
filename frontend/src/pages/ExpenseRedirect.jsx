// src/pages/ExpenseRedirect.jsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import receiptIcon from "../assets/receipt.png";
import calendarIcon from "../assets/calendar.png";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%);
  padding: 8rem 2rem 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4rem;
  text-align: center;
  line-height: 1.4;

  span {
    color: #3b82f6;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 4rem;
  }
`;

const ActionButton = styled.button`
  background: white;
  border-radius: 28px;
  padding: 3.5rem 2rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 24px 48px rgba(59, 130, 246, 0.15);
    border-color: #93c5fd;
  }

  &:active {
    transform: translateY(-6px) scale(1.01);
  }

  @media (max-width: 768px) {
    padding: 2.8rem 1.5rem;
  }
`;

const IconWrapper = styled.div`
  width: 160px;
  height: 160px;
  margin-bottom: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 4px 12px rgba(99, 102, 241, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.08);

  img {
    width: 110px;
    height: 110px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  }

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    img {
      width: 80px;
      height: 80px;
    }
  }
`;

const ButtonText = styled.p`
  margin: 0;
  font-size: 1.9rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export default function ExpenseRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");
  const groupName = searchParams.get("groupName")
    ? decodeURIComponent(searchParams.get("groupName"))
    : null;

  const goToGroups = () => {
    if (!groupId) return alert("모임 정보가 없습니다.");
    navigate(`/groups/${groupId}/expenses`);
  };

  const goToCalendar = () => {
    if (!groupId) return alert("모임 정보가 없습니다.");
    navigate(`/calendar?groupId=${groupId}`);
  };

  return (
    <Container>
      <Title>
        {groupName ? (
          <>
            <span>{groupName}</span> 모임<br />
            아래 두 상자 중 하나를 선택해주세요
          </>
        ) : (
          "아래 두 상자 중 하나를 선택해주세요"
        )}
      </Title>
      <ButtonGrid>
        <ActionButton onClick={goToGroups}>
          <IconWrapper>
            <img src={receiptIcon} alt="지출 등록" />
          </IconWrapper>
          <ButtonText>지출 항목 등록하기</ButtonText>
        </ActionButton>

        <ActionButton onClick={goToCalendar}>
          <IconWrapper>
            <img src={calendarIcon} alt="캘린더" />
          </IconWrapper>
          <ButtonText>캘린더로 이동하기</ButtonText>
        </ActionButton>
      </ButtonGrid>
    </Container>
  );
}