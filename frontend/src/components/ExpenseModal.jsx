// src/components/ExpenseModal.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import InputField from "./InputField";
import Button from "./Button";
import { API_BASE_URL } from "../config";

export default function ExpenseModal({ groupId, members = [], onClose, onSuccess }) {
  const accessToken = localStorage.getItem("accessToken");

  const [name, setName] = useState("");
  const [spentAt, setSpentAt] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [memo, setMemo] = useState("");
  const [payment, setPayment] = useState("CARD");

  const [splitMode, setSplitMode] = useState("PERCENT");
  const [selectedMembers, setSelectedMembers] = useState({});

  // 초기 멤버 구성
  useEffect(() => {
    // 백엔드에서 데이터 안 받아졌을 때 테스트용 더미
    const initialMembers = members.length
      ? members
      : [
          { userId: 1, name: "김정통" },
          { userId: 2, name: "홍길동" },
          { userId: 3, name: "유성열" },
        ];

    const obj = {};
    initialMembers.forEach((m) => {
      obj[m.userId] = { selected: false, percent: 0 };
    });
    setSelectedMembers(obj);
  }, [members]);

  // 체크 박스 토글
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
    const ids = Object.entries(selectedMembers)
      .filter(([_, v]) => v.selected)
      .map(([id]) => Number(id));

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
    const sum = Object.values(selectedMembers)
      .filter((m) => m.selected)
      .reduce((a, b) => a + b.percent, 0);
    return sum === 100;
  };

  const save = async () => {
    if (!name || !spentAt || !amount)
      return alert("지출명 / 날짜 / 총 금액은 필수입니다.");

    if (!validatePercent()) return alert("참여자 퍼센트 합계는 100이어야 합니다.");

    const participants = Object.entries(selectedMembers)
      .filter(([_, v]) => v.selected)
      .map(([id, v]) => ({
        userId: Number(id),
        percent: v.percent,
      }));

    const body = {
      name,
      spentAt,
      amount: Number(amount),
      payment,
      location,
      memo,
      splitMode,
      participants,
    };

    try {
      if (!accessToken) {
        alert("로그인이 필요합니다. (테스트용 저장 완료)");
        onSuccess?.();
        onClose();
        return;
      }

      const res = await fetch(`${API_BASE_URL}/v1/groups/${groupId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "등록 실패");
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      alert("서버 요청 실패");
    }
  };

  return (
    <Overlay>
      <Box>
        <Header>
          <h3>지출 추가</h3>
          <Close onClick={onClose}>✕</Close>
        </Header>

        <Content>
          <InputField label="지출명" value={name} onChange={(e) => setName(e.target.value)} />
          <InputField label="날짜" type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} />
          <InputField label="총 금액" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <InputField label="장소" value={location} onChange={(e) => setLocation(e.target.value)} />
          <InputField label="메모" value={memo} onChange={(e) => setMemo(e.target.value)} />

          <SelectWrap>
            <label>결제수단</label>
            <select value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="CARD">카드</option>
              <option value="CASH">현금</option>
            </select>
          </SelectWrap>

          <Divider />

          <h4>참여자 선택</h4>

          {Object.entries(selectedMembers).map(([id, m]) => (
            <Member key={id}>
              <input
                type="checkbox"
                checked={m.selected}
                onChange={(e) => toggleMember(Number(id), e.target.checked)}
              />
              <Name>{members.find((mem) => mem.userId === Number(id))?.name || `회원 ${id}`}</Name>

              {splitMode === "PERCENT" && m.selected && (
                <>
                  <Percent type="number" min={0} max={100} value={m.percent} onChange={(e) => setPercent(Number(id), e.target.value)} />
                  <span>%</span>
                </>
              )}

              {splitMode === "EQUAL" && m.selected && <EqualBadge>{m.percent}%</EqualBadge>}
            </Member>
          ))}

          <EqualRow>
            <input type="checkbox" checked={splitMode === "EQUAL"} onChange={equalSplit} />
            <span>균등 분배</span>
          </EqualRow>

          <BtnWrap>
            <Button text="저장" onClick={save} />
          </BtnWrap>
        </Content>
      </Box>
    </Overlay>
  );
}

/* 스타일 */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Box = styled.div`
  width: 520px;
  max-width: calc(100% - 30px);
  background: #fff;
  border-radius: 12px;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Close = styled.div`
  font-size: 20px;
  cursor: pointer;
`;

const Content = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SelectWrap = styled.div`
  display: flex;
  flex-direction: column;
  select {
    margin-top: 4px;
    padding: 8px;
    border-radius: 8px;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
`;

const Member = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Name = styled.div`
  flex: 1;
  font-weight: bold;
`;

const Percent = styled.input`
  width: 70px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ddd;
`;

const EqualBadge = styled.div`
  background: #eaf0ff;
  padding: 6px 8px;
  border-radius: 6px;
  font-weight: bold;
`;

const EqualRow = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 8px;
`;

const BtnWrap = styled.div`
  display: flex;
  justify-content: flex-end;
`;
