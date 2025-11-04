// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Trips from "./pages/Trips";
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

// --- Header 조건부 렌더링을 위해 Wrapper 컴포넌트 생성 ---
function AppWrapper() {
  const location = useLocation();
  const noHeaderPaths = ["/", "/login", "/signup"]; // Header 안 보일 경로

  return (
    <>
      {/* 현재 경로가 noHeaderPaths에 없으면 Header 표시 */}
      {!noHeaderPaths.includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/expenseredirect" element={<ExpenseRedirect />} />
        <Route path="/expenseform" element={<ExpenseForm />} />
        <Route path="/groupform" element={<GroupForm />} />
        <Route path="/groupcreate" element={<GroupCreate />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/trips" element={<Trips />} />
      </Routes>

      <Footer />
    </>
  );
}

// --- App 컴포넌트 ---
function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
