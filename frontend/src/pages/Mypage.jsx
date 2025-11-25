// src/pages/Mypage.jsx

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../components/Button"; // 공용 버튼 컴포넌트
import ExchangeRateModal from "../components/ExchangeRateModal"; 

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
  padding: 8rem 0rem 3rem 0rem; 
  box-sizing: border-box;

  @media (max-width: 1024px) {
    width: 95%;
    padding-top: 10rem;
  }
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
  margin-bottom: 3rem;
`;

const Card = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column; /* 카드 내부 요소 세로 정렬 */
`;

const ProfileInfo = styled(Card)``;

const InfoLabel = styled.label`
  display: block;
  color: #888;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const InfoField = styled.div`
  margin-bottom: 1.5rem;

  p {
    background-color: #f4f6f8;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin: 0;
    font-size: 1rem;
    color: #333;
    min-height: 1.5rem;
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
    flex-grow: 1; /* 리스트가 공간을 차지하도록 설정 */
  }
  li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
    color: #555;
    &:last-child {
      border-bottom: none;
    }
  }
  & > button, & > a {
    width: 100%;
    margin-top: auto; /* 버튼을 항상 하단으로 밀어냄 */
  }
`;

// --- 환율 패널 스타일 ---
const ExchangePanel = styled(Card)`
  justify-content: space-between;

  h3 {
    margin-top: 0;
    margin-bottom: 2rem;
    font-size: 1.5rem;
    color: #333;
  }
`;

const ExchangeField = styled.div`
  margin-bottom: auto; 
`;

const ExchangeSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #f4f6f8;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  appearance: none;
  
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;

  &:focus {
    outline: 2px solid #007bff;
    background-color: #fff;
  }
`;

const GraphButton = styled.button`
  width: fit-content; 
  align-self: center;
  padding: 1rem 3rem; 
  margin-top: 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

// --- Mypage Component ---
function Mypage() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  const openGraphModal = () => {
    setIsModalOpen(true);
  };

  const closeGraphModal = () => {
    setIsModalOpen(false);
  };

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
        
        {/* 상단: 프로필 + 여행 목록(위치 이동됨) */}
        <ContentGrid>
          <ProfileInfo>
            <InfoField>
              <InfoLabel>이름</InfoLabel>
              <p>{user?.name}</p>
            </InfoField>
            <InfoField>
              <InfoLabel>아이디</InfoLabel>
              <p>{user?.email}</p>
            </InfoField>
            <InfoField>
              <InfoLabel>전화번호</InfoLabel>
              <p>{user?.phone}</p>
            </InfoField>
            <InfoField>
              <InfoLabel>비밀번호</InfoLabel>
              <p>************</p>
            </InfoField>
          </ProfileInfo>

          {/* [변경됨] 원래 아래에 있던 여행 목록을 위로 이동 */}
          <ListCard>
            <h3>내 여행 목록</h3>
            <ul>
              {trips?.map((item) => (
                <li key={item.groupId}>{item.name}</li>
              ))}
            </ul>
            <Button to="/groups" variant="primary" text={"더보기"} />
          </ListCard>
        </ContentGrid>

        {/* 하단: 지출 목록 + 환율 계산기(위치 이동됨) */}
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
          </ListCard>
          
          {/* [변경됨] 원래 위에 있던 환율 패널을 아래로 이동 */}
          <ExchangePanel>
            <h3>환율 계산기</h3>
            
            <ExchangeField>
              <InfoLabel>통화 선택</InfoLabel>
              <ExchangeSelect value={selectedCurrency} onChange={handleCurrencyChange}>
                <option value="KRW">🇰🇷 원 (KRW)</option>
                <option value="JPY">🇯🇵 엔 (JPY)</option>
                <option value="USD">🇺🇸 달러 (USD)</option>
                <option value="CNY">🇨🇳 위안 (CNY)</option>
                <option value="HKD">🇭🇰 홍콩 (HKD)</option>
                <option value="TWD">🇹🇼 대만 (TWD)</option>
                <option value="THB">🇹🇭 바트 (THB)</option>
                <option value="VND">🇻🇳 동 (VND)</option>
                <option value="EUR">🇪🇺 유로 (EUR)</option>
              </ExchangeSelect>
            </ExchangeField>

            <GraphButton onClick={openGraphModal}>
              최근 추이 그래프 보기
            </GraphButton>
          </ExchangePanel>
        </DashboardGrid>

        <ExchangeRateModal 
          isOpen={isModalOpen} 
          onClose={closeGraphModal} 
          currency={selectedCurrency} 
        />

      </MainContent>
    </PageWrapper>
  );
}

export default Mypage;