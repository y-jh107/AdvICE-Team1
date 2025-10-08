import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
`;

const StyledInput = styled.input`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <StyledInput
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </Wrapper>
  );
}
