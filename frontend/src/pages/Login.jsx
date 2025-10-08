import { useState } from "react";
import styled from "styled-components";
import InputField from "../components/InputField";
import Button from "../components/Button";
import loginImage from "../assets/login-image.png"; // 이미지 경로 ✅

// 전체 페이지 래퍼
const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
`;

// 왼쪽 이미지 영역
const ImageSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 70%;
    max-width: 500px;
  }
`;

// 오른쪽 로그인 폼 영역
const FormSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// 폼 자체 스타일
const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 80%;
  max-width: 320px;
`;

// “아이디(이메일)” “비밀번호” 같은 라벨
const Label = styled.label`
  font-weight: 800;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
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
