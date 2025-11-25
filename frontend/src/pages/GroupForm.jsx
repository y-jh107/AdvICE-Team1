import { useState } from "react";
import styled from "styled-components";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import groupIcon from "../assets/travel_illustration.png";

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  background-color: #f8f9fa;
  padding: 2rem;

  @media (max-width: 900px) {
    flex-direction: column-reverse;
    justify-content: flex-start;
    padding: 1rem;
  }
`;

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

const Title = styled.h2`
  font-size: 1.4rem;
  color: #333;
  text-align: left;
  font-weight: normal;
`;

export default function GroupForm() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      navigate("/groupcreate", { state: { name } });
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button text="추가하기" type="submit" />
        </FormWrapper>
      </FormSection>
    </PageWrapper>
  );
}
