import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button'; 

// --- CSS 리셋 ---
const GlobalPageReset = createGlobalStyle`
  body {
    margin: 0; 
    background-color: #white; 
  }
  main {
    display: block; 
    margin: 0; 
  }
`;

//  pageStyles
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

//  mainStyles
const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  padding: 60px 20px;
  background-color: #white;
  margin: 8rem auto 0 auto; /* 헤더 겹침 방지 */
`;

// topBarStyles
const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

// listStyles
const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  justify-content: center;
`;

// cardStyles
const Card = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  width: 300px;
  margin: 0 auto;
`;

//  imagePlaceholderStyles
const ImagePlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #aaa;
  margin-bottom: 16px;
`;

// moreButtonContainerStyles
const MoreButtonContainer = styled.div`
  text-align: center;
  margin-top: 40px;
`;

//  infoMessageStyles
const InfoMessage = styled.p`
  text-align: center;
  color: #dc3545;
  margin-bottom: 20px;
  font-weight: bold;
`;
// --- 스타일 정의 끝 ---


// 목업 데이터 (테스트용 6개)
const mockTravelData = [
  { id: 1, title: '태국 여행', description: '모임 설명 1' },
  { id: 2, title: '중딩 친구들과 일본여행', description: '모임 설명 2' },
  { id: 3, title: '3박 4일 싱가포르 여행', description: '모임 설명 3' },
  { id: 4, title: '제주도 2박 3일', description: '모임 설명 4' },
  { id: 5, title: '부산 맛집 투어', description: '모임 설명 5' },
  { id: 6, title: '강릉 당일치기', description: '모임 설명 6' },
];

const ITEMS_PER_LOAD = 3;

function Trips() {
  const [allTravelList, setAllTravelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  useEffect(() => {
    async function fetchTravels() {
      setLoading(true);
      setInfoMessage('');
      try {
        const response = await fetch('/api/groups/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error(`서버 응답 에러: ${response.status}`);
        const data = await response.json();
        if (data && data.length > 0) {
          setAllTravelList(data);
        } else {
          setInfoMessage('저장된 여행 목록이 없습니다. 예시 데이터를 표시합니다.');
          setAllTravelList(mockTravelData); 
        }
      } catch (error) {
        console.error("여행 목록 로딩 실패:", error);
        setInfoMessage('데이터를 받아오지 못했습니다. 예시 데이터를 표시합니다.');
        setAllTravelList(mockTravelData); 
      } finally {
        setLoading(false);
      }
    }
    fetchTravels();
  }, []); 

  const handleMoreClick = () => {
    const isAllVisible = visibleCount >= allTravelList.length;
    if (isAllVisible) {
      setVisibleCount(ITEMS_PER_LOAD);
    } else {
      setVisibleCount(prevCount => prevCount + ITEMS_PER_LOAD);
    }
  };

  const isAllVisible = !loading && visibleCount >= allTravelList.length;
  const buttonText = isAllVisible ? "접기" : "더보기";

  return (
    // 3. JSX를 스타일 컴포넌트로 교체
    <Wrapper>
      <GlobalPageReset /> 
      <Header />
      
      <Main>
         <TopBar>
          <Button text="+ 여행 추가하기" variant="primary" to="/GroupCreate" />
        </TopBar>
        
        {infoMessage && (
          <InfoMessage>{infoMessage}</InfoMessage>
        )}

        <CardList>
          {loading ? (
            <p>여행 목록을 불러오는 중입니다...</p>
          ) : (
            allTravelList.slice(0, visibleCount).map(travel => (
              <Card key={travel.id}>
                <ImagePlaceholder>
                  <span>(이미지 영역)</span>
                </ImagePlaceholder>
                <h3>{travel.title}</h3>
                <p>{travel.description}</p>
              </Card>
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
    </Wrapper>
  );
}

export default Trips;