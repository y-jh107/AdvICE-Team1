import { useState } from "react";
import styled from "styled-components";
import InputField from "../components/InputField";
import Button from "../components/Button";
import loginImage from "../assets/login-image.png";
import { API_BASE_URL } from "../config";
import api from "../axios"; //axios 인스턴스 추가
import {useNavigate} from "react-router-dom";

// 전체 페이지 래퍼
const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
  padding: 1rem;

  @media (max-width: 900px) {
    flex-direction: column-reverse;
    justify-content: flex-start;
    padding: 5rem 1rem 1rem;
  }
`;

// 왼쪽 이미지 영역
const ImageSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 80%;
    max-width: 500px;
  }

  @media (max-width: 900px) {
    margin-bottom: 5rem;
    img {
      width: 80%;
      max-width: 300px;
    }
  }
`;

// 오른쪽 로그인 폼 영역
const FormSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  @media (max-width: 900px) {
    width: 90%;
  }
`;

// 폼 자체 스타일
const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 80%;
  max-width: 320px;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

// 회원가입 링크
const SignupText = styled.p`
  text-align: center;
  font-size: 0.9rem;
  margin-top: 1rem;

  a {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
    margin-left: 0.25rem;
  }

  a:hover {
    text-decoration: underline;
  }
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/v1/auth/sign-in", {
        email,
        password,
      });

      const data = response.data;

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);

      alert("로그인 성공!");
      navigate("/groups");
    } catch (err) {
      console.error(err);
      alert("로그인 실패");
    }
  };

  return (
    <PageWrapper>
      <ImageSection>
        <img src={loginImage} alt="Login illustration" />
      </ImageSection>

      <FormSection>
        <FormWrapper onSubmit={handleSubmit}>
          <InputField
            label="아이디(이메일)"
            type="email"
            placeholder="입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="비밀번호"
            type="password"
            placeholder="입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button text="로그인" type="submit" />
          <SignupText>
            계정이 없으신가요? <a href="/signup">회원가입</a>
          </SignupText>
        </FormWrapper>
      </FormSection>
    </PageWrapper>
  );
}
