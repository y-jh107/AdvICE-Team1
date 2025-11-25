import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../config.js";

// --- [새로 추가됨] 로컬 기본 이미지 Import ---
import defaultImage from '../assets/map-location.png';

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
  font-weight: 600;  
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
    font-weight: normal;
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

// [수정됨] 이미지 태그 스타일
const CardImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: #f0f0e0; /* 이미지가 로딩되기 전 잠깐 보이는 배경색 */
`;

// [삭제됨] 더 이상 ImagePlaceholder 컴포넌트는 사용하지 않습니다.

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

// --- 5. 모달 컴포넌트 ---
function TripDetailModal({ tripId }) { 
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tripId) return; 

    async function fetchTripDetails() {
      setLoading(true);
      setError(null);
      setDetails(null); 
      try {
        const accessToken = localStorage.getItem("accessToken"); 
        if (!accessToken) throw new Error("로그인이 필요합니다. (AR)");

        const response = await fetch(`${API_BASE_URL}/groups/${tripId}`, { 
            method: "GET",
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
      } finally {
        setLoading(false);
      }
    }

    fetchTripDetails();
  }, [tripId]); 

  if (loading) return <DetailWrapper><p>상세 정보를 불러오는 중...</p></DetailWrapper>;
  if (error) return <DetailWrapper><InfoMessage>{error}</InfoMessage></DetailWrapper>;
  if (!details) return <DetailWrapper><p>데이터가 없습니다.</p></DetailWrapper>;

  return (
    <DetailWrapper>
      <Title>
        {details.group?.name}
      </Title>
      
      <MemberTable>
        <Row>
          <Cell>{details.owner?.name}</Cell>
          <Cell>{details.owner?.email}</Cell>
          <Cell>{details.owner?.totalSpend?.toLocaleString('ko-KR')}원</Cell>
        </Row>
        {details.members && details.members.map(member => (
          <Row key={member.id}>
            <Cell>{member.name}</Cell>
            <Cell>{member.userId}</Cell>
            <Cell>{member.totalSpend?.toLocaleString('ko-KR')}원</Cell>
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
          <Button text="+ 모임 추가하기" variant="primary" to="/groupform" />
        </TopBar>
        
        {infoMessage && <InfoMessage>{infoMessage}</InfoMessage>}

        <CardList>
          {loading ? (
            <p>모임 목록을 불러오는 중입니다...</p>
          ) : (
            allTravelList.slice(0, visibleCount).map(travel => {
              
              // 이미지 처리 로직
              let imageSrc = null;
              if (travel.image) {
                if (travel.image.startsWith('http') || travel.image.startsWith('data:')) {
                  imageSrc = travel.image;
                } else {
                  imageSrc = `data:image/jpeg;base64,${travel.image}`;
                }
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
                    {/* [수정됨] 이미지가 있으면 그 이미지를, 없으면 import한 기본 이미지를 보여줍니다. */}
                    {/* OR 연산자 (||)를 사용하여 imageSrc가 없을 때 defaultImage를 사용합니다. */}
                    <CardImage 
                      src={imageSrc || defaultImage} 
                      alt={travel.name} 
                    />
                    
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