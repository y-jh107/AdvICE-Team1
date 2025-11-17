// src/pages/ExpenseForm.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ExpenseModal from "../components/ExpenseModal";
import ReceiptModal from "../components/ReceiptModal";
import jwtDecode from "jwt-decode";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

const mockExpenses = [
  { id: 1, date: "2025.09.15", name: "편의점", totalAmount: 10000, myAmount: 2500, location: "GS25 시부야점" },
  { id: 2, date: "2025.09.15", name: "카페", totalAmount: 10000, myAmount: 2500, location: "스타벅스 시부야점" },
];

export default function ExpenseForm() {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [infoMessage, setInfoMessage] = useState("");

  const accessToken = localStorage.getItem("accessToken");
  const user = accessToken ? jwtDecode(accessToken) : null;

  // --- 모임 멤버 + 지출 불러오기 ---
  const fetchGroupData = async () => {
    if (!accessToken) {
      setMembers([]);
      setExpenses(mockExpenses);
      return;
    }

    try {
      // 모임 상세 정보 (멤버 포함)
      const groupRes = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!groupRes.ok) throw new Error("그룹 상세 정보 불러오기 실패");

      const groupData = await groupRes.json();
      const memberList = groupData?.data?.members ?? [];
      setMembers(memberList);

      // 지출 정보
      const expenseRes = await fetch(`${API_BASE_URL}/api/group/calendar/expense?groupId=${groupId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!expenseRes.ok) throw new Error("지출 정보 불러오기 실패");

      const expenseData = await expenseRes.json();
      const list = expenseData?.data ?? [];

      const normalized = list.map((it) => ({
        id: it.expenseId ?? it.id,
        date: (it.spentAt ?? "").slice(0, 10).replace(/-/g, "."),
        name: it.name ?? "",
        totalAmount: it.amount ?? 0,
        myAmount: it.myAmount ?? 0,
        location: it.location ?? "",
      }));

      setExpenses(normalized.length > 0 ? normalized : mockExpenses);
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

  const openReceipt = (id) => {
    setSelectedExpenseId(id);
    setShowReceiptModal(true);
  };

  const handleMore = () => {
    if (visibleCount >= expenses.length) {
      setVisibleCount(3);
    } else {
      setVisibleCount((prev) => prev + 3);
    }
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
            <DataRow key={e.id}>
              <CheckBox type="checkbox" />
              <Cell>{e.date}</Cell>
              <Cell>{e.name}</Cell>
              <Cell>{e.totalAmount.toLocaleString()}원</Cell>
              <Cell>{e.myAmount.toLocaleString()}원</Cell>
              <Cell>{e.location}</Cell>
              <ReceiptIcon onClick={() => openReceipt(e.id)}>📄</ReceiptIcon>
            </DataRow>
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
            members={members} // 모임 멤버 전달
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
          <ReceiptModal
            expenseId={selectedExpenseId}
            onClose={() => setShowReceiptModal(false)}
          />
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

/* ------------------------- Styled Components ------------------------- */
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
  align-items: center;
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
  @media (max-width: 780px) {
    font-size: 12px;
    grid-template-columns: 0.4fr 0.9fr 1fr 0.9fr 0.9fr 1.2fr 0.7fr;
  }
`;

const ScrollBody = styled.div`
  max-height: 380px;
  overflow-y: auto;
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 0.4fr 1fr 1fr 1fr 1fr 1.4fr 0.7fr;
  padding: 14px 12px;
  border-bottom: 1px solid #f3f3f3;
  @media (max-width: 780px) {
    font-size: 13px;
    padding: 10px;
    grid-template-columns: 0.4fr 0.9fr 1fr 0.9fr 0.9fr 1.2fr 0.7fr;
  }
`;

const Cell = styled.div`font-weight: 600;`;
const CheckBox = styled.input`transform: scale(1.2); cursor: pointer;`;
const ReceiptIcon = styled.div`font-size: 20px; text-align: center; cursor: pointer;`;
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
const Hint = styled.div`text-align: center; margin-top: 8px; color: #888;`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;
const InfoMessage = styled.p`
  text-align: center;
  color: #dc3545;
  margin-bottom: 10px;
  font-weight: bold;
`;
