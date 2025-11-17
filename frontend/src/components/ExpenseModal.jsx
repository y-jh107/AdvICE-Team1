// src/components/ExpenseModal.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "./Button";
import InputField from "./InputField";
import ReceiptModal from "./ReceiptModal";
import { jwtDecode } from "jwt-decode";

export default function ExpenseModal({ groupId, onClose, onSuccess }) {
  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [spentAt, setSpentAt] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [selectedMembers, setSelectedMembers] = useState({});
  const [equalShare, setEqualShare] = useState(false);

  // 그룹 멤버 불러오기
  const fetchGroupMembers = async () => {
    const res = await fetch(`http://localhost:8080/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMembers(data);
  };

  useEffect(() => {
    fetchGroupMembers();
  }, []);

  useEffect(() => {
    const obj = {};
    members.forEach((m) => {
      obj[m.userId] = { selected: false, percent: 0 };
    });
    setSelectedMembers(obj);
  }, [members]);

  const handleMemberChange = (id, checked) => {
    const copy = { ...selectedMembers };
    copy[id].selected = checked;
    setSelectedMembers(copy);
  };

  const validatePercent = () => {
    const sum = Object.values(selectedMembers)
      .filter((m) => m.selected)
      .reduce((acc, curr) => acc + curr.percent, 0);

    return sum === 100;
  };

  const handleSave = async () => {
    if (!name || !spentAt || !amount) {
      alert("모든 값을 입력하세요.");
      return;
    }
    if (!validatePercent()) {
      alert("참여자 비율 합계는 100이어야 합니다.");
      return;
    }

    const participants = Object.entries(selectedMembers)
      .filter(([_, m]) => m.selected)
      .map(([id, m]) => ({ userId: Number(id), percent: m.percent }));

    const newExpense = {
      name,
      date: spentAt,
      totalAmount: Number(amount),
      location,
      participants,
    };

    await fetch(`http://localhost:8080/groups/${groupId}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newExpense),
    });

    onSuccess();
    onClose();
  };

  return (
    <Overlay>
      <Modal>
        <HeaderRow>
          <h3>지출 추가</h3>
          <Close onClick={onClose}>✕</Close>
        </HeaderRow>

        <Content>
          <InputField label="지출명" value={name} onChange={(e) => setName(e.target.value)} />
          <InputField label="날짜" type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} />
          <InputField label="총 금액" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <InputField label="장소" value={location} onChange={(e) => setLocation(e.target.value)} />

          <h4>참여자</h4>
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
                onChange={(e) =>
                  setSelectedMembers({
                    ...selectedMembers,
                    [m.userId]: { ...selectedMembers[m.userId], percent: Number(e.target.value) },
                  })
                }
              />
              %
            </MemberRow>
          ))}

          <ButtonRow>
            <Button text="저장" onClick={handleSave} />
          </ButtonRow>
        </Content>
      </Modal>
    </Overlay>
  );
}

// Styled Components -------------------------------------
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex; justify-content: center; align-items: center;
  z-index: 999;
`;
const Modal = styled.div`
  width: 500px; background: white; border-radius: 15px;
  padding: 1.5rem;
`;
const HeaderRow = styled.div`
  display: flex; justify-content: space-between;
`;
const Close = styled.div`
  cursor: pointer; font-size: 1.3rem;
`;
const Content = styled.div`
  margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;
`;
const MemberRow = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
`;
const PercentInput = styled.input`
  width: 60px; padding: 0.3rem;
`;
const ButtonRow = styled.div`
  display: flex; gap: 1rem; margin-top: 1rem;
`;
