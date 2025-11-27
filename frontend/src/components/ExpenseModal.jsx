import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Button from "./Button";
import ReceiptModal from "./ReceiptModal";
import ExchangeRateModal from "./ExchangeRateModal"; 
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
  // 날짜가 비어있으면 오늘 날짜를 기본값으로 사용
  const [spentAt, setSpentAt] = useState(getTodayISO());
  
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [memo, setMemo] = useState("");
  const [payment, setPayment] = useState("card");
  
  const [currency, setCurrency] = useState("KRW");
  const [currentRate, setCurrentRate] = useState(1); 

  const [splitMode, setSplitMode] = useState("PERCENT");
  const [selectedMembers, setSelectedMembers] = useState({});

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [tempReceiptFile, setTempReceiptFile] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  useEffect(() => {
    const initialMembers = members.length ? members : [
      { userId: 1, name: "김정통" }, { userId: 2, name: "홍길동" }, { userId: 3, name: "장주연" }
    ];
    const obj = {};
    initialMembers.forEach((m) => obj[m.userId] = { selected: false, percent: 0 });
    setSelectedMembers(obj);
  }, [members]);

  // [수정] 환율 조회 로직 (ExchangeRateModal과 동일한 API/방식 사용)
  useEffect(() => {
    if (currency === "KRW") {
      setCurrentRate(1);
      return;
    }

    const fetchRate = async () => {
      try {
        // 1. 심볼 처리 (기존 로직 유지)
        let querySymbol = currency;
        const is100Unit = ["JPY", "IDR"].includes(currency);
        if (is100Unit) {
          querySymbol = `${currency}(100)`;
        }

        const dateParam = spentAt || getTodayISO();

        // 2. API 호출 (명세서 방식: /api/fx)
        const res = await axios.get(`${API_BASE_URL}/api/fx`, {
          params: { 
            date: dateParam, 
            symbols: querySymbol, // 처리된 심볼 전달 (JPY(100))
            base: "KRW" 
          } 
        });
        
        const responseBody = res.data;

        // 3. 응답 처리 (API 명세서 구조: code, data)
        if (responseBody && responseBody.code === "SU" && responseBody.data && responseBody.data.length > 0) {
          // data는 [{ date: "YYYY-MM-DD", rate: 1234 }, ...] 형태의 배열
          // 선택한 날짜(spentAt)와 일치하는 데이터가 있으면 사용, 없으면(주말 등) 가장 최근 데이터 사용
          const exactMatch = responseBody.data.find(item => item.date === dateParam);
          
          // 정확한 날짜가 없으면 배열의 첫 번째(보통 가장 최근 유효일) 사용
          const targetItem = exactMatch || responseBody.data[0];

          if (targetItem) {
            let rateVal = Number(targetItem.rate);

            // 4. 100단위 통화 보정 (기존 로직 유지)
            // 백엔드는 원본 데이터를 주므로, 여기서 100으로 나눠야 함
            if (is100Unit) {
              rateVal = rateVal / 100;
            }

            setCurrentRate(rateVal > 0 ? rateVal : 1);
          }
        } else {
          // 데이터가 없거나 실패한 경우
          console.warn(`${currency} 환율 데이터 없음`);
          setCurrentRate(1); 
        }
      } catch (err) {
        console.error("환율 조회 실패", err);
        setCurrentRate(1); 
      }
    };
    fetchRate();
  }, [currency, spentAt]);

  // 멤버 분배 로직
  const toggleMember = (id, checked) => {
    setSelectedMembers((prev) => ({
      ...prev, [id]: { ...prev[id], selected: checked }
    }));
    setSplitMode("by_percent");
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
    setSplitMode("equal");
  };
  const validatePercent = () => {
    if (splitMode === "equal") return true;
    const sum = Object.values(selectedMembers).filter((m) => m.selected).reduce((a, b) => a + b.percent, 0);
    return sum === 100;
  };

  const save = async () => {
    if (!name || !spentAt || !amount) return alert("필수 정보를 입력해주세요.");
    if (!validatePercent()) return alert("참여자 퍼센트 합계는 100이어야 합니다.");

    const finalAmountKRW = Math.floor(Number(amount) * currentRate);

    const participants = Object.entries(selectedMembers)
      .filter(([_, v]) => v.selected)
      .map(([id, v]) => ({ userId: Number(id), percent: v.percent }));

    const body = {
      name, spentAt, 
      amount: finalAmountKRW,
      payment, location, memo, splitMode, participants,
      currency: "KRW" 
    };

    try {
      if (!accessToken) {
        alert(`[테스트 저장]\n입력: ${amount} ${currency}\n환율(1단위): ${currentRate}\n저장액: ${finalAmountKRW.toLocaleString()}원`);
        onSuccess?.(); onClose(); return;
      }

      const res = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "등록 실패");

      const newExpenseId = json.data?.expenseId || json.data?.id;

      if (newExpenseId && tempReceiptFile) {
        const formData = new FormData();
        formData.append("image", tempReceiptFile);
        await axios.post(`${API_BASE_URL}/groups/${groupId}/expenses/${newExpenseId}/receipts`, formData, {
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
              <input type="text" placeholder="예: 야시장" value={name} onChange={(e) => setName(e.target.value)} />
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
                  <option value="CNH">🇨🇳 위안 (CNH)</option>
                  <option value="HKD">🇭🇰 홍콩 (HKD)</option>
                  <option value="SGD">🇸🇬 싱가포르 (SGD)</option>
                  <option value="THB">🇹🇭 바트 (THB)</option>
                  <option value="AUD">🇦🇺 호주 (AUD)</option>
                  <option value="EUR">🇪🇺 유로 (EUR)</option>
                </CurrencySelect>
              </CurrencyContainer>

              {/* 환율 미리보기 */}
              {currency !== "KRW" && (
                <ConversionPreview>
                  {amount ? `≈ ${(Math.floor(Number(amount) * currentRate)).toLocaleString()}원` : "금액을 입력하세요"}
                  <div className="rateInfo">
                    적용 환율: 1 {currency} = {currentRate.toLocaleString()} KRW
                    {currentRate === 1 && <span style={{color:'red', marginLeft:'5px'}}>(환율 정보 없음)</span>}
                  </div>
                </ConversionPreview>
              )}
            </InputGroup>

            <InputGroup>
              <label>결제 방식</label>
              <PaymentButtonGroup>
                <PaymentButton
                  active={payment === "card"}
                  onClick={() => setPayment("card")}
                >
                  카드
                </PaymentButton>
                <PaymentButton
                  active={payment === "cash"}
                  onClick={() => setPayment("cash")}
                >
                  현금
                </PaymentButton>
              </PaymentButtonGroup>
              <label style={{marginTop: '10px'}}>장소</label>
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
                {splitMode === "by_percent" && m.selected && (
                  <> <PercentInput type="number" min={0} max={100} value={m.percent} onChange={(e) => setPercent(Number(id), e.target.value)} /> <span>%</span> </>
                )}
                {splitMode === "equal" && m.selected && <EqualBadge>{m.percent}%</EqualBadge>}
              </MemberRow>
            ))}
            <EqualRow>
              <input type="checkbox" checked={splitMode === "equal"} onChange={equalSplit} />
              <span>균등 분배</span>
            </EqualRow>
          </ScrollableArea>

          <ModalFooter>
            {/* [상단] 환율 그래프 버튼 */}
            {currency !== "KRW" && (
              <WhiteButton 
                onClick={() => setShowExchangeModal(true)} 
                style={{ width: '100%', marginBottom: '10px' }}
              >
                📈 {currency} 환율 추세 확인
              </WhiteButton>
            )}

            {/* [하단] 저장 & 영수증 버튼 */}
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
const ModalHeader = styled.div` background-color:#3b82f6; color:white; padding:1rem; display:flex; justify-content:space-between; align-items:center; button { background:none; border:none; color:white; font-size:1.2rem; font-weight:normal; cursor:pointer; } `;
const ScrollableArea = styled.div` padding:1.5rem; overflow-y:auto; max-height:65vh; display:flex; flex-direction:column; gap:1.2rem; `;
const ModalFooter = styled.div` padding: 1rem 1.5rem 1.5rem; display: flex; flex-direction: column; `;

const ButtonRow = styled.div` display: flex; gap: 10px; width: 100%; & > * { flex: 1; width: auto; } `;

const InputGroup = styled.div`
  display:flex; flex-direction:column;
  label{font-size:0.9rem;font-weight:300;margin-bottom:0.5rem;}
  input[type="date"], input[type="text"]:not(:first-child), textarea {
    font-size:1rem; padding:0.75rem; border:1px solid #ccc; border-radius:6px;
  }
`;

const CurrencyContainer = styled.div` display: flex; gap: 10px; align-items: center; `;
const CurrencyInputWrapper = styled.div` position: relative; flex: 1; `;
const CurrencyInput = styled.input` width: 100%; padding: 0.75rem 2.5rem 0.75rem 1rem; border: 1px solid #ccc; border-radius: 15px; font-size: 1rem; box-sizing: border-box; &::placeholder { color: #999; } &:focus { outline: none; border-color: #3b82f6; } `;
const ResetButton = styled.button` position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999; padding: 0; line-height: 1; `;
const CurrencySelect = styled.select` padding: 0.75rem; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; min-width: 100px; cursor: pointer; &:focus { outline: none; border-color: #3b82f6; } `;

const ConversionPreview = styled.div`
  margin-top: 8px; font-size: 1.0rem; color: #2563eb; font-weight: bold; text-align: right;
  .rateInfo { font-size: 0.8rem; color: #666; font-weight: normal; margin-top: 2px; }
`;

const Divider = styled.div` height:1px; background-color:#ddd; margin:0.5rem 0; `;
const SectionTitle = styled.h4` margin-top:0.5rem;font-size:1rem;font-weight:600; `;
const MemberRow = styled.div` display:flex; align-items:center; gap:10px; .name{flex:1; font-weight:normal;} `;
const PercentInput = styled.input` width:60px;padding:6px;border-radius:6px;border:1px solid #ddd; `;
const EqualBadge = styled.div` background:#eaf0ff;padding:6px 8px;border-radius:6px;font-weight:normal; `;
const EqualRow = styled.div` margin-top:6px; display:flex; gap:8px; `;
const WhiteButton = styled.button` width: 100%; padding: 10px 20px; background-color: ${props => props.isSelected ? '#e3efff' : 'white'}; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 8px; font-size: 16px; font-weight: normal; cursor: pointer; transition: all 0.2s; &:hover { background-color: #f0f7ff; } `;

const PaymentButtonGroup = styled.div` display: flex; background: #f8f9ff; border: 1.5px solid #e2e8ff; border-radius: 16px; padding: 6px; gap: 6px; `;
const PaymentButton = styled.button` flex: 1; padding: 12px 16px; border: none; border-radius: 12px; font-size: 15px; font-weight: 300; background: ${(props) => (props.active ? "#226cff" : "transparent")}; color: ${(props) => (props.active ? "white" : "#444")}; cursor: pointer; transition: all 0.2s ease; &:hover { background: ${(props) => (props.active ? "#1a5be6" : "#eef1ff")}; } `;