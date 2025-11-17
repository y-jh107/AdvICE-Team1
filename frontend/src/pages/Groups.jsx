// src/pages/Groups.jsx
import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

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

// --- 모달 스타일 ---
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

// --- 페이지 스타일 ---
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

// ----------------------------------------------------------------------
//  Trip Detail Modal Component (실제 API 연동)
// ----------------------------------------------------------------------
function TripDetailModal({ tripId }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId) return;

    async function fetchDetails() {
      setLoading(true);
      setError("");

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("로그인이 필요합니다.");

        const res = await fetch(
          `${API_BASE_URL}/v1/groups/${tripId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!res.ok) throw new Error("상세 조회 실패");

        const data = await res.json();

        if (data.code !== "SU") {
          throw new Error(data.message || "데이터 오류");
        }

        setDetails(data.data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [tripId]);

  if (loading) return <p>로딩 중...</p>;
  if (!details) return <p>데이터 없음</p>;

  return (
    <DetailWrapper>
      {error && <InfoMessage>{error}</InfoMessage>}

      <Title>{details.group.name}</Title>

      <MemberTable>
        <Row>
          <Cell>{details.owner.name}</Cell>
          <Cell>{details.owner.email}</Cell>
          <Cell>{details.owner.totalSpend.toLocaleString()}원</Cell>
        </Row>

        {details.members.map((m) => (
          <Row key={m.id}>
            <Cell>{m.name}</Cell>
            <Cell>{m.userId}</Cell>
            <Cell>{m.totalSpend.toLocaleString()}원</Cell>
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
          <Button text="X" variant="secondary" onClick={onClose} />
        </CloseButtonWrapper>
        {children}
      </ModalContainer>
    </Backdrop>
  );
}

// ----------------------------------------------------------------------
//  Main Groups Page
// ----------------------------------------------------------------------
export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const hoverTimerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  // 그룹 목록 불러오기
  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("로그인이 필요합니다.");

        const res = await fetch(`${API_BASE_URL}/v1/groups`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error("그룹 가져오기 실패");

        const data = await res.json();

        if (data.code === "SU") {
          setGroups(data.data);
          if (data.data.length === 0) {
            setInfoMessage("등록된 모임이 없습니다.");
          }
        }
      } catch (err) {
        console.error(err);
        setInfoMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  const handleMore = () => {
    if (visibleCount >= groups.length) {
      setVisibleCount(3); // 접기
    } else {
      setVisibleCount((prev) => prev + 3);
    }
  };

  const handleCloseModal = () => {
    clearTimeout(hoverTimerRef.current);
    clearTimeout(leaveTimerRef.current);
    setSelectedTripId(null);
  };

  const handleCardEnter = (id) => {
    clearTimeout(leaveTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setSelectedTripId(id), 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    leaveTimerRef.current = setTimeout(() => setSelectedTripId(null), 500);
  };

  const handleModalEnter = () => {
    clearTimeout(leaveTimerRef.current);
  };

  return (
    <Wrapper>
      <GlobalPageReset />
      <Header />

      <Main>
        <TopBar>
          <Button text="+ 모임 추가하기" to="/groupcreate" />
        </TopBar>

        {infoMessage && <InfoMessage>{infoMessage}</InfoMessage>}

        {loading ? (
          <p>불러오는 중...</p>
        ) : (
          <CardList>
            {groups.slice(0, visibleCount).map((g) => (
              <Link
                key={g.id}
                to={`/group/${g.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card
                  onMouseEnter={() => handleCardEnter(g.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <ImagePlaceholder>(이미지)</ImagePlaceholder>
                  <h3>{g.name}</h3>
                  <p>{g.memo}</p>
                </Card>
              </Link>
            ))}
          </CardList>
        )}

        {!loading && groups.length > 3 && (
          <MoreButtonContainer>
            <Button
              text={visibleCount >= groups.length ? "접기" : "더보기"}
              onClick={handleMore}
            />
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
        <TripDetailModal tripId={selectedTripId} />
      </Modal>
    </Wrapper>
  );
}
