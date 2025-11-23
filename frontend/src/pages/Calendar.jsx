import React, { useState, useMemo, useEffect } from "react"; 
import styled from "styled-components";
// [수정] URL 파라미터를 읽기 위해 추가
import { useSearchParams } from "react-router-dom"; 
import Header from "../components/Header";
import Button from "../components/Button";
import Footer from "../components/Footer";
// [수정] API 주소 설정 가져오기
import { API_BASE_URL } from "../config"; 

// --- 1. 헬퍼 함수 & 상수 ---
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`; 
};

const SCHEDULE_COLORS = {
  event: "#eef2ff", 
};

const CALENDAR_DAYS = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
});

// --- 2. 스타일 컴포넌트 ---
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  padding-top: 5rem; 
  padding-bottom: 4rem; 
`;

const MainContent = styled.main`
  width: 100%;
  max-width: 90rem;
  margin: 2rem auto; 
  padding: 0 2rem;
  box-sizing: border-box;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
`;

const MonthControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h2 {
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
    text-align: center;
    white-space: nowrap;
  }

  button {
    background: none;
    border: 1px solid #ccc;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background-color: #f0f0f0;
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
`;

const DayHeader = styled.div`
  text-align: center;
  padding: 0.75rem 0.5rem;
  font-weight: 500;
  color: #888;
  background-color: #fafafa;
  font-size: 0.9rem;
  border-bottom: 1px solid #e0e0e0;
`;

const DayCell = styled.div`
  min-height: 120px;
  padding: 0.5rem;
  border-left: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
  background-color: ${(props) => (props.$isCurrentMonth ? "#ffffff" : "#f0f0f0")};
  color: ${(props) => (props.$isCurrentMonth ? "#333" : "#aaa")};

  &:nth-child(7n + 1) {
    border-left: none;
  }
  &:nth-child(-n + 7) {
    border-top: none;
  }
`;

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
  cursor: pointer; 
  
  &:hover {
    opacity: 0.8;
  }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContent = styled.div`
  background-color: white; width: 90%; max-width: 400px;
  border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;
const ModalHeader = styled.div`
  background-color: #3b82f6; color: white; padding: 1rem;
  display: flex; justify-content: space-between; align-items: center;
  button { background: none; border: none; color: white;
    font-size: 1.2rem; font-weight: bold; cursor: pointer; }
`;
const ModalBody = styled.div`
  padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem;
`;
const InputGroup = styled.div`
  display: flex; flex-direction: column;
  label { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
  input { font-size: 1rem; padding: 0.75rem; border: 1px solid #ccc;
    border-radius: 6px; &::placeholder { color: #aaa; } }
`;
const DetailText = styled.p`
  font-size: 1rem;
  margin: 0.5rem 0;
  span {
    font-weight: 500;
    color: #555;
    display: inline-block;
    width: 60px;
  }
`;
const ModalFooter = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  ${Button} { width: 100%; padding: 0.75rem; font-size: 1rem; }
`;


// --- 3. 메인 컴포넌트 ---
function Calendar() {
  // [핵심 수정 1] URL 쿼리 파라미터에서 groupId 추출
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // 입력 폼 상태
  const [scheduleInput, setScheduleInput] = useState("");
  const [dateInput, setDateInput] = useState(() => formatDateString(new Date()));
  const [timeInput, setTimeInput] = useState("09:00");
  const [placeInput, setPlaceInput] = useState("");

  // 데이터 상태
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 초기화 시 groupId 확인
  useEffect(() => {
    if (!groupId) {
      alert("잘못된 접근입니다. 모임 정보가 없습니다.");
    }
  }, [groupId]);

  // 월 변경 시 스케줄 초기화 (추후 GET API 연동 위치)
  useEffect(() => {
    setSchedules({});
    console.log(`${dateFormatter.format(currentDate)}로 변경됨. (API 조회 필요)`);
  }, [currentDate]);

  // 달력 날짜 계산 (useMemo)
  const calendarDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    
    const dates = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      dates.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({ day: i, isCurrentMonth: true });
    }
    const remaining = 42 - dates.length;
    for (let i = 1; i <= remaining; i++) {
      dates.push({ day: i, isCurrentMonth: false });
    }
    return dates;
  }, [currentDate]);

  // 핸들러 함수들
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
  const handleOpenAddModal = () => {
    const firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    setDateInput(formatDateString(firstDayOfCurrentMonth)); 
    setTimeInput("09:00");
    setScheduleInput("");
    setPlaceInput("");
    setIsAddModalOpen(true);
  };
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  // [핵심 수정 2] 일정 저장 (POST)
  const handleSave = async () => {
    if (!scheduleInput || !dateInput || !timeInput) {
      alert("일정, 날짜, 시간을 모두 입력해주세요.");
      return;
    }
    if (!groupId) {
      alert("모임 정보를 찾을 수 없습니다.");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        setIsLoading(false);
        return;
    }

    try {
      const dateString = `${dateInput}T${timeInput}:00+09:00`;
      
      const requestBody = {
        name: scheduleInput,
        location: placeInput,
        date: dateString,
      };

      // API_BASE_URL과 groupId 사용
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/calendar/event`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (responseData.code === "SU") {
        const newEvent = responseData.data.event || {
          eventId: Date.now(),
          name: scheduleInput,
          date: dateString
        }; 
        
        const day = new Date(newEvent.date).getDate();
        const schedulesForDay = schedules[day] || [];
        
        const newScheduleItem = {
          id: newEvent.eventId,
          title: newEvent.name,
          type: 'event',
          color: SCHEDULE_COLORS.event,
        };

        setSchedules((prevSchedules) => ({
          ...prevSchedules,
          [day]: [...schedulesForDay, newScheduleItem],
        }));
        
        handleCloseAddModal();
        alert("일정이 등록되었습니다.");
      } else {
        throw new Error(responseData.message || "등록에 실패했습니다.");
      }
    } catch (err) {
      console.error("일정 등록 실패:", err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // [핵심 수정 3] 일정 상세 조회 (GET)
  const handleEventClick = async (schedule) => {
    if (schedule.type !== 'event') {
      alert("지출 항목 상세 조회는 현재 지원되지 않습니다.");
      return;
    }
    if (!groupId) {
        alert("모임 정보를 찾을 수 없습니다.");
        return;
    }

    setIsDetailModalOpen(true);
    setSelectedDetail(null); 
    setIsLoading(true);
    setError(null);
    
    const accessToken = localStorage.getItem("accessToken");

    try {
      const apiUrl = `${API_BASE_URL}/groups/${groupId}/calendar/${schedule.id}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Authorization": `Bearer ${accessToken}` },
      });

      const responseData = await response.json();
      
      if (responseData.code === "SU") {
        setSelectedDetail(responseData.data.event);
      } else {
        throw new Error(responseData.message || "상세 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("상세 조회 실패:", err);
      alert(err.message);
      setIsDetailModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonthMin = formatDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const currentMonthMax = formatDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), lastDay));

  return (
    <PageWrapper>
      <Header />

      <MainContent>
        <CalendarHeader>
          <MonthControl>
            <button onClick={handlePrevMonth}>{"<"}</button>
            <h2>{dateFormatter.format(currentDate)}</h2>
            <button onClick={handleNextMonth}>{">"}</button>
          </MonthControl>
          
          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            text="추가하기"
          />
        </CalendarHeader>

        <CalendarGrid>
          {CALENDAR_DAYS.map((day) => (
            <DayHeader key={day}>{day}</DayHeader>
          ))}
          
          {calendarDates.map((dateInfo, index) => (
            <DayCell key={index} $isCurrentMonth={dateInfo.isCurrentMonth}>
              {dateInfo.day}
              
              {dateInfo.isCurrentMonth &&
                schedules[dateInfo.day]?.map((schedule) => (
                  <ScheduleItem 
                    key={schedule.id} 
                    $bgColor={schedule.color}
                    onClick={() => handleEventClick(schedule)}
                  >
                    {schedule.title}
                  </ScheduleItem>
                ))}
            </DayCell>
          ))}
        </CalendarGrid>
      </MainContent>

      <Footer />

      {/* 일정 추가 모달 */}
      {isAddModalOpen && (
        <ModalOverlay onClick={handleCloseAddModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span>일정 추가</span>
              <button onClick={handleCloseAddModal}>&times;</button>
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
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  min={currentMonthMin}
                  max={currentMonthMax}
                />
              </InputGroup>
              <InputGroup>
                <label>시간</label>
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
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
                text={isLoading ? "저장 중..." : "저장"}
                disabled={isLoading}
              />
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {/* 일정 상세 모달 */}
      {isDetailModalOpen && (
        <ModalOverlay onClick={() => setIsDetailModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span>일정 상세</span>
              <button onClick={() => setIsDetailModalOpen(false)}>&times;</button>
            </ModalHeader>
            <ModalBody>
              {isLoading && <p>상세 정보 로딩 중...</p>}
              {error && <p style={{ color: 'red' }}>에러: {error.message}</p>}
              
              {selectedDetail && (
                <>
                  <DetailText><span>일정:</span> {selectedDetail.name}</DetailText>
                  <DetailText><span>날짜:</span> {new Date(selectedDetail.date).toLocaleString('ko-KR')}</DetailText>
                  
                  {selectedDetail.location && (
                    <DetailText><span>장소:</span> {selectedDetail.location}</DetailText>
                  )}
                </>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

export default Calendar;