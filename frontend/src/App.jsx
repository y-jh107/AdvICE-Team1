import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Footer from "./components/Footer";

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

import GlobalStyle from "./styles/GlobalStyle";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>

        {/* 라우팅 추가 */}
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
      </BrowserRouter>
    </>
  );
}

export default App;
