import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../config.js";
import defaultImage from "../assets/map-location.png";

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

// --- 1. 모달 스타일 (컨테이너) ---
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; 
`;

const ModalContainer = styled.div`
  width: 90%;
  max-width: 650px;
  background-color: #f8f9fa;
  padding: 2.5rem 2rem; 
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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
  font-size: 1.5rem; 
  font-weight: 700;  
  color: #333; 
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const InfoBox = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  flex: ${({ flex }) => flex || 1}; 
`;

const AmountBox = styled(InfoBox)`
  font-weight: 700;
  color: #333;
  cursor: default;
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
const CardImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: #f0f0e0;
`;
const MoreButtonContainer = styled.div`
  text-align: center;
  margin-top: 40px;
`;
const InfoMessage = styled.p`
  text-align: center;
  color: #dc3545;
  margin-bottom: 20px;
  font-weight: 400;
`;

const ITEMS_PER_LOAD = 3;

// --- 4. 모달 내부 컨텐츠 컴포넌트 ---
function TripDetailModal({ tripId, onClose }) { 
  const [details, setDetails] = useState(null);
  const [spendings, setSpendings] = useState({}); // userId별 합산 금액 저장
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tripId) return; 

    async function fetchData() {
      setLoading(true);
      setError(null);
      setDetails(null); 
      setSpendings({}); 

      try {
        const accessToken = localStorage.getItem("accessToken"); 
        if (!accessToken) throw new Error("로그인이 필요합니다.");

        const headers = {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        };

        // 1. 그룹 상세 정보 호출
        const groupResponse = await fetch(`${API_BASE_URL}/groups/${tripId}`, { 
            method: "GET",
            headers: headers
        });

        if (!groupResponse.ok) throw new Error(`그룹 정보 로딩 실패: ${groupResponse.status}`);
        const groupData = await groupResponse.json();

        if (groupData.code !== "SU") {
          throw new Error(groupData.message || "그룹 정보를 불러오지 못했습니다.");
        }

        // 2. 그룹 지출 내역 호출 (금액 합산용)
        const expenseResponse = await fetch(`${API_BASE_URL}/groups/${tripId}/expenses`, {
            method: "GET",
            headers: headers
        });

        if (!expenseResponse.ok) throw new Error(`지출 내역 로딩 실패: ${expenseResponse.status}`);
        const expenseData = await expenseResponse.json();

        // 3. 지출 내역 순회하며 userId별 myAmount 합산
        const userTotalMap = {};

        if (expenseData.code === "SU" && Array.isArray(expenseData.data)) {
          expenseData.data.forEach(expense => {
            if (expense.participants && Array.isArray(expense.participants)) {
              expense.participants.forEach(p => {
                if (p.userId) {
                  const currentTotal = userTotalMap[p.userId] || 0;
                  userTotalMap[p.userId] = currentTotal + (p.myAmount || 0);
                }
              });
            }
          });
        }

        setDetails(groupData.data);
        setSpendings(userTotalMap);
        
      } catch (err) {
        console.error("모달 데이터 로딩 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tripId]); 

  if (loading) return <DetailWrapper><p style={{textAlign:'center'}}>로딩 중...</p></DetailWrapper>;
  if (error) return <DetailWrapper><InfoMessage>{error}</InfoMessage></DetailWrapper>;
  if (!details) return <DetailWrapper><p style={{textAlign:'center'}}>데이터가 없습니다.</p></DetailWrapper>;

  return (
    <DetailWrapper>
      <Title>
        {details.group?.name}
      </Title>
      
      <ListContainer>
        {/* [변경됨] 첫 줄을 데이터가 아닌 '헤더(제목)'로 사용 */}
        <ListItem>
          <InfoBox flex="1" style={{backgroundColor: '#f1f3f5', fontWeight: '800', color: '#555'}}>이름</InfoBox>
          <InfoBox flex="2" style={{backgroundColor: '#f1f3f5', fontWeight: '800', color: '#555'}}>이메일</InfoBox>
          <InfoBox flex="1" style={{backgroundColor: '#f1f3f5', fontWeight: '800', color: '#555'}}>지출 금액</InfoBox>
        </ListItem>

        {/* 멤버 (Members) Rows */}
        {details.members && details.members.map(member => {
          const memberSpend = spendings[member.userId] || 0;

          return (
            <ListItem key={member.userId || Math.random()}>
              <InfoBox flex="1">{member.name}</InfoBox>
              <InfoBox flex="2">{member.email}</InfoBox> 
              <AmountBox flex="1">
                {memberSpend.toLocaleString('ko-KR')}원
              </AmountBox>
            </ListItem>
          );
        })}
      </ListContainer>
    </DetailWrapper>
  );
}

// --- 5. 모달 래퍼 컴포넌트 ---
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

        const response = await fetch(`${API_BASE_URL}/groups`, { 
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
        setInfoMessage(error.message || '데이터를 받아오지 못했습니다.');
        setAllTravelList([]); 
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []); 

  const handleMoreClick = () => {
    if (visibleCount >= allTravelList.length) {
      setVisibleCount(ITEMS_PER_LOAD); 
    } else {
      setVisibleCount(prev => prev + ITEMS_PER_LOAD); 
    }
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
          <Button text="+ 모임 추가하기" variant="primary" to="/groupform" />
        </TopBar>
        
        {infoMessage && <InfoMessage>{infoMessage}</InfoMessage>}

        <CardList>
          {loading ? (
            <p>모임 목록을 불러오는 중입니다...</p>
          ) : (
            allTravelList.slice(0, visibleCount).map(travel => {
              
              let imageSrc = null;
              if (travel.image && travel.image !== "null" && travel.image !== "") {
                if (travel.image.startsWith('http') || travel.image.startsWith('data:')) {
                  imageSrc = travel.image;
                } else {
                  imageSrc = `data:image/jpeg;base64,${travel.image}`;
              }
            } else {
              imageSrc = defaultImage; 
            }

              return (
                <Link 
                  key={travel.id}
                  to={`/expenseredirect?groupId=${travel.id}&groupName=${encodeURIComponent(travel.name)}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card 
                    onMouseEnter={() => handleCardEnter(travel.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <CardImage src={imageSrc} alt={travel.name} />
                    <h3>{travel.name}</h3>
                    <p>{travel.description}</p>
                  </Card>
                </Link>
              );
            })
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