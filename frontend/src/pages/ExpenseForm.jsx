import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../components/Button";
import ExpenseModal from "../components/ExpenseModal";
import ReceiptModal from "../components/ReceiptModal";

export default function ExpenseForm() {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  useEffect(() => {
    // TODO: API로 목록 불러오기
    setExpenses([
      {
        id: 1,
        date: "2025.9.15",
        name: "편의점",
        totalAmount: 10000,
        myAmount: 2500,
        location: "GS25 시부야점",
      },
      {
        id: 2,
        date: "2025.9.15",
        name: "카페",
        totalAmount: 10000,
        myAmount: 2500,
        location: "스타벅스 시부야점",
      },
    ]);
  }, []);

  const handleAddExpense = () => setShowModal(true);
  const handleReceiptClick = (id) => {
    setSelectedExpenseId(id);
    setShowReceiptModal(true);
  };

  return (
    <Container>
      <Title>태국 여행</Title>

      <TopRow>
        <select>
          <option>카드</option>
          <option>현금</option>
        </select>
        <Button text="+ 추가하기" onClick={handleAddExpense} />
      </TopRow>

      <TableContainer>
        <HeaderRow>
          <div></div> {/* 체크박스 */}
          <div>날짜</div>
          <div>지출명</div>
          <div>총 금액</div>
          <div>내 지출액</div>
          <div>장소</div>
          <div>영수증</div>
        </HeaderRow>

        {expenses.map((item) => (
          <DataRow key={item.id}>
            <div>
              <input type="checkbox" />
            </div>
            <div>{item.date}</div>
            <div>{item.name}</div>
            <div>{item.totalAmount.toLocaleString()}원</div>
            <div>{item.myAmount.toLocaleString()}원</div>
            <div>{item.location}</div>
            <div>
              <ReceiptBtn onClick={() => handleReceiptClick(item.id)}>📄</ReceiptBtn>
            </div>
          </DataRow>
        ))}
      </TableContainer>

      <MoreButton>더보기</MoreButton>

      {showModal && (
        <ModalOverlay>
          <ExpenseModal
            onClose={() => setShowModal(false)}
            onSuccess={(newExpense) => setExpenses([...expenses, newExpense])}
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
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 3rem;
  max-height: 100vh; /* 화면 높이 제한 */
  overflow-y: auto;   /* 페이지 전체 스크롤 허용 */
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const TableContainer = styled.div`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow-x: auto; /* 가로 스크롤만 허용 */
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.5fr 1.5fr 1.5fr 1.5fr 1fr;
  background: #e5f0ff;
  padding: 1rem;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.5fr 1.5fr 1.5fr 1.5fr 1fr;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const ReceiptBtn = styled.div`
  cursor: pointer;
  font-size: 1.4rem;
`;

const MoreButton = styled.button`
  margin: 2rem auto;
  display: block;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
`;

// 모달 오버레이 (화면 중앙 고정)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;
