import React, { useState } from "react";
import styled from "styled-components";
import Header from "../components/Header"; // 1. 공용 헤더 컴포넌트
import Button from "../components/Button"; // 2. 공용 버튼 컴포넌트
import Footer from "../components/Footer"; // 3. 공용 푸터 컴포넌트

// --- Mock Data (스크린샷 이미지 기준) ---
const dummySchedules = {
  2: [{ id: "s1", title: "Quotes", color: "#e0f2fe" }],
  3: [{ id: "s2", title: "팀 적응", color: "#dcfce7" }],
  5: [
    { id: "s3", title: "Quotes", color: "#e0f2fe" },
    { id: "s4", title: "Giveaway", color: "#fff7ed" },
  ],
  12: [
    { id: "s5", title: "Quotes", color: "#e0f2fe" },
    { id: "s6", title: "Giveaway", color: "#fff7ed" },
  ],
  14: [{ id: "s11", title: "Quotes", color: "#e0f2fe" }],
  19: [
    { id: "s12", title: "Quotes", color: "#e0f2fe" },
    { id: "s13", title: "Giveaway", color: "#fff7ed" },
  ],
  21: [
    { id: "s14", title: "Quotes", color: "#e0f2fe" },
    { id: "s15", title: "Quotes", color: "#e0f2fe" },
  ],
  22: [{ id: "s16", title: "Quotes", color: "#e0f2fe" }],
  26: [
    { id: "s17", title: "Quotes", color: "#e0f2fe" },
    { id: "s18", title: "Giveaway", color: "#fff7ed" },
  ],
  28: [
    { id: "s19", title: "Quotes", color: "#e0f2fe" },
    { id: "s20", title: "팀 적응", color: "#dcfce7" },
  ],
  29: [{ id: "s21", title: "몽 어연집", color: "#eef2ff" }],
  31: [{ id: "s22", title: "몽 어연집", color: "#eef2ff" }],
};

// --- Styled Components ---

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  /* 1. (변경) 요청하신 대로 회색 배경을 흰색으로 변경 
  */
  background-color: #ffffff; 
  
  /* 2. (핵심) position: fixed 된 헤더/푸터가 가리지 않도록
       페이지 자체에 안쪽 여백(padding)을 줍니다.
  */
  
  /* Header 높이 (6.1rem + 1.9rem = 8rem) 만큼 위쪽 여백 */
  padding-top: 8rem; 
  
  /* Footer 높이 (약 4rem) 만큼 아래쪽 여백 */
  padding-bottom: 4rem; 
`;

const MainContent = styled.main`
  width: 100%;
  max-width: 90rem;
  /* PageWrapper에 padding이 있으므로, 
    캘린더가 위아래로 붙지 않게 상하 마진(margin)을 줍니다.
  */
  margin: 2rem auto; 
  padding: 0 2rem;
  box-sizing: border-box;
`;

// 캘린더 상단 (월, 추가하기 버튼)
const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 2rem;
    font-weight: 600;
  }
`;

// 캘린더 전체 그리드
const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr); // 7열
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
`;

// 캘린더 '요일' (MON, TUE...)
const DayHeader = styled.div`
  text-align: center;
  padding: 0.75rem 0.5rem;
  font-weight: 500;
  color: #888;
  background-color: #fafafa;
  font-size: 0.9rem;
  border-bottom: 1px solid #e0e0e0;
`;

// 캘린더 '날짜' 칸
const DayCell = styled.div`
  min-height: 120px;
  padding: 0.5rem;
  border-left: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
  color: ${(props) => (props.$isOtherMonth ? "#ccc" : "#333")};

  &:nth-child(7n + 1) {
    border-left: none;
  }
  &:nth-child(-n + 7) {
    border-top: none;
  }
`;

// 날짜 칸 안의 '일정' 아이템
const ScheduleItem = styled.div`
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: ${(props) => props.$bgColor || "#e0f2fe"};
  color: #333;
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// --- 모달 (Modal) 관련 Styled Components ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  width: 90%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background-color: #3b82f6;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  input {
    font-size: 1rem;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;

    &::placeholder {
      color: #aaa;
    }
  }
`;

const ModalFooter = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;

  ${Button} {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
  }
`;

// --- Calendar 컴포넌트 ---

const CALENDAR_DAYS = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];
const CALENDAR_DATES = [
  { day: 30, isOtherMonth: true },
  { day: 31, isOtherMonth: true },
  { day: 1, isOtherMonth: false },
  { day: 2, isOtherMonth: false },
  { day: 3, isOtherMonth: false },
  { day: 4, isOtherMonth: false },
  { day: 5, isOtherMonth: false },
  { day: 6, isOtherMonth: false },
  { day: 7, isOtherMonth: false },
  { day: 8, isOtherMonth: false },
  { day: 9, isOtherMonth: false },
  { day: 10, isOtherMonth: false },
  { day: 11, isOtherMonth: false },
  { day: 12, isOtherMonth: false },
  { day: 13, isOtherMonth: false },
  { day: 14, isOtherMonth: false },
  { day: 15, isOtherMonth: false },
  { day: 16, isOtherMonth: false },
  { day: 17, isOtherMonth: false },
  { day: 18, isOtherMonth: false },
  { day: 19, isOtherMonth: false },
  { day: 20, isOtherMonth: false },
  { day: 21, isOtherMonth: false },
  { day: 22, isOtherMonth: false },
  { day: 23, isOtherMonth: false },
  { day: 24, isOtherMonth: false },
  { day: 25, isOtherMonth: false },
  { day: 26, isOtherMonth: false },
  { day: 27, isOtherMonth: false },
  { day: 28, isOtherMonth: false },
  { day: 29, isOtherMonth: false },
  { day: 30, isOtherMonth: false },
  { day: 31, isOtherMonth: false },
  { day: 1, isOtherMonth: true },
  { day: 2, isOtherMonth: true },
];

function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleInput, setScheduleInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [placeInput, setPlaceInput] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setScheduleInput("");
    setDateInput("");
    setPlaceInput("");
  };

  const handleSave = () => {
    console.log("저장할 데이터:", {
      schedule: scheduleInput,
      date: dateInput,
      place: placeInput,
    });
    handleCloseModal();
  };

  return (
    <PageWrapper>
      <Header />

      <MainContent>
        <CalendarHeader>
          <h2>Jan, 2025</h2>
          <Button
            onClick={handleOpenModal}
            variant="primary"
            text="추가하기"
          />
        </CalendarHeader>

        <CalendarGrid>
          {CALENDAR_DAYS.map((day) => (
            <DayHeader key={day}>{day}</DayHeader>
          ))}
          {CALENDAR_DATES.map((dateInfo, index) => (
            <DayCell key={index} $isOtherMonth={dateInfo.isOtherMonth}>
              {dateInfo.day}
              {!dateInfo.isOtherMonth &&
                dummySchedules[dateInfo.day]?.map((schedule) => (
                  <ScheduleItem key={schedule.id} $bgColor={schedule.color}>
                    {schedule.title}
                  </ScheduleItem>
                ))}
            </DayCell>
          ))}
        </CalendarGrid>
      </MainContent>

      <Footer />

      {isModalOpen && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span>일정 추가</span>
              <button onClick={handleCloseModal}>&times;</button>
            </ModalHeader>

            <ModalBody>
              <InputGroup>
                <label>일정</label>
                <input
                  type="text"
                  placeholder="입력하세요"
                  value={scheduleInput}
                  onChange={(e) => setScheduleInput(e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <label>날짜</label>
                <input
                  type="text"
                  placeholder="yyyy.mm.dd"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <label>장소</label>
                <input
                  type="text"
                  placeholder="입력하세요"
                  value={placeInput}
                  onChange={(e) => setPlaceInput(e.target.value)}
                />
              </InputGroup>
            </ModalBody>

            <ModalFooter>
              <Button
                onClick={handleSave}
                variant="primary"
                text="저장"
              />
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

export default Calendar;