// src/pages/ExpenseRedirect.jsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import receiptIcon from "../assets/receipt.png";
import calendarIcon from "../assets/calendar.png";

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 8rem 2rem 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 3.5rem;
  text-align: center;

  span {
    color: #3b82f6;
    font-weight: 800;
  }

  @media (max-width: 768px) {
    font-size: 1.9rem;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }

  @media (min-width: 1024px) {
    gap: 4rem;
    max-width: 1000px;
  }
`;

const ActionButton = styled.button`
  background: white;
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    padding: 2.5rem 1.5rem;
  }
`;

const IconWrapper = styled.div`
  width: 150px;
  height: 150px;
  margin-bottom: 3rem;
  border-radius: 80%;
  overflow: hidden;
  background: #ffffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 4px 10px rgba(0,0,0,0.05);

  img {
    width: 120px;
    height: 120px;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 110px;
    height: 110px;
    img {
      width: 76px;
      height: 76px;
    }
  }
`;

const ButtonText = styled.p`
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.35rem;
  }
`;

export default function ExpenseRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
    // 쿼리 파라미터 읽기
  const groupId = searchParams.get("groupId");
  const groupName = searchParams.get("groupName")
    ? decodeURIComponent(searchParams.get("groupName"))
    : null;

  const goToGroups = () => {
    if (!groupId) return alert("모임 정보가 없습니다.");
    navigate(`/group/${groupId}/expense`);
  };

  const goToCalendar = () => {
    navigate("/calendar");
  };

  return (
    <Container>
      <Title>
        {groupName ? (
          <>
            <span>{groupName}</span> 모임<br />
            선택지
          </>
        ) : (
          "아래에 보이는 네모 상자를 선택해주세요"
        )}
      </Title>
      <ButtonGrid>
        {/* 지출 항목 등록하기 */}
        <ActionButton onClick={goToGroups}>
          <IconWrapper>
            <img src={receiptIcon} alt="지출 등록" />
          </IconWrapper>
          <ButtonText>지출 항목 등록하기</ButtonText>
        </ActionButton>

        {/* 캘린더로 이동하기 */}
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