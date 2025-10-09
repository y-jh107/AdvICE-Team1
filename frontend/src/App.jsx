import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";


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

import "./App.css";
import GlobalStyle from "./styles/GlobalStyle"; 


function App() {
  

  return (
    <BrowserRouter>
     
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

    </BrowserRouter>
  );
}

export default App;
