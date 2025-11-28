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

  const [paymentFilter, setPaymentFilter] = useState("card");
  const [groupName, setGroupName] = useState("여행");

  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [receiptImgData, setReceiptImgData] = useState(null);
  const [infoMessage, setInfoMessage] = useState("");

  const accessToken = localStorage.getItem("accessToken");
  //const user = accessToken ? jwtDecode(accessToken) : null;
  const userId = localStorage.getItem("userId");

  /** 그룹 정보 + 지출 불러오기 */
  const fetchGroupData = async () => {
    if (!accessToken) {
      setMembers([]);
      setExpenses([]);
      setGroupName("여행");
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
      const name = groupData?.data?.name;
      
      setMembers(memberList);
      if (name) setGroupName(name);

      const expenseRes = await fetch(
        `${API_BASE_URL}/groups/${groupId}/expenses`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!expenseRes.ok) throw new Error("지출 정보 불러오기 실패");

      const expenseData = await expenseRes.json();
      const list = expenseData?.data ?? [];

      const normalized = list.map((it) => {
        const myParticipant = it.participants?.find(
          (p) => Number(p.userId) === Number(userId)
        );

        const myAmount = Number(myParticipant?.myAmount ?? 0);

        return {
          id: it.expenseId ?? it.id,
          date: (it.spentAt ?? "").slice(0, 10).replace(/-/g, "."),
          name: it.name,
          totalAmount: it.amount,
          myAmount,
          location: it.location,
          memo: it.memo ?? "",
          payment: it.payment?.toLowerCase?.() ?? "card",
        };
      });

      setExpenses(normalized);
      setInfoMessage("");
    } catch (err) {
      console.error(err);
      setExpenses([]);
      setMembers([]);
      setGroupName("여행");
      setInfoMessage(err.message);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  /** 영수증 조회 */
  const fetchReceiptImage = async (expenseId) => {
    if (!accessToken) return alert("로그인이 필요합니다.");

    try {
      // 명세서 상 URL은 'expense' (단수), 코드는 'expenses' (복수)일 수 있으니 
      // 현재 잘 동작하는 URL을 유지합니다.
      const res = await fetch(
        `${API_BASE_URL}/groups/${groupId}/expenses/${expenseId}/receipts`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const json = await res.json();

      if (json.code === "RN") return alert("영수증을 찾을 수 없습니다.");
      if (json.code === "MR") return alert("요청이 너무 많습니다.");
      if (json.code === "DBE") return alert("데이터베이스 오류입니다.");

      if (!res.ok) throw new Error(json.message || "영수증 불러오기 실패");

      // [핵심 수정] 명세서(receipt.image) 또는 실제 서버(image) 둘 다 체크
      // 우선순위: 명세서 구조 -> 실제 서버 구조
      const imageString = json.data?.receipt?.image || json.data?.image;

      if (typeof imageString === "string" && imageString.length > 0) {
        const sanitized = imageString.replace(/\s/g, ""); // 공백 제거
        const formatted = `data:image/jpeg;base64,${sanitized}`;
        setReceiptImgData(formatted);
        setShowReceiptModal(true);
      } else {
        alert("영수증 이미지가 없습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("영수증 불러오기 오류");
    }
  };

  const handleOpenReceipt = (expense) => {
    if (!accessToken) return alert("로그인이 필요합니다.");
    setSelectedExpenseId(expense.id);
    fetchReceiptImage(expense.id);
  };

  const filteredExpenses = expenses.filter((e) => e.payment === paymentFilter);

  const handleMore = () => {
    if (visibleCount >= filteredExpenses.length) setVisibleCount(3);
    else setVisibleCount((prev) => prev + 3);
  };

  return (
    <Wrapper>
      <Title>{groupName}</Title>

      <TopRow>
        <FilterButtonGroup>
          {/* styled-components 경고 방지를 위해 $active로 변경 */}
          <FilterButton
            $active={paymentFilter === "card"}
            onClick={() => setPaymentFilter("card")}
          >
            카드
          </FilterButton>
          <FilterButton
            $active={paymentFilter === "cash"}
            onClick={() => setPaymentFilter("cash")}
          >
            현금
          </FilterButton>
        </FilterButtonGroup>

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
          {filteredExpenses.slice(0, visibleCount).map((e) => (
            <TooltipWrapper key={e.id}>
              <DataRow>
                <CheckBox type="checkbox" />
                <Cell>{e.date}</Cell>
                <Cell>{e.name}</Cell>
                <Cell>{e.totalAmount.toLocaleString()}원</Cell>
                <Cell>{e.myAmount.toLocaleString()}원</Cell>
                <Cell>{e.location}</Cell>

                <ReceiptIcon onClick={() => handleOpenReceipt(e)}>
                  📄
                </ReceiptIcon>
              </DataRow>

              {e.memo && <Tooltip>{e.memo}</Tooltip>}
            </TooltipWrapper>
          ))}
        </ScrollBody>
      </TableBox>

      {filteredExpenses.length > 3 && (
        <MoreButton onClick={handleMore}>
          {visibleCount >= filteredExpenses.length ? "접기" : "더보기"}
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
            refresh={fetchGroupData}
          />
        </ModalOverlay>
      )}

      {showReceiptModal && (
        <ModalOverlay>
          <ReceiptModal
            expenseId={selectedExpenseId}
            receiptImgData={receiptImgData}
            onClose={() => {
              setShowReceiptModal(false);
              setReceiptImgData(null);
              setSelectedExpenseId(null);
            }}
          />
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 30px 40px;
  @media (max-width: 780px) {
    padding: 20px;
  }
`;
const Title = styled.h1`
  text-align: center;
  margin-top: 50px;
  font-size: 30px;
`;
const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;
const AddButton = styled.button`
  background: #226cff;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: normal;
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
  font-weight: normal;
  font-size: 14px;
`;
const ScrollBody = styled.div`
  max-height: 800px;
  overflow-y: auto;
`;
const Tooltip = styled.div`
  position: absolute;
  top: 30%;
  left: 30%;
  transform: translateX(-50%) translateY(-8px);
  background: rgba(0, 0, 0, 0.92);
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  opacity: 0;
  visibility: hidden;
  transition: 0.25s ease;
  white-space: nowrap;
  z-index: 999;
`;

const TooltipWrapper = styled.div`
  position: relative;
  &:hover ${Tooltip} {
    opacity: 1;
    visibility: visible;
  }
`;
const DataRow = styled.div`
  display: grid;
  grid-template-columns: 0.4fr 1fr 1fr 1fr 1fr 1.4fr 0.7fr;
  padding: 14px 12px;
  border-bottom: 1px solid #f3f3f3;
`;
const Cell = styled.div`
  font-weight: 600;
`;
const CheckBox = styled.input`
  transform: scale(0.8);
  cursor: pointer;
`;
const ReceiptIcon = styled.div`
  font-size: 20px;
  text-align: center;
  cursor: pointer;
`;
const MoreButton = styled.button`
  margin: 20px auto 8px;
  display: block;
  width: 180px;
  background: #226cff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: normal;
`;
const Hint = styled.div`
  text-align: center;
  margin-top: 8px;
  color: #888;
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;
const InfoMessage = styled.p`
  text-align: center;
  color: #dc3545;
  margin-bottom: 10px;
  font-weight: normal;
`;
const FilterButtonGroup = styled.div`
  display: flex;
  background: #e7f0ff;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
  height: fit-content;
`;

// [수정] active -> $active 로 변경 (DOM에 불필요한 속성 전달 방지)
const FilterButton = styled.button`
  background: ${(props) => (props.$active ? "#226cff" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "#226cff")};
  border: none;
  padding: 9px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  &:hover {
    background: ${(props) => (props.$active ? "#1a5be6" : "#d0e2ff")};
  }
`;