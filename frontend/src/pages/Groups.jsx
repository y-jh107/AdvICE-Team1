import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button'; 
import { Link } from 'react-router-dom';

// --- CSS 리셋 ---
const GlobalPageReset = createGlobalStyle`
  body {
    margin: 0; 
    background-color: white; 
  }
  main {
    display: block; 
    margin: 0; 
  }
`;

// --- 1. 모달 스타일 ---
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; 
`;
const ModalContainer = styled.div`
  width: 90%;
  max-width: 600px; 
  background-color: white;
  padding: 1.5rem 2rem 2rem 2rem; 
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
`;
const CloseButtonWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

// --- 2. 모달 내용 스타일 ---
const DetailWrapper = styled.div`
  padding: 0;
  margin-top: 0; 
`;
const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.8rem; 
  font-weight: 700;  
  color: inherit; 
`;
const MemberTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr; 
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  &:first-child {
    background-color: #f4f6f8;
    font-weight: bold;
  }
`;
const Cell = styled.div`
  font-size: 0.95rem;
  &:last-child {
    text-align: right;
  }
`;

// --- 3. Groups 페이지 스타일 ---
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;
const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  padding: 60px 20px;
  background-color: white;
  margin: 8rem auto 0 auto; 
`;
const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;
const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  justify-content: center;
`;
const Card = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  width: 300px;
  margin: 0 auto;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;
const ImagePlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background-color: #f0f0e0;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #aaa;
  margin-bottom: 16px;
`;
const MoreButtonContainer = styled.div`
  text-align: center;
  margin-top: 40px;
`;
const InfoMessage = styled.p`
  text-align: center;
  color: #dc3545;
  margin-bottom: 20px;
  font-weight: bold;
`;

// --- 4. 목업 데이터 ---
// DTO에 맞게 'memo' 사용
const mockTravelData = [
  { id: 1, name: '태국 여행', memo: '모임 설명 1' },
  { id: 2, name: '중딩 친구들과 일본여행', memo: '모임 설명 2' },
  { id: 3, name: '3박 4일 싱가포르', memo: '모임 설명 3' },
  { id: 4, name: '제주도 2박 3일', memo: '모임 설명 4' },
  { id: 5, name: '부산 맛집 투어', memo: '모임 설명 5' },
  { id: 6, name: '강릉 당일치기', memo: '모임 설명 6' },
];

const mockDetailData = { 
  group: { name: '태국 여행 (임시)' },
  owner: { name: '장주연', email: 'jang@gmail.com', totalSpend: 200000 },
  members: [
    { id: 101, name: '변영빈', userId: 'bgun_id', totalSpend: 50000 },
    { id: 102, name: '양진혁', userId: 'yjh_id', totalSpend: 75000 },
    { id: 103, name: '유승열', userId: 'ysy_id', totalSpend: 25000 },
  ],
  expenses: []
};

const ITEMS_PER_LOAD = 3;

// --- 5. 모달 컴포넌트 ---
function TripDetailModal({ tripId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tripId) return; 

    async function fetchTripDetails() {
      setLoading(true);
      setError(null);
      try {
        // --- ⬇️ 수정된 부분 ⬇️ ---
        // 'authToken' -> 'accessToken'으로 수정
        const accessToken = localStorage.getItem("accessToken"); 
        if (!accessToken) throw new Error("로그인이 필요합니다. (AR)");
        // --- ⬆️ 수정된 부분 ⬆️ ---

        const response = await fetch(`/api/group/${tripId}/`, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);
        
        const responseData = await response.json();

        if (responseData.code === "SU") {
          setDetails(responseData.data); 
        } else {
          throw new Error(responseData.message || "알 수 없는 API 오류");
        }
        
      } catch (err) {
        console.error("모달 데이터 로딩 실패:", err);
        setError(err.message);
        setDetails(mockDetailData);
      } finally {
        setLoading(false);
      }
    }

    fetchTripDetails();
  }, [tripId]); 

  if (loading) return <DetailWrapper><p>상세 정보를 불러오는 중...</p></DetailWrapper>;
  if (!details) return <DetailWrapper><p>데이터가 없습니다.</p></DetailWrapper>;

  return (
    <DetailWrapper>
      {error && <InfoMessage>{error} (임시 데이터가 표시됩니다.)</InfoMessage>}

      <Title>
        {details.group.name}
      </Title>
      
      <MemberTable>
        <Row>
          <Cell>{details.owner.name}</Cell>
          <Cell>{details.owner.email}</Cell>
          <Cell>{details.owner.totalSpend.toLocaleString('ko-KR')}원</Cell>
        </Row>
        {details.members.map(member => (
          <Row key={member.id}>
            <Cell>{member.name}</Cell>
            <Cell>{member.userId}</Cell>
            <Cell>{member.totalSpend.toLocaleString('ko-KR')}원</Cell>
          </Row>
        ))}
      </MemberTable>
    </DetailWrapper>
  );
}

function Modal({ isOpen, onClose, children, onMouseEnter, onMouseLeave }) {
  if (!isOpen) return null;
  return (
    <Backdrop 
      onClick={onClose}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButtonWrapper>
          <Button text="X" onClick={onClose} variant="secondary" />
        </CloseButtonWrapper>
        {children}
      </ModalContainer>
    </Backdrop>
  );
}

// --- 6. Groups 메인 컴포넌트 ---
function Groups() {
  const [allTravelList, setAllTravelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [selectedTripId, setSelectedTripId] = useState(null);
  
  const hoverTimerRef = useRef(null); 
  const leaveTimerRef = useRef(null); 

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      setInfoMessage('');
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('로그인 정보가 없습니다.');
        }

        const response = await fetch('/api/groups', { 
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) throw new Error(`서버 응답 에러: ${response.status}`);
        
        const responseData = await response.json(); 
        
        if (responseData.code === "SU" && responseData.data && responseData.data.length > 0) {
          setAllTravelList(responseData.data);
        } else if (responseData.code === "SU" && responseData.data.length === 0) {
          setInfoMessage('저장된 모임이 없습니다.');
          setAllTravelList([]); 
        } else {
          throw new Error(responseData.message || "데이터를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("모임 목록 로딩 실패:", error);
        setInfoMessage(error.message || '데이터를 받아오지 못했습니다. 예시 데이터를 표시합니다.');
        setAllTravelList(mockTravelData); 
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []); 

  const handleMoreClick = () => {
    const isAllVisible = visibleCount >= allTravelList.length;
    setVisibleCount(isAllVisible ? ITEMS_PER_LOAD : prev => prev + ITEMS_PER_LOAD);
  };

  const handleCloseModal = () => {
    clearTimeout(hoverTimerRef.current);
    clearTimeout(leaveTimerRef.current);
    setSelectedTripId(null);
  };

  const handleCardEnter = (tripId) => {
    clearTimeout(leaveTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setSelectedTripId(tripId);
    }, 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    leaveTimerRef.current = setTimeout(() => setSelectedTripId(null), 500);
  };
  const handleModalEnter = () => clearTimeout(leaveTimerRef.current);

  const isAllVisible = !loading && visibleCount >= allTravelList.length;
  const buttonText = isAllVisible ? "접기" : "더보기";

  return (
    <Wrapper>
      <GlobalPageReset /> 
      <Header />
      
      <Main>
        <TopBar>
          <Button text="+ 모임 추가하기" variant="primary" to="/groupcreate" />
        </TopBar>
        
        {infoMessage && <InfoMessage>{infoMessage}</InfoMessage>}

        <CardList>
          {loading ? (
            <p>모임 목록을 불러오는 중입니다...</p>
          ) : (
            allTravelList.slice(0, visibleCount).map(travel => (
              <Link 
                key={travel.id} 
                to={`/group/${travel.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card 
                  onMouseEnter={() => handleCardEnter(travel.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <ImagePlaceholder>
                    <span>(이미지 영역)</span>
                  </ImagePlaceholder>
                  {/* --- ⬇️ 수정된 부분 ⬇️ --- */}
                  {/* 'description' -> 'memo'로 수정 */}
                  <h3>{travel.name}</h3>
                  <p>{travel.memo}</p>
                  {/* --- ⬆️ 수정된 부분 ⬆️ --- */}
                </Card>
              </Link>
            ))
          )}
        </CardList>
        
        {!loading && allTravelList.length > ITEMS_PER_LOAD && (
          <MoreButtonContainer>
            <Button text={buttonText} onClick={handleMoreClick} />
          </MoreButtonContainer>
        )}
      </Main>

      <Footer />
      
      <Modal 
        isOpen={!!selectedTripId} 
        onClose={handleCloseModal}
        onMouseEnter={handleModalEnter}
        onMouseLeave={handleMouseLeave}
      >
        <TripDetailModal tripId={selectedTripId} onClose={handleCloseModal} />
      </Modal>
    </Wrapper>
  );
}

export default Groups;