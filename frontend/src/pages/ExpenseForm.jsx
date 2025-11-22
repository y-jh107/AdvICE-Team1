// src/pages/ExpenseForm.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ExpenseModal from "../components/ExpenseModal";
import ReceiptModal from "../components/ReceiptModal";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

const mockExpenses = [
  {
    id: 1,
    date: "2025.09.15",
    name: "편의점",
    totalAmount: 10000,
    myAmount: 0,
    location: "GS25 시부야점",
    memo: "생수랑 과자 구매함",
    receiptId: null, // 목업 데이터에 receiptId 필드 추가
  },
  {
    id: 2,
    date: "2025.09.15",
    name: "카페",
    totalAmount: 10000,
    myAmount: 0,
    location: "스타벅스 시부야점",
    memo: "아이스 라떼 마심",
    receiptId: "r_003", // 테스트용 가짜 ID
  },
];

export default function ExpenseForm() {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  
  // 모달 관련 상태
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  
  // [추가] API로 받아온 영수증 이미지를 저장할 상태
  const [receiptImgData, setReceiptImgData] = useState(null);

  const [infoMessage, setInfoMessage] = useState("");

  const accessToken = localStorage.getItem("accessToken");
  // user 변수는 현재 사용되지 않으나 디코딩용으로 유지
  const user = accessToken ? jwtDecode(accessToken) : null;

  /** 모임 멤버 + 지출 불러오기 */
  const fetchGroupData = async () => {
    if (!accessToken) {
      setMembers([]);
      setExpenses(mockExpenses);
      setInfoMessage("로그인 후 실제 지출 내역을 확인할 수 있습니다.");
      return;
    }

    try {
      const groupRes = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!groupRes.ok) throw new Error("그룹 상세 정보 불러오기 실패");

      const groupData = await groupRes.json();
      const memberList = groupData?.data?.members ?? [];
      setMembers(memberList);

      const expenseRes = await fetch(
        `${API_BASE_URL}/groups/${groupId}/expenses`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!expenseRes.ok) throw new Error("지출 정보 불러오기 실패");

      const expenseData = await expenseRes.json();
      const list = expenseData?.data ?? [];

      const normalized = list.map((it) => ({
        id: it.expenseId ?? it.id,
        date: (it.spentAt ?? "").slice(0, 10).replace(/-/g, "."),
        name: it.name,
        totalAmount: it.amount,
        myAmount: it.myAmount ?? 0,
        location: it.location,
        memo: it.memo ?? "",
        // [중요] API 응답에서 receiptId를 매핑합니다.
        receiptId: it.receiptId || null, 
      }));

      setExpenses(normalized.length > 0 ? normalized : mockExpenses);
      setInfoMessage("");
    } catch (err) {
      console.error(err);
      setExpenses(mockExpenses);
      setMembers([]);
      setInfoMessage(err.message);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    fetchGroupData();
  }, [groupId]);

  /** * [추가 기능] 영수증 조회 API 호출 함수 
   * 참고: 업로드된 API 명세서 (GET /receipts/{receiptId})
   */
  const fetchReceiptImage = async (receiptId) => {
    if (!receiptId) {
      alert("등록된 영수증이 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/receipts/${receiptId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      // API 명세서의 실패 응답 처리 (RN, MR, DBE)
      if (json.code === "RN") {
        alert("영수증을 찾을 수 없습니다.");
        return;
      } else if (json.code === "MR") {
        alert("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        return;
      } else if (json.code === "DBE") {
        alert("데이터베이스 오류입니다.");
        return;
      }

      if (!res.ok) throw new Error(json.message || "영수증 불러오기 실패");

      // 성공 시: data.receipt.image (byte[] 또는 Base64 문자열)
      const imageString = json.data?.receipt?.image;
      
      if (imageString) {
        // 이미지 데이터가 Base64라고 가정하고 prefix 추가 (상황에 따라 조정 필요)
        // 만약 API가 순수 URL을 준다면 prefix 없이 setReceiptImgData(imageString) 만 하면 됩니다.
        const formattedImage = imageString.startsWith("http") 
          ? imageString 
          : `data:image/jpeg;base64,${imageString}`;
          
        setReceiptImgData(formattedImage);
        setShowReceiptModal(true); // 데이터 로드 성공 시 모달 오픈
      } else {
        alert("영수증 이미지 데이터가 비어있습니다.");
      }

    } catch (err) {
      console.error("영수증 조회 에러:", err);
      alert("영수증을 불러오는 중 오류가 발생했습니다.");
    }
  };

  /** 영수증 아이콘 클릭 핸들러 수정 */
  const handleOpenReceipt = (expense) => {
    setSelectedExpenseId(expense.id);
    
    if (!accessToken) {
      // 로그인 안 된 상태면 목업 동작(또는 경고)
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    // 영수증 ID가 있는 경우 API 호출
    if (expense.receiptId) {
      fetchReceiptImage(expense.receiptId);
    } else {
      alert("이 지출 내역에는 등록된 영수증이 없습니다.");
    }
  };

  const handleMore = () => {
    if (visibleCount >= expenses.length) setVisibleCount(3);
    else setVisibleCount((prev) => prev + 3);
  };

  return (
    <Wrapper>
      <Title>태국 여행</Title>

      <TopRow>
        <Select>
          <option>카드</option>
          <option>현금</option>
        </Select>
        <AddButton onClick={() => setShowModal(true)}>+ 추가하기</AddButton>
      </TopRow>

      {infoMessage && <InfoMessage>{infoMessage}</InfoMessage>}

      <TableBox>
        <HeaderRow>
          <div></div>
          <div>날짜</div>
          <div>지출명</div>
          <div>총 금액</div>
          <div>내 지출액</div>
          <div>장소</div>
          <div>영수증</div>
        </HeaderRow>

        <ScrollBody>
          {expenses.slice(0, visibleCount).map((e) => (
            <TooltipWrapper key={e.id}>
              <DataRow>
                <CheckBox type="checkbox" />
                <Cell>{e.date}</Cell>
                <Cell>{e.name}</Cell>
                <Cell>{e.totalAmount.toLocaleString()}원</Cell>
                <Cell>{e.myAmount.toLocaleString()}원</Cell>
                <Cell>{e.location}</Cell>
                {/* 수정된 핸들러 연결 */}
                <ReceiptIcon onClick={() => handleOpenReceipt(e)}>📄</ReceiptIcon>
              </DataRow>
              {e.memo && <Tooltip>{e.memo}</Tooltip>}
            </TooltipWrapper>
          ))}
        </ScrollBody>
      </TableBox>

      {expenses.length > 3 && (
        <MoreButton onClick={handleMore}>
          {visibleCount >= expenses.length ? "접기" : "더보기"}
        </MoreButton>
      )}

      <Hint>거래 완료 후 좌측 네모박스를 눌러 체크해주세요</Hint>

      {showModal && (
        <ModalOverlay>
          <ExpenseModal
            groupId={groupId}
            members={members}
            onClose={() => {
              setShowModal(false);
              fetchGroupData();
            }}
            onSuccess={fetchGroupData}
          />
        </ModalOverlay>
      )}

      {showReceiptModal && (
        <ModalOverlay>
          {/* ReceiptModal에 API로 받아온 이미지 데이터를 전달합니다.
            ReceiptModal 컴포넌트 내부에서 <img src={props.receiptImgData} /> 처럼 사용해야 합니다.
          */}
          <ReceiptModal
            expenseId={selectedExpenseId}
            receiptImgData={receiptImgData} 
            onClose={() => {
              setShowReceiptModal(false);
              setReceiptImgData(null); // 닫을 때 이미지 초기화
            }}
          />
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

/* -------------------- Styled (변경 없음) -------------------- */
const Wrapper = styled.div`
  padding: 30px 40px;
  @media (max-width: 780px) { padding: 20px; }
`;
const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
`;
const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;
const Select = styled.select`
  padding: 8px;
  border-radius: 6px;
`;
const AddButton = styled.button`
  background: #226cff;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;
const TableBox = styled.div`
  width: 100%;
  border-radius: 12px;
  border: 1px solid #c9d8ff;
  overflow: hidden;
  background: #fff;
`;
const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 0.4fr 1fr 1fr 1fr 1fr 1.4fr 0.7fr;
  background: #226cff;
  color: white;
  padding: 12px;
  font-weight: bold;
  font-size: 14px;
`;
const ScrollBody = styled.div`
  max-height: 800px;
  overflow-y: auto;
`;
const TooltipWrapper = styled.div`
  position: relative;
  &:hover div:last-child {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;
const Tooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 10%;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  margin-top: 4px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-5px);
  transition: 0.2s;
  max-width: 80%;
  white-space: normal;
  z-index: 50;
`;
const DataRow = styled.div`
  display: grid;
  grid-template-columns: 0.4fr 1fr 1fr 1fr 1fr 1.4fr 0.7fr;
  padding: 14px 12px;
  border-bottom: 1px solid #f3f3f3;
`;
const Cell = styled.div`font-weight: 600;`;
const CheckBox = styled.input`transform: scale(0.8); cursor:pointer;`;
const ReceiptIcon = styled.div`font-size: 20px; text-align:center; cursor:pointer;`;
const MoreButton = styled.button`
  margin: 20px auto 8px;
  display: block;
  width: 180px;
  background: #226cff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: bold;
`;
const Hint = styled.div`
  text-align: center;
  margin-top: 8px;
  color: #888;
`;
const ModalOverlay = styled.div`
  position: fixed; inset:0;
  background: rgba(0,0,0,0.35);
  display:flex; justify-content:center; align-items:center;
  z-index:9999;
`;
const InfoMessage = styled.p`
  text-align: center;
  color: #dc3545;
  margin-bottom: 10px;
  font-weight: bold;
`;