import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// [수정됨] API 명세서에 맞춘 ISO 8601 날짜 포맷
const formatISODate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  // 명세서 예시: 2025-09-26T12:09:00+09:00
  return `${year}-${month}-${day}T12:00:00+09:00`;
};

// 화면 표시용 날짜 (MM.DD)
const formatDisplayDate = (dateObj) => {
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${month}.${day}`;
};

const ExchangeRateModal = ({ isOpen, onClose, currency = "USD" }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (currency === "KRW") {
      setChartData([]);
      setLoading(false);
      return;
    }
    fetchWeeklyRates();
  }, [isOpen, currency]);

  const fetchWeeklyRates = async () => {
    setLoading(true);
    setError(null);
    
    const requests = [];
    const today = new Date();

    // 최근 7일간 데이터 병렬 요청
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const reqDate = formatISODate(d);
      const displayDate = formatDisplayDate(d);

      requests.push(
        axios.get(`${API_BASE_URL}/api/fx`, {
          params: {
            date: reqDate,
            base: "KRW",
            symbols: currency
          }
        })
        .then(res => {
            // [수정됨] 명세서 구조: res.data.data.rates
            const rateData = res.data.data?.rates?.[currency];
            
            if (rateData) {
              let rateVal = parseFloat(String(rateData.dealbase).replace(/,/g, ''));
              
              // [수정됨] ExpenseModal과 동일하게 100단위 통화 보정 (예: JPY(100))
              if (rateData.unit && rateData.unit.includes("100")) {
                rateVal = rateVal / 100;
              }
              return { date: displayDate, rate: rateVal };
            }
            return { date: displayDate, rate: null };
        })
        .catch(err => {
            // 주말이나 공휴일엔 데이터가 없을 수 있음 -> null 처리
            return { date: displayDate, rate: null };
        })
      );
    }

    try {
      const results = await Promise.all(requests);
      
      // 데이터가 있는 날만 걸러내거나, 끊김 없이 보여주기 위해 null을 이전 값으로 채우는 로직 등을 추가할 수 있음
      // 여기서는 값이 있는 경우만 필터링해서 보여줍니다.
      const validData = results.filter(item => item.rate !== null && item.rate > 0);
      
      if (validData.length === 0) {
        setError("표시할 환율 데이터가 없습니다. (휴장일 등)");
      } else {
        setChartData(validData);
      }
    } catch (err) {
      console.error(err);
      setError("환율 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{currency} 환율 추이 (최근 1주일)</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        
        <Body>
          {currency === "KRW" ? (
            <Message>원화(KRW)는 기준 통화이므로 그래프가 없습니다.</Message>
          ) : loading ? (
            <Message>데이터를 불러오는 중입니다...</Message>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <GraphWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tick={{ fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(value) => value.toLocaleString()} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value.toLocaleString()}원`, '적용 환율']}
                    labelStyle={{ color: '#666' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GraphWrapper>
          )}
          <InfoText>* 한국수출입은행 고시 매매기준율 (1단위 환산)</InfoText>
        </Body>
      </Container>
    </Overlay>
  );
};

export default ExchangeRateModal;

// --- Styles ---
const Overlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center; z-index: 2000;
`;
const Container = styled.div`
  background: white; width: 90%; max-width: 500px;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
`;
const Header = styled.div`
  padding: 16px 20px; background: #3b82f6; color: white;
  display: flex; justify-content: space-between; align-items: center;
`;
const Title = styled.div` font-size: 1.1rem; font-weight: bold; `;
const CloseButton = styled.button`
  background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;
`;
const Body = styled.div` padding: 24px; display: flex; flex-direction: column; align-items: center; `;
const GraphWrapper = styled.div` width: 100%; height: 250px; margin-bottom: 10px; `;
const Message = styled.div` color: #666; font-size: 0.95rem; margin: 40px 0; `;
const ErrorMessage = styled.div` color: #dc3545; font-size: 0.95rem; margin: 40px 0; `;
const InfoText = styled.div` font-size: 0.8rem; color: #999; align-self: flex-end; margin-top: 10px; `;  