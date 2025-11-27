import React, { useState, useMemo, useEffect } from "react"; 
import styled from "styled-components";
import { useSearchParams } from "react-router-dom"; 
import Header from "../components/Header";
import Button from "../components/Button";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config"; 

// --- 1. 헬퍼 함수 & 상수 ---
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`; 
};

// 시간 표시 함수는 사용하지 않지만 헬퍼로 남겨둠
const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SCHEDULE_COLORS = {
  event: "#eef2ff",  
  expense: "#fff1f2", 
};

const CALENDAR_DAYS = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
});

// --- 2. 스타일 컴포넌트 ---
const PageWrapper = styled.div`
  display: flex; flex-direction: column; min-height: 100vh;
  background-color: #ffffff; padding-top: 5rem; padding-bottom: 4rem; 
`;
const MainContent = styled.main`
  width: 100%; max-width: 90rem; margin: 2rem auto; padding: 0 2rem; box-sizing: border-box;
`;
const CalendarHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 1rem;
`;
const MonthControl = styled.div`
  display: flex; align-items: center; gap: 1rem;
  h2 { font-size: 2rem; font-weight: 600; margin: 0; text-align: center; white-space: nowrap; }
  button { background: none; border: 1px solid #ccc; border-radius: 50%; width: 30px; height: 30px;
    font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
    &:hover { background-color: #f0f0f0; } }
`;
const CalendarGrid = styled.div`
  display: grid; grid-template-columns: repeat(7, 1fr); border: 1px solid #e0e0e0;
  background-color: #ffffff; border-radius: 8px; overflow: hidden;
`;
const DayHeader = styled.div`
  text-align: center; padding: 0.75rem 0.5rem; font-weight: 500; color: #888;
  background-color: #fafafa; font-size: 0.9rem; border-bottom: 1px solid #e0e0e0;
`;
const DayCell = styled.div`
  min-height: 120px; padding: 0.5rem; border-left: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0;
  font-size: 0.9rem; background-color: ${(props) => (props.$isCurrentMonth ? "#ffffff" : "#f0f0f0")};
  color: ${(props) => (props.$isCurrentMonth ? "#333" : "#aaa")};
  &:nth-child(7n + 1) { border-left: none; }
  &:nth-child(-n + 7) { border-top: none; }
`;
const ScheduleItem = styled.div`
  font-size: 0.85rem; padding: 0.25rem 0.5rem; border-radius: 4px;
  background-color: ${(props) => props.$bgColor || "#e0f2fe"};
  color: #333; margin-top: 0.25rem; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; cursor: pointer; 
  &:hover { opacity: 0.8; }
`;
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContent = styled.div`
  background-color: white; width: 90%; max-width: 400px;
  border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); overflow: hidden;
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
  font-size: 1rem; margin: 0.5rem 0;
  span { font-weight: 600; color: #555; display: inline-block; width: 80px; }
`;
const ModalFooter = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  ${Button} { width: 100%; padding: 0.75rem; font-size: 1rem; }
`;

// --- 3. 메인 컴포넌트 ---
function Calendar() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [scheduleInput, setScheduleInput] = useState("");
  const [dateInput, setDateInput] = useState(() => formatDateString(new Date()));
  const [placeInput, setPlaceInput] = useState("");

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [schedules, setSchedules] = useState({});

  useEffect(() => {
    if (!groupId) return;

    const fetchSchedules = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/calendar`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        const json = await response.json();

        if (json.code === "SU") {
          const list = json.data.items || []; 
          
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth();
          const newSchedules = {};

          list.forEach((item) => {
            // [수정 1] item.date가 없으면 item.spentAt 사용 (지출 데이터 대응)
            const rawDate = item.date || item.spentAt;
            const itemDate = new Date(rawDate);
            
            if (isNaN(itemDate.getTime())) return;

            if (itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth) {
              const day = itemDate.getDate();
              if (!newSchedules[day]) newSchedules[day] = [];
              
              newSchedules[day].push({
                id: item.id, 
                title: item.name,
                type: item.type || 'event', 
                date: rawDate, // 수정된 날짜 필드 사용
                color: item.type === 'expense' ? SCHEDULE_COLORS.expense : SCHEDULE_COLORS.event
              });
            }
          });
          setSchedules(newSchedules);

        } else if (json.code === "NG") {
           console.error("해당 모임 정보를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("캘린더 로딩 실패:", err);
      }
    };
    fetchSchedules();
  }, [currentDate, groupId]);

  const handleSave = async () => {
    if (!scheduleInput || !dateInput) {
      alert("일정과 날짜를 입력해주세요."); return;
    }
    if (!groupId) { alert("모임 정보를 찾을 수 없습니다."); return; }

    setIsLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    
    // 시간은 00:00:00으로 고정
    const formattedDate = `${dateInput}T00:00:00+09:00`;

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/calendar/event`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: scheduleInput,
          date: formattedDate,
          location: placeInput,
        }),
      });
      const json = await response.json();

      if (json.code === "SU") {
        const newEvent = json.data;
        const eventDate = new Date(newEvent.date);
        
        if (eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear()) {
            const day = eventDate.getDate();
            const newId = newEvent.eventId || newEvent.id; 

            setSchedules((prev) => ({
                ...prev,
                [day]: [...(prev[day] || []), {
                    id: newId, 
                    title: newEvent.name,
                    type: 'event', 
                    date: newEvent.date,
                    color: SCHEDULE_COLORS.event,
                }]
            }));
        }
        alert("일정이 등록되었습니다.");
        handleCloseAddModal();
      } else if (json.code === "SD") {
        alert("이미 등록된 일정이 있습니다.");
      } else {
        alert(json.message || "오류가 발생했습니다.");
      }
    } catch (err) {
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEventClick = async (schedule) => {
    if (!groupId) return;

    setIsLoading(true);
    setSelectedDetail(null);

    const accessToken = localStorage.getItem("accessToken");
    const endpointType = schedule.type === 'expense' ? 'expense' : 'event';
    const url = `${API_BASE_URL}/groups/${groupId}/calendar/${endpointType}/${schedule.id}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
      });

      const json = await response.json();

      if (json.code === "SU") {
        const detailData = json.data.event || json.data.expense || json.data;
        
        if (detailData) {
          // [수정 2] 상세 정보에서도 date가 없으면 spentAt을 date로 통일해서 저장
          const normalizedDetail = {
            ...detailData,
            date: detailData.date || detailData.spentAt
          };
          setSelectedDetail(normalizedDetail); 
          setIsDetailModalOpen(true);
        } else {
          console.warn("데이터 구조 확인 필요:", json.data);
          alert("상세 정보를 표시할 수 없습니다.");
        }
      } 
      else if (json.code === "NE") {
        alert("일정을 찾을 수 없습니다.");
      } 
      else if (json.code === "AR") {
        alert("로그인이 필요합니다.");
      } 
      else {
        alert(json.message || "정보를 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("상세 조회 실패:", err);
      alert("서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
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

  const handleOpenAddModal = () => {
    const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    setDateInput(formatDateString(first)); 
    setScheduleInput("");
    setPlaceInput("");
    setIsAddModalOpen(true);
  };
  const handleCloseAddModal = () => setIsAddModalOpen(false);

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
          <Button onClick={handleOpenAddModal} variant="primary" text="+ 추가하기" />
        </CalendarHeader>

        <CalendarGrid>
          {CALENDAR_DAYS.map((day) => <DayHeader key={day}>{day}</DayHeader>)}
          {calendarDates.map((dateInfo, index) => (
            <DayCell key={index} $isCurrentMonth={dateInfo.isCurrentMonth}>
              {dateInfo.day}
              {dateInfo.isCurrentMonth &&
                schedules[dateInfo.day]?.map((schedule) => (
                  <ScheduleItem 
                    key={`${schedule.type}-${schedule.id}`} 
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

      {isAddModalOpen && (
        <ModalOverlay onClick={handleCloseAddModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span>일정 추가</span>
              <button onClick={handleCloseAddModal}>&times;</button>
            </ModalHeader>
            <ModalBody>
              <InputGroup>
                <label>일정 이름</label>
                <input type="text" placeholder="예: 박물관 관람" value={scheduleInput}
                  onChange={(e) => setScheduleInput(e.target.value)} />
              </InputGroup>
              <InputGroup>
                <label>날짜</label>
                <input type="date" value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)} />
              </InputGroup>
              <InputGroup>
                <label>장소</label>
                <input type="text" placeholder="예: 란나 민속 박물관" value={placeInput}
                  onChange={(e) => setPlaceInput(e.target.value)} />
              </InputGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={handleSave} variant="primary" text={isLoading ? "저장 중..." : "저장"} disabled={isLoading} />
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {isDetailModalOpen && (
        <ModalOverlay onClick={() => setIsDetailModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span>상세 정보</span>
              <button onClick={() => setIsDetailModalOpen(false)}>&times;</button>
            </ModalHeader>
            <ModalBody>
              {isLoading ? ( <p style={{textAlign: 'center'}}>로딩 중...</p> ) : selectedDetail ? (
                <>
                  <DetailText><span>이름:</span> {selectedDetail.name}</DetailText>
                  
                  {/* 날짜 표시 (시간 제외, normalizedDetail.date 사용) */}
                  <DetailText>
                    <span>일시:</span> {formatDateString(new Date(selectedDetail.date))}
                  </DetailText>

                  {selectedDetail.location && (
                    <DetailText><span>장소:</span> {selectedDetail.location}</DetailText>
                  )}
                  {selectedDetail.amount !== undefined && (
                    <DetailText><span>금액:</span> {Number(selectedDetail.amount).toLocaleString()}원</DetailText>
                  )}
                  {selectedDetail.category && (
                    <DetailText><span>분류:</span> {selectedDetail.category}</DetailText>
                  )}
                </>
              ) : ( <p>정보가 없습니다.</p> )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

export default Calendar;