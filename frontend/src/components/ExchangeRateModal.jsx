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

  // 100단위 통화 여부 판단
  const is100Unit = ["JPY", "IDR"].includes(currency);

  useEffect(() => {
    if (!isOpen) return;
    if (currency === "KRW") {
      setChartData([]);
      setLoading(false);
      return;
    }
    fetchWeeklyRates();
  }, [isOpen, currency]);

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
      let querySymbol = currency;
      if (is100Unit) {
        querySymbol = `${currency}(100)`;
      }

      const response = await axios.get(`${API_BASE_URL}/fx`, {
        params: {
          date: getTodayDate(), 
          symbols: querySymbol, 
          base: "KRW"
        }
      });

      const responseBody = response.data;

      if (!responseBody) throw new Error("서버 응답이 없습니다.");

      if (responseBody.code === "SU") {
        const formattedData = responseBody.data.map(item => {
          return {
            date: item.date.substring(5).replace('-', '.'), 
            rate: item.rate 
          };
        });

        if (formattedData.length === 0) {
          setError("최근 데이터가 없습니다. (주말/공휴일 등)");
        } else {
          setChartData(formattedData);
        }
      } else {
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
          <Title>{is100Unit ? `${currency}(100)` : currency} 환율 추이</Title>
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
            <>
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
                      formatter={(val) => [
                        `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}원`, 
                        is100Unit ? `${currency}(100)` : '환율'
                      ]}
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
              
              {/* [추가됨] 하단 설명 문구 */}
              <Description>
                * 위 그래프는 <strong>{is100Unit ? "100" : "1"} {currency}</strong>당 원화(KRW) 환율 기준입니다.
              </Description>
            </>
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

// [추가됨] 설명 문구 스타일
const Description = styled.div`
  margin-top: 12px;
  font-size: 0.85rem;
  color: #888;
  text-align: center;
  strong {
    font-weight: 600;
    color: #555;
  }
`;