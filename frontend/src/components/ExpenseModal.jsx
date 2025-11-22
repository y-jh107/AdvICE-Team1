import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios"; // axios 임포트 필수
import Button from "./Button";
import ReceiptModal from "./ReceiptModal";
import { API_BASE_URL } from "../config";

// [1] UUID 생성 함수 (Idempotency-Key용)
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

  const [splitMode, setSplitMode] = useState("PERCENT");
  const [selectedMembers, setSelectedMembers] = useState({});

  // [3] 영수증 관련 상태 (임시 저장용)
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [tempReceiptFile, setTempReceiptFile] = useState(null);

  // 초기 멤버 셋업
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

  // ---------------------------------------------
  // [핵심] 저장 로직 (지출 생성 -> 영수증 업로드)
  // ---------------------------------------------
  const save = async () => {
    if (!name || !spentAt || !amount) return alert("지출명 / 날짜 / 총 금액은 필수입니다.");
    if (!validatePercent()) return alert("참여자 퍼센트 합계는 100이어야 합니다.");

    const participants = Object.entries(selectedMembers)
      .filter(([_, v]) => v.selected)
      .map(([id, v]) => ({ userId: Number(id), percent: v.percent }));

    const body = {
      name, spentAt, amount: Number(amount), payment, location, memo, splitMode, participants
    };

    let newExpenseId = null;

    try {
      if (!accessToken) {
        alert("로그인이 필요합니다. (테스트 모드)");
        onSuccess?.(); onClose(); return;
      }

      // 1. 지출 생성 API 호출 (fetch 사용)
      // [2] 경로 수정: API_BASE_URL 사용
      const res = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "지출 등록 실패");

      // ID 추출 (서버 응답 키에 따라 expenseId 혹은 id)
      newExpenseId = json.data?.expenseId || json.data?.id;

    } catch (err) {
      console.error(err);
      alert(`지출 저장 실패: ${err.message}`);
      return; // 지출 실패 시 여기서 중단
    }

    // 2. 영수증 업로드 API (지출 생성 성공 && 파일 있을 때만 실행)
    if (newExpenseId && tempReceiptFile) {
      try {
        const formData = new FormData();
        formData.append("image", tempReceiptFile);
        
        // [1] Idempotency-Key 생성
        const idempotencyKey = generateUUID();

        // [2] 경로 수정 및 [1] 헤더 추가
        await axios.post(`${API_BASE_URL}/expenses/${newExpenseId}/receipts`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
            "Idempotency-Key": idempotencyKey, // 필수 헤더 추가됨
          }
        });
      } catch (uploadErr) {
        console.error("영수증 업로드 에러:", uploadErr);
        // 지출은 이미 저장되었으므로, 사용자에게 부분 성공임을 알림
        alert("지출은 저장되었으나, 영수증 이미지 업로드에 실패했습니다.");
        onSuccess?.();
        onClose();
        return;
      }
    }

    // 모든 과정 성공
    alert("저장되었습니다.");
    onSuccess?.();
    onClose();
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
            <Button text="저장" onClick={save} style={{ width: '100%' }} />
            <WhiteButton onClick={() => setShowReceiptModal(true)} isSelected={!!tempReceiptFile}>
              {tempReceiptFile ? "영수증 선택됨 (변경하기)" : "영수증 등록"}
            </WhiteButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>

      {/* 영수증 모달 (임시 저장 모드) */}
      {showReceiptModal && (
        <ReceiptModal 
          isOpen={true}
          onClose={() => setShowReceiptModal(false)}
          expenseId={null} // null = 생성 모드 (파일만 리턴)
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
const ModalFooter = styled.div` padding: 1rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 10px; `;
const InputGroup = styled.div` display:flex; flex-direction:column; label{font-size:0.9rem;font-weight:500;margin-bottom:0.5rem;} input,textarea,select{font-size:1rem;padding:0.75rem;border:1px solid #ccc;border-radius:6px;} `;
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