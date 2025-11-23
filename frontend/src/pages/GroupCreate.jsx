import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import styled from "styled-components";
import Button from "../components/Button";
import { API_BASE_URL } from "../config";

const CommonInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background-color: #fafbff;
  transition: all 0.25s ease;
  box-sizing: border-box;

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CommonTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background-color: #fafbff;
  resize: vertical;
  min-height: 100px;
  transition: all 0.25s ease;
  box-sizing: border-box;

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const PageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 6rem 2rem 4rem;
  gap: 5rem;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    padding: 5rem 1rem 2rem;
    gap: 3rem;
  }
`;

const LeftSection = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImageUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImagePreview = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
`;

const Placeholder = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
`;

const PlaceholderText = styled.span`
  color: white;
  font-size: 2.5rem;
  font-weight: normal;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadLabel = styled.label`
  background-color: transparent;
  color: #3b82f6;
  padding: 0.65rem 1.8rem;
  border: 2px solid #3b82f6;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background-color: #3b82f6;
    color: white;
  }
`;

const RightSection = styled.div`
  flex: 1;
  min-width: 500px;
  max-width: 620px;
  width: 100%;

  @media (max-width: 900px) {
    min-width: unset;
    width: 90%;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.05rem;
  margin: 0 0 0.75rem 0;
  color: #2d3748;
  font-weight: 300;
`;

const MemberRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
`;

const RemoveButton = styled.button`
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #fecaca;
  }
`;

const AddMemberButton = styled.button`
  background-color: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  padding: 0.65rem 1.8rem;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background-color: #3b82f6;
    color: white;
  }
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const DateSeparator = styled.span`
  font-size: 1.4rem;
  color: #94a3b8;
  font-weight: 300;
`;

const DatePickerWrapper = styled.div`
  flex: 1;
  max-width: 180px;
`;

// 실시간 글자 수 + 에러
const FooterText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
`;

const CharCount = styled.span`
  color: #64748b;
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-weight: 500;
`;

const SubmitButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
`;

export default function GroupCreate() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const initialName = state?.name || "";

  const [name, setName] = useState(initialName);
  const [groupImage, setGroupImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [members, setMembers] = useState([{ name: "", email: "" }]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [description, setDescription] = useState("");
  const [descError, setDescError] = useState("");
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (description.length > 30) {
      setDescError("30자 이내로 입력해주세요");
    } else {
      setDescError("");
    }
  }, [description]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGroupImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addMember = () => setMembers([...members, { name: "", email: "" }]);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return alert("여행명을 입력하세요.");
    if (!startDate || !endDate) return alert("여행 기간을 선택하세요.");
    if (startDate > endDate) return alert("가는 날은 오는 날보다 이전이어야 합니다.");
    if (description.length > 30) return;

    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    const membersData = [
      { email: userEmail, role: "owner" },
      ...members
        .filter((m) => m.email.trim())
        .map((m) => ({ email: m.email.trim(), role: "member" })),
    ];

    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) formData.append("groupImage", imageFile);
    formData.append("startDate", startDate.toISOString().split("T")[0]);
    formData.append("endDate", endDate.toISOString().split("T")[0]);
    formData.append("description", description);
    formData.append("members", JSON.stringify(membersData));

    try {
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "모임 생성 실패");

      alert("모임이 성공적으로 생성되었습니다!");
      navigate("/groups", { state: { newTrip: data.data } });
    } catch (err) {
      console.error(err);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <PageWrapper>
      <LeftSection>
        <ImageUploadWrapper>
          {groupImage ? (
            <ImagePreview src={groupImage} alt="여행 대표 이미지" />
          ) : (
            <Placeholder>
              <PlaceholderText>YeoBi</PlaceholderText>
            </Placeholder>
          )}
          <HiddenInput
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="group-image-upload"
          />
          <UploadLabel htmlFor="group-image-upload">
            {groupImage ? "이미지 변경" : "대표 이미지 추가"}
          </UploadLabel>
        </ImageUploadWrapper>
      </LeftSection>

      <RightSection>
        <Section>
          <SectionTitle>여행명</SectionTitle>
          <CommonInput
            type="text"
            placeholder="자동으로 입력되지 않은 경우 직접 입력해 주세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Section>

        <Section>
          <SectionTitle>여행원</SectionTitle>
          {members.map((member, index) => (
            <MemberRow key={index}>
              <CommonInput
                type="text"
                placeholder="이름"
                value={member.name}
                onChange={(e) => handleMemberChange(index, "name", e.target.value)}
              />
              <CommonInput
                type="email"
                placeholder="이메일"
                value={member.email}
                onChange={(e) => handleMemberChange(index, "email", e.target.value)}
              />
              {members.length > 1 && (
                <RemoveButton onClick={() => removeMember(index)}>삭제</RemoveButton>
              )}
            </MemberRow>
          ))}
          <div style={{ marginTop: "0.75rem" }}>
            <AddMemberButton onClick={addMember}>＋ 여행원 추가하기</AddMemberButton>
          </div>
        </Section>

        <Section>
          <SectionTitle>여행 기간</SectionTitle>
          <DateRow>
            <DatePickerWrapper>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy년 MM월 dd일"
                locale={ko}
                placeholderText="가는 날 선택"
                customInput={<CommonInput />}
              />
            </DatePickerWrapper>
            <DateSeparator>~</DateSeparator>
            <DatePickerWrapper>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="yyyy년 MM월 dd일"
                locale={ko}
                placeholderText="오는 날 선택"
                customInput={<CommonInput />}
              />
            </DatePickerWrapper>
          </DateRow>
        </Section>

        <Section>
          <SectionTitle>모임 한 줄 설명</SectionTitle>
          <CommonTextarea
            placeholder="30자 이내로 입력해주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={31}
            rows={3}
          />
          <FooterText>
            <CharCount>{description.length} / 30</CharCount>
            {descError && <ErrorText>{descError}</ErrorText>}
          </FooterText>
        </Section>

        <SubmitButtonWrapper>
          <Button text="모임 만들기" onClick={handleSubmit} style={{ width: "100%", maxWidth: "420px" }} />
        </SubmitButtonWrapper>
      </RightSection>
    </PageWrapper>
  );
}