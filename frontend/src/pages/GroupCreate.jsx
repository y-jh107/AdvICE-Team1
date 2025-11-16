import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import styled from "styled-components";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { API_BASE_URL } from "../config";

// === 스타일 컴포넌트 ===
const PageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 6rem 2rem 2rem;
  gap: 5rem;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    padding: 5rem 1rem 1rem;
    gap: 2rem;
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
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.25rem;
`;

const Placeholder = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background-color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
`;

const PlaceholderText = styled.span`
  color: white;
  font-size: 3rem;
  font-weight: bold;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadLabel = styled.label`
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const RightSection = styled.div`
  flex: 1;
  min-width: 500px;
  max-width: 600px;
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
  margin: 0 0 0.5rem 0;
  color: #444;
  font-weight: normal;
  text-align: left;
`;

const MemberRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
`;

const MemberInput = styled(InputField)`
  flex: 1;
  font-size: 0.875rem;
`;

const RemoveButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.375rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const AddMemberButton = styled(Button)`
  background-color: #007bff;
  padding: 0.5rem 1.2rem;
  font-size: 0.875rem;
  margin-top: 0.8rem;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DateSeparator = styled.span`
  font-size: 1.125rem;
  color: #666;
`;

const DateInputWrapper = styled.div`
  input {
    width: 140px;
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 80px;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-size: 0.9375rem;
  font-family: inherit;
`;

const CharCount = styled.div`
  font-size: 0.75rem;
  color: #666;
  text-align: right;
  margin-top: 0.25rem;
`;

const ErrorText = styled.span`
  color: #dc3545;
  margin-left: 0.5rem;
`;

// === 메인 컴포넌트 ===
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

  // 설명 30자 제한
  useEffect(() => {
    if (description.length > 30) {
      setDescError("모임 설명은 30자 이내로 입력해주세요.");
    } else {
      setDescError("");
    }
  }, [description]);

  // 이미지 업로드
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGroupImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 여행원 관리
  const addMember = () => setMembers([...members, { name: "", email: "" }]);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  // 제출
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

    // ✅ members → email + role만 포함해서 전송
    const membersData = [
        ...(userEmail ? [{ email: userEmail, role: "owner" }] : []),
      ...members
        .filter((m) => m.email.trim())
        .map((m) => ({
          email: m.email.trim(),
          role: "member",
        })),
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
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "모임 생성 실패");
        return;
      }

      alert("모임 생성 성공!");
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
              <PlaceholderText>G</PlaceholderText>
            </Placeholder>
          )}
          <HiddenInput
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="group-image-upload"
          />
          <UploadLabel htmlFor="group-image-upload">추가하기</UploadLabel>
        </ImageUploadWrapper>
      </LeftSection>

      <RightSection>
        <Section>
          <SectionTitle>여행명</SectionTitle>
          <InputField
            type="text"
            placeholder="여행명을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Section>

        <Section>
          <SectionTitle>여행원</SectionTitle>
          {members.map((member, index) => (
            <MemberRow key={index}>
              <MemberInput
                type="text"
                placeholder="이름"
                value={member.name}
                onChange={(e) =>
                  handleMemberChange(index, "name", e.target.value)
                }
              />
              <MemberInput
                type="email"
                placeholder="이메일"
                value={member.email}
                onChange={(e) =>
                  handleMemberChange(index, "email", e.target.value)
                }
              />
              {members.length > 1 && (
                <RemoveButton type="button" onClick={() => removeMember(index)}>
                  삭제
                </RemoveButton>
              )}
            </MemberRow>
          ))}
          <AddMemberButton text="추가하기" onClick={addMember} />
        </Section>

        <Section>
          <SectionTitle>여행 기간</SectionTitle>
          <DateRow>
            <DateInputWrapper>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                placeholderText="가는 날"
                customInput={<input />}
              />
            </DateInputWrapper>
            <DateSeparator>~</DateSeparator>
            <DateInputWrapper>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                placeholderText="오는 날"
                customInput={<input />}
              />
            </DateInputWrapper>
          </DateRow>
        </Section>

        <Section>
          <SectionTitle>모임 설명</SectionTitle>
          <Textarea
            placeholder="30자 이내로 입력"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={31}
          />
          <CharCount>
            {description.length}/30
            {descError && <ErrorText>{descError}</ErrorText>}
          </CharCount>
        </Section>

        <Button text="저장" onClick={handleSubmit} />
      </RightSection>
    </PageWrapper>
  );
}
