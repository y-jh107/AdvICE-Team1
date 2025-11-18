import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ExpenseModal from "../components/ExpenseModal";
import ReceiptModal from "../components/ReceiptModal";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

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

  const fetchGroupData = async () => {
    if (!accessToken) return;

    try {
      const groupRes = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!groupRes.ok) throw new Error("그룹 상세 정보 불러오기 실패");

      const groupData = await groupRes.json();
      const memberList = groupData?.data?.members ?? [];
      setMembers(memberList);

      const expenseRes = await fetch(`${API_BASE_URL}/api/group/calendar/expense?groupId=${groupId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!expenseRes.ok) throw new Error("지출 정보 불러오기 실패");

      const expenseData = await expenseRes.json();
      const list = expenseData?.data ?? [];

      const normalized = list.map((it) => ({
        id: it.expenseId ?? it.id,
        date: (it.spentAt ?? "").slice(0, 10).replace(/-/g, "."),
        name: it.name,
        totalAmount: it.amount,
        myAmount: it.myAmount, // 서버에서 내려주는 내 지출액
        location: it.location,
        memo: it.memo ?? "",
      }));

      setExpenses(normalized);
    } catch (err) {
      console.error(err);
      setExpenses([]);
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
    if (visibleCount >= expenses.length) setVisibleCount(3);
    else setVisibleCount((prev) => prev + 3);
  };

  return (
    <Wrapper>
      <Title>태국 여행</Title>

      <TopRow>
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
                <ReceiptIcon onClick={() => openReceipt(e.id)}>📄</ReceiptIcon>
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

      {showModal && (
        <ExpenseModal
          groupId={groupId}
          members={members}
          onClose={() => setShowModal(false)}
          onSuccess={fetchGroupData}
        />
      )}

      {showReceiptModal && (
        <ReceiptModal
          expenseId={selectedExpenseId}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </Wrapper>
  );
}

/* ── Styled ── */
const Wrapper = styled.div`padding: 30px 40px; @media (max-width:780px){padding:20px;}`;
const Title = styled.h1`text-align:center; margin-bottom:20px; font-size:24px;`;
const TopRow = styled.div`display:flex; justify-content:flex-end; margin-bottom:15px;`;
const AddButton = styled.button`background:#226cff; color:white; border:none; padding:9px 18px; border-radius:8px; font-weight:bold; cursor:pointer;`;
const TableBox = styled.div`width:100%; border-radius:12px; border:1px solid #c9d8ff; overflow:hidden; background:#fff;`;
const HeaderRow = styled.div`display:grid; grid-template-columns:0.4fr 1fr 1fr 1fr 1fr 1.4fr 0.7fr; background:#226cff; color:white; padding:12px; font-weight:bold; font-size:14px;`;
const ScrollBody = styled.div`max-height:800px; overflow-y:auto;`;
const TooltipWrapper = styled.div`position:relative; &:hover div:last-child{opacity:1; visibility:visible; transform:translateY(0);}`;
const Tooltip = styled.div`position:absolute; top:100%; left:10%; background:rgba(0,0,0,0.75); color:white; padding:6px 10px; border-radius:8px; font-size:12px; margin-top:4px; opacity:0; visibility:hidden; transform:translateY(-5px); transition:0.2s; max-width:80%; white-space:normal; z-index:50;`;
const DataRow = styled.div`display:grid; grid-template-columns:0.4fr 1fr 1fr 1fr 1fr 1.4fr 0.7fr; padding:14px 12px; border-bottom:1px solid #f3f3f3;`;
const Cell = styled.div`font-weight:600;`;
const CheckBox = styled.input`transform:scale(0.8); cursor:pointer;`;
const ReceiptIcon = styled.div`font-size:20px; text-align:center; cursor:pointer;`;
const MoreButton = styled.button`margin:20px auto 8px; display:block; width:180px; background:#226cff; color:white; border:none; padding:10px; border-radius:10px; font-weight:bold;`;
const InfoMessage = styled.p`text-align:center; color:#dc3545; margin-bottom:10px; font-weight:bold;`;
