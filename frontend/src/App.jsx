// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Groups from "./pages/Groups"; // ← 기존 Trips.jsx → Groups.jsx로 변경
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Mypage from "./pages/Mypage";
import ExpenseRedirect from "./pages/ExpenseRedirect";
import ExpenseForm from "./pages/ExpenseForm";
import GroupForm from "./pages/GroupForm";
import GroupCreate from "./pages/GroupCreate";
import Calendar from "./pages/Calendar";
import Footer from "./components/Footer";
import Header from "./components/Header";

import "./App.css";
import GlobalStyle from "./styles/GlobalStyle";

function AppWrapper() {
  const location = useLocation();
  const noHeaderPaths = ["/", "/login", "/signup"]; // Header 안 보일 경로

  return (
    <>
      {/* Header는 로그인/회원가입/홈 제외하고 표시 */}
      {!noHeaderPaths.includes(location.pathname) && <Header />}

      <Routes>
        {/* 기본 페이지 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<Mypage />} />

        {/* 모임 관련 */}
        <Route path="/groups" element={<Groups />} /> {/* 모임 조회 */}
        <Route path="/groupcreate" element={<GroupCreate />} /> {/* 모임 생성 */}

        {/* 📝 추후 모임 수정 기능 추가 시 사용할 예정 */}
        {/* <Route path="/groups/edit/:id" element={<GroupEdit />} /> */}

        {/* 캘린더 및 지출 관련 */}
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/expenseform" element={<ExpenseForm />} />
        <Route path="/expenseredirect" element={<ExpenseRedirect />} />
        <Route path="/groupform" element={<GroupForm />} />
      </Routes>

      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
