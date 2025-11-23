import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Button from "./Button";
import ReceiptModal from "./ReceiptModal";
import ExchangeRateModal from "./ExchangeRateModal"; // 그래프 모달
import { API_BASE_URL } from "../config";

// [1] UUID 생성 (중복 방지 키)
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// [2] 오늘 날짜 (YYYY-MM-DD)
const getTodayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; 
};

export default function ExpenseModal({ groupId, members = [], onClose, onSuccess }) {
  const accessToken = localStorage.getItem("accessToken");

  const [name, setName] = useState("");
  const [spentAt, setSpentAt] = useState("");
  
  // amount: 사용자가 입력하는 금액 (외화일 수 있음)
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [memo, setMemo] = useState("");
  const [payment, setPayment] = useState("CARD");
  
  // 통화 및 환율
  const [currency, setCurrency] = useState("KRW");
  const [currentRate, setCurrentRate] = useState(1); 

  const [splitMode, setSplitMode] = useState("PERCENT");
  const [selectedMembers, setSelectedMembers] = useState({});

  // 모달 상태
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [tempReceiptFile, setTempReceiptFile] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  useEffect(() => {
    const initialMembers = members.length ? members : [
      { userId: 1, name: "김정통" }, { userId: 2, name: "홍길동" }, { userId: 3, name: "유성열" }
    ];
    const obj = {};
    initialMembers.forEach((m) => obj[m.userId] = { selected: false, percent: 0 });
    setSelectedMembers(obj);
  }, [members]);

  // [핵심] 환율 조회 (API 배열 응답 처리)
  useEffect(() => {
    if (currency === "KRW") {
      setCurrentRate(1);
      return;
    }

    const fetchRate = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/fx`, {
          params: { date: getTodayISO(), base: "KRW", symbols: currency }
        });
        
        // 응답: { code: "SU", data: [ {date: "2025-11-XX", rate: 1390.5}, ... ] }
        const list = res.data.data;

        if (list && list.length > 0) {
          // 가장 최근 데이터 사용 (배열의 마지막 요소)
          const latestData = list[list.length - 1];
          const rateNum = latestData.rate;

          if (rateNum > 0) setCurrentRate(rateNum);
          else setCurrentRate(1);
        } else {
          setCurrentRate(1); // 데이터 없음
        }
      } catch (err) {
        console.error("환율 조회 실패", err);
        setCurrentRate(1); 
      }
    };
    fetchRate();
  }, [currency]);

  // 멤버 분배 로직
  const toggleMember = (id, checked) => {
    setSelectedMembers((prev) => ({
      ...prev, [id]: { ...prev[id], selected: checked }
    }));
    setSplitMode("PERCENT");
  };
  const setPercent = (id, v) => {
    setSelectedMembers((prev) => ({ ...prev, [id]: { ...prev[id], percent: Number(v) } }));
  };
  const equalSplit = () => {
    const ids = Object.entries(selectedMembers).filter(([_, v]) => v.selected).map(([id]) => Number(id));
    if (ids.length === 0) return alert("참여자를 선택해주세요.");
    const base = Math.floor(100 / ids.length);
    const remainder = 100 - base * ids.length;
    const next = { ...selectedMembers };
    ids.forEach((id, idx) => next[id].percent = base + (idx === 0 ? remainder : 0));
    setSelectedMembers(next);
    setSplitMode("EQUAL");
  };
  const validatePercent = () => {
    if (splitMode === "EQUAL") return true;
    const sum = Object.values(selectedMembers).filter((m) => m.selected).reduce((a, b) => a + b.percent, 0);
    return sum === 100;
  };

  // [저장] 외화 -> 원화 변환 후 전송
  const save = async () => {
    if (!name || !spentAt || !amount) return alert("필수 정보를 입력해주세요.");
    if (!validatePercent()) return alert("참여자 퍼센트 합계는 100이어야 합니다.");

    // 원화 환산 (소수점 버림)
    const finalAmountKRW = Math.floor(Number(amount) * currentRate);

    const participants = Object.entries(selectedMembers)
      .filter(([_, v]) => v.selected)
      .map(([id, v]) => ({ userId: Number(id), percent: v.percent }));

    const body = {
      name, spentAt, 
      amount: finalAmountKRW, // 원화 금액 전송
      payment, location, memo, splitMode, participants,
      currency: "KRW" 
    };

    try {
      if (!accessToken) {
        alert(`[테스트 저장]\n입력: ${amount} ${currency}\n환율: ${currentRate}\n저장액: ${finalAmountKRW.toLocaleString()}원`);
        onSuccess?.(); onClose(); return;
      }

      // 1. 지출 생성
      const res = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "등록 실패");

      const newExpenseId = json.data?.expenseId || json.data?.id;

      // 2. 영수증 업로드 (있을 경우)
      if (newExpenseId && tempReceiptFile) {
        const formData = new FormData();
        formData.append("image", tempReceiptFile);
        await axios.post(`${API_BASE_URL}/expenses/${newExpenseId}/receipts`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
            "Idempotency-Key": generateUUID(),
          }
        });
      }

      alert(`저장되었습니다.\n(원화 환산: ${finalAmountKRW.toLocaleString()}원)`);
      onSuccess?.();
      onClose();

    } catch (err) {
      console.error(err);
      alert("오류 발생: " + err.message);
    }
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
              <label>금액 {currency !== "KRW" && "(현지 통화)"}</label>
              <CurrencyContainer>
                <CurrencyInputWrapper>
                  <CurrencyInput
                    type="number"
                    placeholder={currency === "KRW" ? "원화 금액" : `금액 입력 (${currency})`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {amount && <ResetButton onClick={() => setAmount("")}>×</ResetButton>}
                </CurrencyInputWrapper>
                
                <CurrencySelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="KRW">🇰🇷 원 (KRW)</option>
                  <option value="JPY">🇯🇵 엔 (JPY)</option>
                  <option value="USD">🇺🇸 달러 (USD)</option>
                  <option value="CNY">🇨🇳 위안 (CNY)</option>
                  <option value="HKD">🇭🇰 홍콩 (HKD)</option>
                  <option value="TWD">🇹🇼 대만 (TWD)</option>
                  <option value="THB">🇹🇭 바트 (THB)</option>
                  <option value="VND">🇻🇳 동 (VND)</option>
                  <option value="EUR">🇪🇺 유로 (EUR)</option>
                </CurrencySelect>
              </CurrencyContainer>

              {/* 환율 미리보기 */}
              {currency !== "KRW" && amount && (
                <ConversionPreview>
                  ≈ {(Math.floor(Number(amount) * currentRate)).toLocaleString()}원 
                  <span className="rateInfo"> (적용 환율: {currentRate.toLocaleString()}원)</span>
                </ConversionPreview>
              )}
            </InputGroup>

            <InputGroup>
              <label>결제 방식</label>
              <RoundedSelect value={payment} onChange={(e) => setPayment(e.target.value)}>
                <option value="CARD">카드</option>
                <option value="CASH">현금</option>
              </RoundedSelect>
            </InputGroup>

            <InputGroup>
              <label>장소</label>
              <input type="text" placeholder="예: 야시장" value={location} onChange={(e) => setLocation(e.target.value)} />
            </InputGroup>

            <InputGroup>
              <label>메모</label>
              <textarea placeholder="메모 입력" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} />
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
            {/* [상단] 환율 그래프 버튼 (꽉 찬 너비) */}
            {currency !== "KRW" && (
              <WhiteButton 
                onClick={() => setShowExchangeModal(true)} 
                style={{ width: '100%', marginBottom: '10px' }}
              >
                📈 {currency} 환율 그래프 보기
              </WhiteButton>
            )}

            {/* [하단] 저장 & 영수증 버튼 (가로 배치) */}
            <ButtonRow>
              <Button text="저장" onClick={save} />
              <WhiteButton onClick={() => setShowReceiptModal(true)} isSelected={!!tempReceiptFile}>
                {tempReceiptFile ? "영수증 변경" : "영수증 등록"}
              </WhiteButton>
            </ButtonRow>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>

      {/* 영수증 모달 */}
      {showReceiptModal && (
        <ReceiptModal 
          isOpen={true} onClose={() => setShowReceiptModal(false)}
          expenseId={null} onSave={(file) => setTempReceiptFile(file)}
          receiptImgData={tempReceiptFile ? URL.createObjectURL(tempReceiptFile) : null}
        />
      )}
      
      {/* 환율 그래프 모달 */}
      <ExchangeRateModal 
        isOpen={showExchangeModal} onClose={() => setShowExchangeModal(false)}
        currency={currency} 
      />
    </>
  );
}

// --- Styled Components ---
const ModalOverlay = styled.div` position: fixed; top:0; left:0; width:100%; height:100%; background-color: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000; `;
const ModalContent = styled.div` background-color:white; width:90%; max-width:430px; border-radius:8px; overflow:hidden; max-height:90vh; display:flex; flex-direction:column; `;
const ModalHeader = styled.div` background-color:#3b82f6; color:white; padding:1rem; display:flex; justify-content:space-between; align-items:center; button { background:none; border:none; color:white; font-size:1.2rem; font-weight:bold; cursor:pointer; } `;
const ScrollableArea = styled.div` padding:1.5rem; overflow-y:auto; max-height:65vh; display:flex; flex-direction:column; gap:1.2rem; `;
const ModalFooter = styled.div` padding: 1rem 1.5rem 1.5rem; display: flex; flex-direction: column; `;

const ButtonRow = styled.div` 
  display: flex; gap: 10px; width: 100%; 
  & > * { flex: 1; width: auto; } 
`;

const InputGroup = styled.div`
  display:flex; flex-direction:column;
  label{font-size:0.9rem;font-weight:500;margin-bottom:0.5rem;}
  input[type="date"], input[type="text"]:not(:first-child), textarea {
    font-size:1rem; padding:0.75rem; border:1px solid #ccc; border-radius:6px;
  }
`;

const CurrencyContainer = styled.div` display: flex; gap: 10px; align-items: center; `;
const CurrencyInputWrapper = styled.div` position: relative; flex: 1; `;
// 둥근 금액 입력창 (border-radius: 20px)
const CurrencyInput = styled.input` width: 100%; padding: 0.75rem 2.5rem 0.75rem 1rem; border: 1px solid #ccc; border-radius: 20px; font-size: 1rem; box-sizing: border-box; &::placeholder { color: #999; } &:focus { outline: none; border-color: #3b82f6; } `;
const ResetButton = styled.button` position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999; padding: 0; line-height: 1; `;
const CurrencySelect = styled.select` padding: 0.75rem; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; min-width: 100px; cursor: pointer; &:focus { outline: none; border-color: #3b82f6; } `;

// [UI] 결제 방식도 둥근 디자인 적용
const RoundedSelect = styled.select` width: 100%; padding: 0.75rem 1rem; border: 1px solid #ccc; border-radius: 20px; font-size: 1rem; background-color: white; cursor: pointer; box-sizing: border-box; &:focus { outline: none; border-color: #3b82f6; } `;

const ConversionPreview = styled.div`
  margin-top: 8px; font-size: 0.95rem; color: #2563eb; font-weight: bold; text-align: right;
  .rateInfo { font-size: 0.8rem; color: #888; font-weight: normal; }
`;

const Divider = styled.div` height:1px; background-color:#ddd; margin:0.5rem 0; `;
const SectionTitle = styled.h4` margin-top:0.5rem;font-size:1rem;font-weight:600; `;
const MemberRow = styled.div` display:flex; align-items:center; gap:10px; .name{flex:1; font-weight:bold;} `;
const PercentInput = styled.input` width:60px;padding:6px;border-radius:6px;border:1px solid #ddd; `;
const EqualBadge = styled.div` background:#eaf0ff;padding:6px 8px;border-radius:6px;font-weight:bold; `;
const EqualRow = styled.div` margin-top:6px; display:flex; gap:8px; `;
const WhiteButton = styled.button` width: 100%; padding: 10px 20px; background-color: ${props => props.isSelected ? '#e3efff' : 'white'}; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.2s; &:hover { background-color: #f0f7ff; } `;