import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Groups from "./pages/Groups";
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
  const noHeaderPaths = ["/", "/login", "/signup"];

  return (
    <>
      {!noHeaderPaths.includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groupcreate" element={<GroupCreate />} />
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
