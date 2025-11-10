import { useState } from "react";
import styled from "styled-components";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import groupIcon from "../assets/travel_illustration.png";

// 전체 페이지 래퍼
const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem;

  @media (max-width: 900px) {
    flex-direction: column-reverse;
    justify-content: flex-start;
    padding: 1rem;
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
    max-width: 400px;
  }

  @media (max-width: 900px) {
    margin-bottom: 3rem;
    img {
      width: 70%;
      max-width: 250px;
    }
  }
`;

// 오른쪽 폼 영역
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

// 폼 래퍼
const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 80%;
  max-width: 380px;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

// 타이틀 스타일
const Title = styled.h2`
  font-size: 1.4rem;
  color: #333;
  text-align: left;
  font-weight: normal; /* 볼드 제거 */
`;


export default function GroupForm() {
  const [groupName, setGroupName] = useState("");
  //const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // name이라면 아래의 코드들도 수정해야 됨
    if (groupName.trim()) {
      navigate("/GroupCreate", { state: { groupName } });
    }
  };

  return (
    <PageWrapper>
      <ImageSection>
        <img src={groupIcon} alt="여행 그룹 아이콘" />
      </ImageSection>

      <FormSection>
        <FormWrapper onSubmit={handleSubmit}>
          <Title>여행명</Title>
          <InputField
            type="text"
            placeholder="새로 추가할 여행명을 입력해주세요"
            // 22
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <Button text="추가하기" type="submit" />
        </FormWrapper>
      </FormSection>
    </PageWrapper>
  );
}