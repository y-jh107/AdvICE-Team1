import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

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

  // 오늘 날짜 구하기 (YYYY-MM-DD)
  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchWeeklyRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. [기존 로직 유지] 100단위 통화 심볼 처리 (JPY, IDR)
      let querySymbol = currency;
      const is100Unit = ["JPY", "IDR"].includes(currency);
      if (is100Unit) {
        querySymbol = `${currency}(100)`;
      }

      // 2. [수정됨] API 호출 (반복문 제거 -> 1회 호출로 변경)
      // querySymbol(예: JPY(100))을 그대로 서버에 전달
      const response = await axios.get(`${API_BASE_URL}/fx`, {
        params: {
          date: getTodayDate(), // 오늘 날짜 기준
          symbols: querySymbol, // 변환된 심볼 사용 (건드리지 않음)
          base: "KRW"
        }
      });

      const responseBody = response.data;

      // 3. 응답 처리
      if (!responseBody) throw new Error("서버 응답이 없습니다.");

      if (responseBody.code === "SU") {
        const formattedData = responseBody.data.map(item => {
          // 서버에서 받은 값 (콤마 등은 백엔드가 처리했거나 숫자형으로 옴)
          let rateVal = item.rate;

          // 4. [기존 로직 유지] 100단위 통화라면 1단위로 보정
          if (is100Unit) {
            rateVal = rateVal / 100;
          }

          return {
            date: item.date.substring(5).replace('-', '.'), // MM.DD 포맷팅
            rate: rateVal
          };
        });

        if (formattedData.length === 0) {
          setError("최근 데이터가 없습니다. (주말/공휴일 등)");
        } else {
          setChartData(formattedData);
        }
      } else {
        // 에러 코드 처리 (AE, TO 등)
        setError(responseBody.message || "환율 정보를 불러올 수 없습니다.");
      }

    } catch (err) {
      console.error(err);
      setError("서버 통신 중 오류가 발생했습니다.");
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
            <Message>원화(KRW)는 기준 통화입니다.</Message>
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
                    tickFormatter={(val) => Math.floor(val).toLocaleString()} 
                  />
                  <Tooltip 
                    formatter={(val) => [`${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}원`, '환율']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
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
        </Body>
      </Container>
    </Overlay>
  );
};

export default ExchangeRateModal;

// --- Styles ---
const Overlay = styled.div` position: fixed; inset:0; background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index: 2000; `;
const Container = styled.div` background: white; width: 90%; max-width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); `;
const Header = styled.div` padding: 16px 20px; background: #3b82f6; color: white; display: flex; justify-content: space-between; align-items: center; `;
const Title = styled.div` font-size: 1.1rem; font-weight: bold; `;
const CloseButton = styled.button` background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; `;
const Body = styled.div` padding: 24px; display: flex; flex-direction: column; align-items: center; min-height: 300px; justify-content: center; `;
const GraphWrapper = styled.div` width: 100%; height: 250px; margin-bottom: 10px; `;
const Message = styled.div` color: #666; font-size: 0.95rem; `;
const ErrorMessage = styled.div` color: #dc3545; font-size: 0.95rem; `;