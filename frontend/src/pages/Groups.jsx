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
  background-color: rgba(0, 0, 0, 0.2); // 배경을 조금 더 연하게 수정
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; 
`;

const ModalContainer = styled.div`
  width: 90%;
  max-width: 650px; // 너비를 조금 더 넓힘
  background-color: #f8f9fa; // 모달 배경을 아주 연한 회색으로 (박스가 흰색이라 대비됨)
  padding: 2.5rem 2rem; 
  border-radius: 16px; // 둥근 모서리 강화
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); // 그림자 부드럽게
  position: relative;
`;

const CloseButtonWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

// --- [변경됨] 2. 모달 내용 스타일 (이미지 디자인 적용) ---
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

// 테이블 대신 리스트 컨테이너 사용
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px; // 행(Row) 사이의 간격
  max-height: 400px;
  overflow-y: auto; // 내용이 길어지면 스크롤
  padding: 4px; // 스크롤바와 내용 겹침 방지
`;

// 각 멤버 한 줄 (Row)
const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px; // 박스 사이의 간격
`;

// 데이터가 들어가는 흰색 둥근 박스 (Cell 대체)
const InfoBox = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px; // 둥근 모서리
  padding: 12px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center; // 텍스트 가운데 정렬
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); // 미세한 입체감
  
  // 내용이 넘칠 경우 처리
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  // flex-grow를 사용하여 비율 조정 (이미지 비율 참고)
  // 이름(작게) : 이메일(넓게) : 금액(중간)
  flex: ${({ flex }) => flex || 1}; 
`;

// 금액 부분은 버튼처럼 보일 수도 있으므로 스타일 추가 (선택 사항)
const AmountBox = styled(InfoBox)`
  font-weight: 700;
  color: #333;
  cursor: default;
`;

// --- 3. Groups 페이지 스타일 (기존 유지) ---
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

// --- [변경됨] 5. 모달 컴포넌트 ---
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

  if (loading) return <DetailWrapper><p style={{textAlign:'center'}}>로딩 중...</p></DetailWrapper>;
  if (error) return <DetailWrapper><InfoMessage>{error}</InfoMessage></DetailWrapper>;
  if (!details) return <DetailWrapper><p style={{textAlign:'center'}}>데이터가 없습니다.</p></DetailWrapper>;

  return (
    <DetailWrapper>
      <Title>
        {details.group?.name}
      </Title>
      
      <ListContainer>
        {/* 모임장 (Owner) Row */}
        <ListItem>
          <InfoBox flex="1">{details.owner?.name}</InfoBox>
          <InfoBox flex="2">{details.owner?.email}</InfoBox>
          <AmountBox flex="1">
             {details.owner?.totalSpend?.toLocaleString('ko-KR')}원
          </AmountBox>
        </ListItem>

        {/* 멤버 (Members) Rows */}
        {details.members && details.members.map(member => (
          <ListItem key={member.id}>
            <InfoBox flex="1">{member.name}</InfoBox>
            <InfoBox flex="2">{member.userId}</InfoBox> {/* member는 userId를 보여줌 */}
            
            {/* 사진처럼 '지출 내역' 버튼 모양을 원하면 아래 주석을 풀고 AmountBox 대신 사용하세요 */}
            {/* <AmountBox flex="1" style={{cursor: 'pointer'}}>지출 내역</AmountBox> */}
            
            <AmountBox flex="1">
              {member.totalSpend?.toLocaleString('ko-KR')}원
            </AmountBox>
          </ListItem>
        ))}
      </ListContainer>
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

// --- 6. Groups 메인 컴포넌트 (기존 유지) ---
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