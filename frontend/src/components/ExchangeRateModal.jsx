import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// [수정] 최근 7일 날짜 배열 생성 (YYYY-MM-DD)
const getPast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
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
    
    try {
      // 1. 최근 7일 날짜 준비
      const dates = getPast7Days();

      // 2. 100단위 통화 심볼 처리 (JPY, IDR) - ExpenseModal과 동일하게 처리
      let querySymbol = currency;
      const is100Unit = ["JPY", "IDR"].includes(currency);
      if (is100Unit) {
        querySymbol = `${currency}(100)`;
      }

      // 3. 7일치 데이터 병렬 요청 (API가 하루치씩만 주기 때문)
      const requests = dates.map(date => 
        axios.get(`${API_BASE_URL}/fx`, {
          params: { date, base: "KRW" }
        }).catch(() => null) // 실패 시(주말 등) null 반환하여 전체 로직 안 멈추게 함
      );

      const responses = await Promise.all(requests);

      // 4. 데이터 가공 및 병합
      const formattedData = responses
        .map((res, index) => {
          if (!res || !res.data) return null;
          
          // 응답 구조 확인 (배열 혹은 { data: [] })
          const dataList = Array.isArray(res.data) ? res.data : (res.data.data || []);
          
          // 해당 통화(cur_unit) 찾기
          const targetItem = dataList.find(item => item.cur_unit === querySymbol);
          if (!targetItem) return null;

          // [핵심 로직] deal_bas_r(매매기준율) 파싱 및 콤마 제거
          let rateVal = typeof targetItem.deal_bas_r === 'string' 
            ? parseFloat(targetItem.deal_bas_r.replace(/,/g, '')) 
            : targetItem.deal_bas_r;

          // 100단위 통화라면 1단위로 보정
          if (is100Unit) {
            rateVal = rateVal / 100;
          }

          return {
            date: dates[index].substring(5).replace('-', '.'), // MM.DD
            rate: rateVal
          };
        })
        .filter(item => item !== null); // 데이터가 없는 날(주말)은 필터링

      if (formattedData.length === 0) {
        setError("최근 데이터가 없습니다. (주말/공휴일 제외)");
      } else {
        setChartData(formattedData);
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
                    // 소수점 제거해서 깔끔하게 표시
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