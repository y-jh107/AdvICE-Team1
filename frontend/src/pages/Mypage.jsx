// src/pages/Mypage.jsx

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from '../components/Button'; // 공용 버튼 컴포넌트
import Header from '../components/Header'; // 공용 Header 컴포넌트
import calendarIcon from '../assets/calendar-icon.png'; // 캘린더 아이콘 이미지 경로 (준비 필요)

// --- Mock Data (나중에 실제 데이터로 교체) ---
const dummyUser = {
  name: '어드바이스',
  email: '12345@gmail.com',
  phone: '010-1111-1111',
};

const dummyExpenses = [
  { date: '9월 15일', amount: '30,000원' },
  { date: '9월 16일', amount: '80,000원' },
  { date: '9월 17일', amount: '100,000원' },
  { date: '9월 18일', amount: '50,000원' },
  { date: '9월 19일', amount: '40,000원' },
];

const dummyTrips = [
  { name: '태국 여행' },
  { name: '중일 친구들이랑 일본 여행' },
  { name: '3박 4일 싱가포르 여행' },
  { name: '중국 여행' },
];

// --- Styled Components ---

const PageWrapper = styled.div`
  background-color: #white;
  min-height: 100vh; // 화면 전체 높이 사용
  display: flex;
  flex-direction: column; // 자식 요소들을 세로로 정렬
`;

const MainContent = styled.main`
 
  width:90rem;
  max-width: 80rem; /* 최대 너비를 1200px 정도로 설정하는 것이 일반적 */
  margin: 0 auto; /* 중앙 정렬 */
  padding: 3rem 0rem; /* 콘텐츠 영역 전체의 상하, 좌우 여백 */
  box-sizing: border-box; /* 패딩이 너비 계산에 포함되도록 */
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: left; // 제목 좌측 정렬
  padding-left: 5%; // 좌측 패딩 추가 

`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 0 2rem; // 그리드 내부 좌우 패딩

`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 0 2rem; // 그리드 내부 좌우 패딩

`;

const Card = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ProfileInfo = styled(Card)``;

const InfoField = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    color: #888;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  p {
    background-color: #f4f6f8;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin: 0;
    font-size: 1rem;
    color: #333;
  }
`;

const CalendarLink = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  text-decoration: none; // Link 스타일 제거
  color: #333; // 기본 텍스트 색상

  &:hover {
    transform: translateY(-5px);
  }

  img {
    width: 100px;
    height: auto;
    margin-bottom: 1rem;
  }
`;

const ListCard = styled(Card)`
  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #333;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
  }
  li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
    color: #555;
    &:last-child {
      border-bottom: none;
    }
  }
  ${Button} { // ListCard 내의 Button 스타일 조정
    width: 100%; // 버튼 너비를 카드에 맞게 100%
  }
`;

// --- Mypage Component ---
function Mypage() {
  const userDisplayName = dummyUser.name; // Header에 전달할 사용자 이름

  return (
    <PageWrapper>
      <Header userName={userDisplayName} /> {/* Header 컴포넌트 사용 */}

      <MainContent>
        <PageTitle>마이페이지</PageTitle>
        <ContentGrid>
          <ProfileInfo>
            <InfoField>
              <label>이름</label>
              <p>{dummyUser.name}</p>
            </InfoField>
            <InfoField>
              <label>아이디</label>
              <p>{dummyUser.email}</p>
            </InfoField>
            <InfoField>
              <label>전화번호</label>
              <p>{dummyUser.phone}</p>
            </InfoField>
            <InfoField>
              <label>비밀번호</label>
              <p>************</p>
            </InfoField>
          </ProfileInfo>
          {/* CalendarLink는 Link 컴포넌트처럼 작동하도록 `as={Link}` 사용 */}
          <CalendarLink as={Link} to="/calendar">
            <img src={calendarIcon} alt="Calendar icon" />
            <p>캘린더로 이동하기</p>
          </CalendarLink>
        </ContentGrid>
        
        <DashboardGrid>
          <ListCard>
            <h3>일일 내 지출액</h3>
            <ul>
              {dummyExpenses.map((item, index) => (
                <li key={index}>{item.date}: {item.amount}</li>
              ))}
            </ul>
            <Button to="/expenses" variant="primary" text={"더보기"} />
          </ListCard>
          <ListCard>
            <h3>내 여행 목록</h3>
            <ul>
              {dummyTrips.map((item, index) => (
                <li key={index}>{item.name}</li>
              ))}
            </ul>
            <Button to="/trips" variant="primary" text={"더보기"} />
          </ListCard>
        </DashboardGrid>
      </MainContent>
    </PageWrapper>
  );
}

export default Mypage;