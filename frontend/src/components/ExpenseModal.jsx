import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "./Button";
import InputField from "./InputField";
import ReceiptModal from "./ReceiptModal";

export default function ExpenseModal({ onClose, onSuccess, members: propMembers = [] }) {
  const members = propMembers.length > 0 ? propMembers : [
    { userId: 1, name: "홍길동" },
    { userId: 2, name: "김철수" },
    { userId: 3, name: "이영희" },
  ];

  const [name, setName] = useState("");
  const [spentAt, setSpentAt] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KRW");
  const [location, setLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card"); // 결제 수단
  const [selectedMembers, setSelectedMembers] = useState({});
  const [equalShare, setEqualShare] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // 멤버 초기화
  useEffect(() => {
    const initial = {};
    members.forEach((m) => {
      initial[String(m.userId)] = { selected: false, percent: 0 };
    });
    setSelectedMembers(initial);
  }, [members]);

  const handleMemberChange = (userId, checked) => {
    const id = String(userId);
    setSelectedMembers(prev => {
      const updated = { ...prev, [id]: { ...prev[id], selected: checked } };
      return equalShare ? applyEqualShare(updated) : updated;
    });
  };

  const handlePercentChange = (userId, value) => {
    const id = String(userId);
    const num = Number(value);
    setSelectedMembers(prev => ({ ...prev, [id]: { ...prev[id], percent: num } }));
  };

  const applyEqualShare = (membersState) => {
    const updated = { ...membersState };
    const active = Object.values(updated).filter(m => m.selected);
    if (active.length === 0) return updated;
    const equalPercent = Math.floor(100 / active.length);
    let remaining = 100 - equalPercent * active.length;
    Object.entries(updated).forEach(([id, m]) => {
      if (m.selected) {
        updated[id].percent = equalPercent + (remaining > 0 ? 1 : 0);
        remaining = Math.max(0, remaining - 1);
      } else {
        updated[id].percent = 0;
      }
    });
    setSelectedMembers(updated);
    return updated;
  };

  const handleEqualShareToggle = (checked) => {
    setEqualShare(checked);
    if (checked) applyEqualShare(selectedMembers);
  };

  const validatePercentSum = () => {
    const sum = Object.values(selectedMembers)
      .filter(m => m.selected)
      .reduce((acc, m) => acc + m.percent, 0);
    return sum === 100;
  };

  const handleSave = () => {
    if (!name) { alert("지출명을 입력하세요."); return; }
    if (!spentAt) { alert("날짜를 선택하세요."); return; }
    if (!amount || Number(amount) <= 0) { alert("금액을 입력하세요."); return; }

    const activeMembers = Object.entries(selectedMembers)
      .filter(([_, m]) => m.selected)
      .map(([id, m]) => ({ userId: Number(id), percent: m.percent }));

    if (activeMembers.length === 0) { alert("참여자가 없습니다."); return; }
    if (!validatePercentSum()) { alert("참여자 비율 합계는 반드시 100이어야 합니다."); return; }

    const newExpense = {
      id: Date.now(),
      date: spentAt,
      name,
      totalAmount: Number(amount),
      location,
      currency,
      paymentMethod,
      participants: activeMembers,
    };

    onSuccess(newExpense);
    onClose();
  };

  return (
    <Overlay>
      <Modal>
        <HeaderRow>
          <h3>지출 추가</h3>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </HeaderRow>

        <Content>
          <InputField label="지출명" value={name} onChange={(e) => setName(e.target.value)} />
          <InputField label="날짜" type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} />
          <InputField label="금액" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
          
          <Label>통화</Label>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="KRW">원화</option>
            <option value="USD">달러</option>
          </Select>

          <InputField label="장소" value={location} onChange={(e) => setLocation(e.target.value)} />

          <Label>결제 수단</Label>
          <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="card">카드</option>
            <option value="cash">현금</option>
          </Select>

          <Label>참여자 선택</Label>
          {members.map((m) => (
            <MemberRow key={m.userId}>
              <input
                type="checkbox"
                checked={selectedMembers[m.userId]?.selected || false}
                onChange={(e) => handleMemberChange(m.userId, e.target.checked)}
              />
              <span>{m.name}</span>
              <PercentInput
                type="number"
                min={0}
                max={100}
                value={selectedMembers[m.userId]?.percent || 0}
                onChange={(e) => handlePercentChange(m.userId, e.target.value)}
              />
              <span>%</span>
            </MemberRow>
          ))}

          <EqualShareRow>
            <input type="checkbox" checked={equalShare} onChange={(e) => handleEqualShareToggle(e.target.checked)} />
            <span>선택한 멤버에게 균등 분배</span>
          </EqualShareRow>

          <ButtonRow>
            <Button text="저장" onClick={handleSave} />
            <Button text="영수증 첨부" onClick={() => setShowReceiptModal(true)} />
          </ButtonRow>
        </Content>
      </Modal>

      {showReceiptModal && <ReceiptModal onClose={() => setShowReceiptModal(false)} />}
    </Overlay>
  );
}

// Styled Components
const Overlay = styled.div`
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center;
  background: rgba(0,0,0,0.3); z-index: 999;
`;
const Modal = styled.div`
  width: 500px; background: white; border-radius: 15px; padding: 1.5rem;
`;
const HeaderRow = styled.div`
  display: flex; justify-content: space-between; margin-bottom: 1rem;
`;
const CloseBtn = styled.div`
  cursor: pointer; font-size: 1.2rem;
`;
const Content = styled.div`
  display: flex; flex-direction: column; gap: 1rem;
`;
const Label = styled.div`font-weight: bold;`;
const Select = styled.select`
  border: 1px solid #ccc; padding: 0.6rem; border-radius: 6px;
`;
const MemberRow = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
`;
const PercentInput = styled.input`
  width: 60px; padding: 0.3rem; border-radius: 4px; border: 1px solid #ccc;
`;
const EqualShareRow = styled.div`
  display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;
`;
const ButtonRow = styled.div`
  display: flex; gap: 1rem; margin-top: 1rem;
`;
