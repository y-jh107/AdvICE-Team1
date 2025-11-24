// src/pages/Mypage.jsx

import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Button from "../components/Button"; // 공용 버튼 컴포넌트
import Header from "../components/Header"; // 공용 Header 컴포넌트
import calendarIcon from "../assets/calendar-icon.png"; // 캘린더 아이콘 이미지 경로

// --- Styled Components ---

const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  width: 90rem;
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 0rem;
  box-sizing: border-box;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: left;
  padding-left: 5%;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 0 2rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 0 2rem;
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
  text-decoration: none;
  color: #333;

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
  ${Button} {
    width: 100%;
  }
`;

// --- Mypage Component ---
function Mypage() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        if (!accessToken || !userId) {
          throw new Error("로그인 정보가 없습니다.");
        }

        const response = await fetch(`/api/mypage/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const responseData = await response.json();

        if (responseData.code === "SU") {
          setUser(responseData.data.user);
          setExpenses(responseData.data.expensesByDate.items);
          setTrips(responseData.data.groups);
        } else {
          throw new Error(responseData.message || "데이터를 불러오는데 실패했습니다.");
        }
        
      } catch (err) {
        console.error("데이터 페칭 실패:", err);
        setError(err);
      }
    };

    fetchMyPageData();
  }, []);

  return (
    <PageWrapper>
      <MainContent>
        {error && (
          <div style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}>
            데이터 로딩 실패: {error.message}
          </div>
        )}

        <PageTitle>마이페이지</PageTitle>
        <ContentGrid>
          <ProfileInfo>
            <InfoField>
              <label>이름</label>
              <p>{user?.name}</p>
            </InfoField>
            <InfoField>
              <label>아이디</label>
              <p>{user?.email}</p>
            </InfoField>
            <InfoField>
              <label>전화번호</label>
              <p>{user?.phone}</p>
            </InfoField>
            <InfoField>
              <label>비밀번호</label>
              <p>************</p>
            </InfoField>
          </ProfileInfo>
          <CalendarLink as={Link} to="/calendar">
            <img src={calendarIcon} alt="Calendar icon" />
            <p>캘린더로 이동하기</p>
          </CalendarLink>
        </ContentGrid>

        <DashboardGrid>
          <ListCard>
            <h3>일일 내 지출액</h3>
            <ul>
              {expenses?.map((item) => (
                <li key={item.date}>
                  {item.date}: {item.amount.toLocaleString('ko-KR')}원
                </li>
              ))}
            </ul>
            {/* [수정됨] 
              기존에 있던 <Button to="/expenses" ... /> 부분을 삭제했습니다.
              이제 이 카드는 단순 리스트만 보여주며 클릭해도 아무 일도 일어나지 않습니다.
            */}
          </ListCard>
          
          <ListCard>
            <h3>내 여행 목록</h3>
            <ul>
              {trips?.map((item) => (
                <li key={item.groupId}>{item.name}</li>
              ))}
            </ul>
            <Button to="/groups" variant="primary" text={"더보기"} />
          </ListCard>
        </DashboardGrid>
      </MainContent>
    </PageWrapper>
  );
}

export default Mypage;