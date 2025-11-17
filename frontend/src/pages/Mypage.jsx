// src/pages/Mypage.jsx

import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Button from "../components/Button"; // 공용 버튼 컴포넌트
import Header from "../components/Header"; // 공용 Header 컴포넌트
import calendarIcon from "../assets/calendar-icon.png"; // 캘린더 아이콘 이미지 경로 (준비 필요)

// --- Mock Data (제거됨) ---
// const dummyUser = { ... }; // 제거됨
// const dummyExpenses = [ ... ]; // 제거됨
// const dummyTrips = [ ... ]; // 제거됨

// --- Styled Components ---

const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh; // 화면 전체 높이 사용
  display: flex;
  flex-direction: column; // 자식 요소들을 세로로 정렬
`;

const MainContent = styled.main`
  width: 90rem;
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
  ${Button} {
    // ListCard 내의 Button 스타일 조정
    width: 100%; // 버튼 너비를 카드에 맞게 100%
  }
`;

// --- Mypage Component ---
function Mypage() {
  //  Mock 데이터 대신 null 과 빈 배열( [] )로 state를 초기화합니다.
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null); // 에러 상태 관리를 위함

  //  컴포넌트가 처음 렌더링될 때(Mount) 백엔드에서 데이터를 가져옵니다.
  useEffect(() => {
    // 데이터를 가져오는 비동기 함수 선언
    const fetchMyPageData = async () => {
      try {
        // 인증 토큰과 userId 가져오기
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        // (방어 코드) 인증 정보가 없으면 API를 호출하지 않음
        if (!accessToken || !userId) {
          throw new Error("로그인 정보가 없습니다.");
        }

        //  명세서에 맞게 단일 API 호출
        // URL에 {userId}를 동적으로 삽입합니다.
        const response = await fetch(`/api/mypage/${userId}`, {
          method: "GET",
          headers: {
            // (추가) 명세서에 정의된 인증 헤더 추가
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        //  응답 데이터를 JSON으로 변환
        const responseData = await response.json();

        //  명세서에 정의된 성공/실패 코드('code')로 분기
        if (responseData.code === "SU") {
          // (성공)
          //  명세서의 'data' 객체 구조에 맞게 state 업데이트
          setUser(responseData.data.user);
          setExpenses(responseData.data.expensesByDate.items);
          setTrips(responseData.data.groups);
        } else {
          // (실패) API 응답은 성공(200 OK)했으나, 비즈니스 로직 에러 (예: "NG", "DBE")
          // 명세서의 'message'를 에러 메시지로 사용
          throw new Error(responseData.message || "데이터를 불러오는데 실패했습니다.");
        }
        
      } catch (err) {
        // 네트워크 에러 또는 위에서 throw된 에러
        console.error("데이터 페칭 실패:", err);
        setError(err);
        // !! 중요: 실패 시 state가 업데이트되지 않으므로,
        // 컴포넌트는 초기값(null, [])을 계속 보여줍니다.
      }
    };

    fetchMyPageData(); // 위에서 선언한 함수 실행
  }, []); // 빈 배열(dependency array): 컴포넌트가 처음 마운트될 때 1회만 실행

  // Header에 전달할 사용자 이름 (state에서 가져옴)
  const userDisplayName = user?.name;

  return (
    <PageWrapper>
      {/* <Header userName={userDisplayName} /> */} {/* Header 컴포넌트가 있다면 주석 해제 */}
      <MainContent>
        {/* 에러가 발생했다면 사용자에게 알림 */}
        {error && (
          <div style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}>
            {/* 에러 객체의 'message'를 표시 (임시 데이터 관련 문구 제거) */}
            데이터 로딩 실패: {error.message}
          </div>
        )}

        <PageTitle>마이페이지</PageTitle>
        <ContentGrid>
          <ProfileInfo>
            <InfoField>
              <label>이름</label>
              {/*
                user가 null일 수 있으므로 optional chaining (?.) 사용
                데이터가 로드되기 전이나 실패 시 빈 값으로 표시됨
              */}
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
              {/* 'expenses' state를 순회 (초기값 [] 이므로 map 사용 가능) */}
              {expenses?.map((item) => (
                <li key={item.date}>
                  {item.date}: {item.amount.toLocaleString('ko-KR')}원
                </li>
              ))}
            </ul>
            <Button to="/expenses" variant="primary" text={"더보기"} />
          </ListCard>
          <ListCard>
            <h3>내 여행 목록</h3>
            <ul>
              {/* 'trips' state를 순회 (초기값 [] 이므로 map 사용 가능) */}
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