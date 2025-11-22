// src/components/ExpenseModal.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Button from "./Button";
import ReceiptModal from "./ReceiptModal";
import { API_BASE_URL } from "../config";

// [1] UUID 생성 함수
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ExpenseModal({ groupId, members = [], onClose, onSuccess }) {
  const accessToken = localStorage.getItem("accessToken");

  const [name, setName] = useState("");
  const [spentAt, setSpentAt] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [memo, setMemo] = useState("");
  const [payment, setPayment] = useState("CARD");
  const [currency, setCurrency] = useState("KRW");

  const [splitMode, setSplitMode] = useState("PERCENT");
  const [selectedMembers, setSelectedMembers] = useState({});

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [tempReceiptFile, setTempReceiptFile] = useState(null);

  useEffect(() => {
    const initialMembers = members.length ? members : [
      { userId: 1, name: "김정통" }, { userId: 2, name: "홍길동" }, { userId: 3, name: "유성열" }
    ];
    const obj = {};
    initialMembers.forEach((m) => {
      obj[m.userId] = { selected: false, percent: 0 };
    });
    setSelectedMembers(obj);
  }, [members]);

  const toggleMember = (id, checked) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: checked, percent: checked ? prev[id].percent : 0 },
    }));
    setSplitMode("PERCENT");
  };

  const setPercent = (id, v) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [id]: { ...prev[id], percent: Number(v) },
    }));
  };

  const equalSplit = () => {
    const ids = Object.entries(selectedMembers).filter(([_, v]) => v.selected).map(([id]) => Number(id));
    if (ids.length === 0) return alert("참여자를 선택해주세요.");
    const base = Math.floor(100 / ids.length);
    const remainder = 100 - base * ids.length;
    const next = { ...selectedMembers };
    ids.forEach((id, idx) => {
      next[id].percent = base + (idx === 0 ? remainder : 0);
    });
    setSelectedMembers(next);
    setSplitMode("EQUAL");
  };

  const validatePercent = () => {
    if (splitMode === "EQUAL") return true;
    const sum = Object.values(selectedMembers).filter((m) => m.selected).reduce((a, b) => a + b.percent, 0);
    return sum === 100;
  };

  const save = async () => {
    if (!name || !spentAt || !amount) return alert("지출명 / 날짜 / 총 금액은 필수입니다.");
    if (!validatePercent()) return alert("참여자 퍼센트 합계는 100이어야 합니다.");

    const participants = Object.entries(selectedMembers)
      .filter(([_, v]) => v.selected)
      .map(([id, v]) => ({ userId: Number(id), percent: v.percent }));

    const body = {
      name,
      spentAt,
      amount: Number(amount),
      payment,
      location,
      memo,
      splitMode,
      participants,
      currency
    };

    let newExpenseId = null;

    try {
      if (!accessToken) {
        alert("로그인이 필요합니다. (테스트 모드)");
        onSuccess?.(); onClose(); return;
      }

      const res = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "지출 등록 실패");

      newExpenseId = json.data?.expenseId || json.data?.id;

    } catch (err) {
      console.error(err);
      alert(`지출 저장 실패: ${err.message}`);
      return; 
    }

    if (newExpenseId && tempReceiptFile) {
      try {
        const formData = new FormData();
        formData.append("image", tempReceiptFile);
        const idempotencyKey = generateUUID();

        await axios.post(`${API_BASE_URL}/expenses/${newExpenseId}/receipts`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
            "Idempotency-Key": idempotencyKey,
          }
        });
      } catch (uploadErr) {
        console.error("영수증 업로드 에러:", uploadErr);
        alert("지출은 저장되었으나, 영수증 이미지 업로드에 실패했습니다.");
        onSuccess?.();
        onClose();
        return;
      }
    }

    alert("저장되었습니다.");
    onSuccess?.();
    onClose();
  };

  // [추가] 환율 그래프 버튼 핸들러 (나중에 실제 모달 구현 필요)
  const handleOpenExchangeRate = () => {
    alert("환율 그래프 보기 기능 준비 중입니다.\n(여기에 1주일치 그래프 모달 구현)");
  };

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <span>지출 추가</span>
            <button onClick={onClose}>&times;</button>
          </ModalHeader>

          <ScrollableArea>
            <InputGroup>
              <label>지출명</label>
              <input type="text" placeholder="예: 항공권" value={name} onChange={(e) => setName(e.target.value)} />
            </InputGroup>

            <InputGroup>
              <label>지출 날짜</label>
              <input type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} />
            </InputGroup>

            {/* 금액 및 통화 선택 */}
            <InputGroup>
              <label>총 금액</label>
              <CurrencyContainer>
                <CurrencyInputWrapper>
                  <CurrencyInput
                    type="number"
                    placeholder="입력하세요"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {amount && (
                    <ResetButton onClick={() => setAmount("")}>×</ResetButton>
                  )}
                </CurrencyInputWrapper>
                <CurrencySelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="KRW">원화</option>
                  <option value="USD">달러</option>
                  <option value="JPY">엔화</option>
                  <option value="EUR">유로</option>
                </CurrencySelect>
              </CurrencyContainer>
            </InputGroup>

            {/* 결제 방식 */}
            <InputGroup>
              <label>결제 방식</label>
              <RoundedSelect value={payment} onChange={(e) => setPayment(e.target.value)}>
                <option value="CARD">카드</option>
                <option value="CASH">현금</option>
              </RoundedSelect>
            </InputGroup>

            <InputGroup>
              <label>장소</label>
              <input type="text" placeholder="예: 홍콩 공항" value={location} onChange={(e) => setLocation(e.target.value)} />
            </InputGroup>

            <InputGroup>
              <label>메모</label>
              <textarea placeholder="추가 메모 입력" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} />
            </InputGroup>

            <Divider />

            <SectionTitle>참여자 선택</SectionTitle>
            {Object.entries(selectedMembers).map(([id, m]) => (
              <MemberRow key={id}>
                <input type="checkbox" checked={m.selected} onChange={(e) => toggleMember(Number(id), e.target.checked)} />
                <span className="name">{members.find((mem) => mem.userId === Number(id))?.name || `회원 ${id}`}</span>
                {splitMode === "PERCENT" && m.selected && (
                  <> <PercentInput type="number" min={0} max={100} value={m.percent} onChange={(e) => setPercent(Number(id), e.target.value)} /> <span>%</span> </>
                )}
                {splitMode === "EQUAL" && m.selected && <EqualBadge>{m.percent}%</EqualBadge>}
              </MemberRow>
            ))}
            <EqualRow>
              <input type="checkbox" checked={splitMode === "EQUAL"} onChange={equalSplit} />
              <span>균등 분배</span>
            </EqualRow>
          </ScrollableArea>

          <ModalFooter>
            {/* [수정됨] 환율 그래프 버튼 (가로 꽉 참) */}
            <WhiteButton onClick={handleOpenExchangeRate}>
              📈 환율 그래프 보기 
            </WhiteButton>

            {/* [수정됨] 저장과 영수증 버튼을 감싸는 가로 컨테이너 */}
            <ButtonRow>
              {/* 기존 Button 컴포넌트의 style={{ width: '100%' }} 제거 (flex가 제어) */}
              <Button text="저장" onClick={save} />
              
              {/* 텍스트 길이 조정 */}
              <WhiteButton onClick={() => setShowReceiptModal(true)} isSelected={!!tempReceiptFile}>
                {tempReceiptFile ? "영수증 변경" : "영수증 등록"}
              </WhiteButton>
            </ButtonRow>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>

      {showReceiptModal && (
        <ReceiptModal 
          isOpen={true}
          onClose={() => setShowReceiptModal(false)}
          expenseId={null} 
          onSave={(file) => setTempReceiptFile(file)}
          receiptImgData={tempReceiptFile ? URL.createObjectURL(tempReceiptFile) : null}
        />
      )}
    </>
  );
}

// --- Styled Components ---
const ModalOverlay = styled.div` position: fixed; top:0; left:0; width:100%; height:100%; background-color: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000; `;
const ModalContent = styled.div` background-color:white; width:90%; max-width:430px; border-radius:8px; overflow:hidden; max-height:90vh; display:flex; flex-direction:column; `;
const ModalHeader = styled.div` background-color:#3b82f6; color:white; padding:1rem; display:flex; justify-content:space-between; align-items:center; button { background:none; border:none; color:white; font-size:1.2rem; font-weight:bold; cursor:pointer; } `;
const ScrollableArea = styled.div` padding:1.5rem; overflow-y:auto; max-height:65vh; display:flex; flex-direction:column; gap:1.2rem; `;

// 기존 ModalFooter는 세로 정렬 유지
const ModalFooter = styled.div` padding: 1rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 10px; `;

// [추가] 하단 버튼들을 가로로 배치하기 위한 컨테이너
const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  
  /* 내부의 버튼들이 정확히 반반씩 공간을 차지하도록 설정 */
  & > * {
    flex: 1;
    width: auto; /* 기존 버튼의 width: 100% 속성 무시 */
  }
`;

const InputGroup = styled.div`
  display:flex;
  flex-direction:column;
  label{font-size:0.9rem;font-weight:500;margin-bottom:0.5rem;}

  input[type="date"],
  input[type="text"]:not(:first-child), 
  textarea
  {
    font-size:1rem;
    padding:0.75rem;
    border:1px solid #ccc;
    border-radius:6px;
  }
`;

const CurrencyContainer = styled.div` display: flex; gap: 10px; align-items: center; `;
const CurrencyInputWrapper = styled.div` position: relative; flex: 1; `;
const CurrencyInput = styled.input` width: 100%; padding: 0.75rem 2.5rem 0.75rem 1rem; border: 1px solid #ccc; border-radius: 20px; font-size: 1rem; box-sizing: border-box; &::placeholder { color: #999; } &:focus { outline: none; border-color: #3b82f6; } `;
const ResetButton = styled.button` position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999; padding: 0; line-height: 1; `;
const CurrencySelect = styled.select` padding: 0.75rem; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; min-width: 90px; cursor: pointer; &:focus { outline: none; border-color: #3b82f6; } `;
const RoundedSelect = styled.select` width: 100%; padding: 0.75rem 1rem; border: 1px solid #ccc; border-radius: 20px; font-size: 1rem; background-color: white; cursor: pointer; box-sizing: border-box; &:focus { outline: none; border-color: #3b82f6; } `;

const Divider = styled.div` height:1px; background-color:#ddd; margin:0.5rem 0; `;
const SectionTitle = styled.h4` margin-top:0.5rem;font-size:1rem;font-weight:600; `;
const MemberRow = styled.div` display:flex; align-items:center; gap:10px; .name{flex:1; font-weight:bold;} `;
const PercentInput = styled.input` width:60px;padding:6px;border-radius:6px;border:1px solid #ddd; `;
const EqualBadge = styled.div` background:#eaf0ff;padding:6px 8px;border-radius:6px;font-weight:bold; `;
const EqualRow = styled.div` margin-top:6px; display:flex; gap:8px; `;
const WhiteButton = styled.button`
  width: 100%; padding: 10px 20px;
  background-color: ${props => props.isSelected ? '#e3efff' : 'white'};
  color: #3b82f6; border: 1px solid #3b82f6; border-radius: 8px;
  font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.2s;
  &:hover { background-color: #f0f7ff; }
`;