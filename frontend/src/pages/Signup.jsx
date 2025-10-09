import { useState } from "react";
import styled from "styled-components";
import InputField from "../components/InputField";
import Button from "../components/Button";
import signupImage from "../assets/signup-image.png";

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
  }
`;

// 오른쪽 이미지 영역
const ImageSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 70%;
    max-width: 500px;
  }

  @media (max-width: 900px) {
    margin-bottom: 2rem;
    img {
      width: 50%;
    }
  }
`;

// 왼쪽 폼 영역
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
  max-width: 400px;
`;

// 개인정보 동의 영역
const TermsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;

  label {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

// 안내 텍스트
const InfoText = styled.p`
  font-size: 0.75rem;
  color: #555;
  margin-top: 0.5rem;
`;

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree1 || !agree2 || !agree3) {
      alert("모든 개인정보 수집 동의에 체크해주세요.");
      return;
    }
    console.log({ name, email, password, agree1, agree2, agree3 });
    // 이후 백엔드 API 연동 가능
  };

  return (
    <PageWrapper>
      <FormSection>
        <FormWrapper onSubmit={handleSubmit}>
          <InputField
            label="이름"
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            label="아이디(이메일)"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TermsWrapper>
            <label>
              <input
                type="checkbox"
                checked={agree1}
                onChange={(e) => setAgree1(e.target.checked)}
              />
              이름, 이메일 등 개인정보 수집·이용에 동의합니다.
            </label>
            <label>
              <input
                type="checkbox"
                checked={agree2}
                onChange={(e) => setAgree2(e.target.checked)}
              />
              수집된 정보는 서비스 제공 및 회원 관리 목적으로 사용되며, 보관기간
              후 파기됩니다.
            </label>
            <label>
              <input
                type="checkbox"
                checked={agree3}
                onChange={(e) => setAgree3(e.target.checked)}
              />
              회원은 언제든지 개인정보 열람·정정·삭제 및 동의 철회를 요청할 수
              있습니다.
            </label>
          </TermsWrapper>

          <Button text="회원가입" type="submit" />
        </FormWrapper>
      </FormSection>

      <ImageSection>
        <img src={signupImage} alt="Signup illustration" />
      </ImageSection>
    </PageWrapper>
  );
}
