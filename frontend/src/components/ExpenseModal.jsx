import React, { useState, useEffect } from "react";
import styled from "styled-components";
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

  // 초기 멤버 셋업
  useEffect(() => {
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

      const res = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`, {
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

      onSuccess?.(); // 서버에서 계산된 myAmount 포함 새 데이터 불러오기
      onClose();
    } catch (err) {
      alert("서버 요청 실패");
    }
  };

  return (
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

          <InputGroup>
            <label>총 금액</label>
            <input type="number" placeholder="예: 150000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </InputGroup>

          <InputGroup>
            <label>결제 방식</label>
            <select value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="CARD">카드</option>
              <option value="CASH">현금</option>
            </select>
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
                <>
                  <PercentInput type="number" min={0} max={100} value={m.percent} onChange={(e) => setPercent(Number(id), e.target.value)} />
                  <span>%</span>
                </>
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
          <Button text="저장" onClick={save} />
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

/* ── Styled ── */
const ModalOverlay = styled.div`
  position: fixed; top:0; left:0; width:100%; height:100%;
  background-color: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;
`;
const ModalContent = styled.div`
  background-color:white; width:90%; max-width:430px;
  border-radius:8px; overflow:hidden; max-height:90vh;
  display:flex; flex-direction:column;
`;
const ModalHeader = styled.div`
  background-color:#3b82f6; color:white; padding:1rem;
  display:flex; justify-content:space-between; align-items:center;
  button { background:none; border:none; color:white; font-size:1.2rem; font-weight:bold; cursor:pointer; }
`;
const ScrollableArea = styled.div`
  padding:1.5rem; overflow-y:auto; max-height:65vh; display:flex; flex-direction:column; gap:1.2rem;
`;
const ModalFooter = styled.div`padding:1rem 1.5rem 1.5rem;`;
const InputGroup = styled.div`display:flex; flex-direction:column;
  label{font-size:0.9rem;font-weight:500;margin-bottom:0.5rem;}
  input,textarea,select{font-size:1rem;padding:0.75rem;border:1px solid #ccc;border-radius:6px;}
`;
const Divider = styled.div`height:1px; background-color:#ddd; margin:0.5rem 0;`;
const SectionTitle = styled.h4`margin-top:0.5rem;font-size:1rem;font-weight:600;`;
const MemberRow = styled.div`display:flex; align-items:center; gap:10px; .name{flex:1; font-weight:bold;}`;
const PercentInput = styled.input`width:60px;padding:6px;border-radius:6px;border:1px solid #ddd;`;
const EqualBadge = styled.div`background:#eaf0ff;padding:6px 8px;border-radius:6px;font-weight:bold;`;
const EqualRow = styled.div`margin-top:6px; display:flex; gap:8px;`;
