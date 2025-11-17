// src/pages/ExpenseForm.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../components/Button";
import ExpenseModal from "../components/ExpenseModal";
import ReceiptModal from "../components/ReceiptModal";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";

export default function ExpenseForm() {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  // 🟡 지출 목록 불러오기
  const fetchExpenses = async () => {
    try {
      const res = await fetch(`http://localhost:8080/groups/${groupId}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("지출 데이터를 불러올 수 없습니다.");

      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  const handleReceiptClick = (id) => {
    setSelectedExpenseId(id);
    setShowReceiptModal(true);
  };

  return (
    <Container>
      <Title>지출 내역</Title>

      <TopRow>
        <select>
          <option>카드</option>
          <option>현금</option>
        </select>
        <Button text="+ 추가하기" onClick={() => setShowModal(true)} />
      </TopRow>

      {/* 테이블 */}
      <TableContainer>
        <HeaderRow>
          <div></div>
          <div>날짜</div>
          <div>지출명</div>
          <div>총 금액</div>
          <div>내 지출액</div>
          <div>장소</div>
          <div>영수증</div>
        </HeaderRow>

        {expenses.map((item) => (
          <DataRow key={item.id}>
            <div><input type="checkbox" /></div>
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

      {/* 지출 추가 모달 */}
      {showModal && (
        <ModalOverlay>
          <ExpenseModal
            groupId={groupId}
            onClose={() => setShowModal(false)}
            onSuccess={fetchExpenses}
          />
        </ModalOverlay>
      )}

      {/* 영수증 모달 */}
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

// Styled Components -------------------------------------
const Container = styled.div`
  padding: 3rem;
  max-height: 100vh;
  overflow-y: auto;
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
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
  overflow-x: auto;
`;
const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.5fr 1.5fr 1.5fr 1.5fr 1fr;
  font-weight: bold;
  background: #e5f0ff;
  padding: 1rem;
  position: sticky;
  top: 0;
`;
const DataRow = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.5fr 1.5fr 1.5fr 1.5fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;
const ReceiptBtn = styled.div`
  font-size: 1.4rem;
  cursor: pointer;
`;
const MoreButton = styled.button`
  margin: 2rem auto;
  display: block;
`;
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
`;
