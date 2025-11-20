// src/components/ReceiptModal.jsx
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Button from './Button';
import ReceiptOutlineImage from '../assets/famicons_receipt-outline.png'; 

// --- [Helper: UUID 생성] ---
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- [Icons] ---
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 1L1 13M1 1L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- [Styled Components] ---
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  width: 400px; /* 모달 너비 */
  min-height: 400px; /* 최소 높이 확보 */
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  background-color: #548BF4;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
  flex-shrink: 0; /* 헤더 크기 고정 */
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const Body = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1; /* 남은 공간 다 차지 */
`;

// [수정] 이미지를 감싸는 컨테이너 (배경 및 정렬)
const ImagePreviewContainer = styled.div`
  width: 100%;
  height: 300px; /* 이미지 영역 높이 고정 (필요시 수정 가능) */
  background-color: #F8F9FA;
  border: 1px dashed #E0E0E0;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: #F0F2F5;
  }
`;

// [수정] 실제 보여질 이미지 스타일
const StyledReceiptImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 비율 유지하며 컨테이너 안에 맞춤 */
  display: block;
`;

// [추가] 이미지가 없을 때 보여줄 플레이스홀더 아이콘 스타일
const PlaceholderIcon = styled.img`
  width: 60px;
  opacity: 0.5;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: auto; /* 푸터를 바닥으로 밀기 */
`;

// [확대 모달 관련]
const ZoomOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  cursor: zoom-out;
`;

const ZoomedImage = styled.img`
  max-width: 95%;
  max-height: 95%;
  object-fit: contain;
`;

// --- [Component Implementation] ---

const ReceiptModal = ({ isOpen, onClose, onSave, expenseId = '123' }) => {
  
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleImageClick = () => {
    if (previewUrl) {
      setIsZoomed(true);
    } else {
      handleUploadClick();
    }
  };

  const handleSave = async () => {
    if (!receiptFile) {
      alert('업로드할 영수증 파일을 선택해주세요.');
      return;
    }

    setIsLoading(true); 

    try {
      const formData = new FormData();
      formData.append('image', receiptFile); 

      const token = localStorage.getItem('accessToken'); 
      if (!token) {
        alert('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      const idempotencyKey = generateUUID();

      const response = await axios.post(
        `/api/expenses/${expenseId}/receipts`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      const resData = response.data;

      if (resData.code === 'SU') {
        alert(resData.message || '영수증 이미지 업로드 성공!');
        
        if (onSave) {
          onSave({ 
            receiptData: resData.data // 파일 데이터만 전달
          });
        }
        onClose();
      } 
      else {
        alert(`업로드 실패: ${resData.message}`);
      }

    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data;
        if (errData.code === 'TL') {
            alert(`[오류] 파일 용량이 너무 큽니다.\n제한 크기: ${errData.data?.size || '알 수 없음'}`);
        } 
        else if (errData.code === 'UM') {
            alert(`[오류] 지원하지 않는 형식의 파일입니다.\n감지된 형식: ${errData.data?.type || '알 수 없음'}`);
        } else {
            alert(`서버 오류가 발생했습니다. (${errData.message})`);
        }
      } else {
        console.error('Network Error:', error);
        alert('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <>
      {/* 확대 이미지 오버레이 */}
      {isZoomed && previewUrl && (
        <ZoomOverlay onClick={() => setIsZoomed(false)}>
          <ZoomedImage src={previewUrl} alt="Enlarged Receipt" onClick={(e) => e.stopPropagation()} />
        </ZoomOverlay>
      )}

      <Overlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <Header>
            <CloseButton onClick={onClose}>
              <CloseIcon />
            </CloseButton>
          </Header>

          <Body>
            {/* 1. 상단: 파일 업로드 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button 
                  text={previewUrl ? "이미지 변경하기" : "+ 파일 업로드"}
                  variant="primary" 
                  onClick={handleUploadClick}
                  style={{ width: '100%' }}
                />
            </div>

            {/* 2. 중단: 이미지 미리보기 영역 (버튼 아래 위치) */}
            <ImagePreviewContainer onClick={handleImageClick}>
                {previewUrl ? (
                    <StyledReceiptImage src={previewUrl} alt="Receipt Preview" />
                ) : (
                    // 이미지가 없을 땐 기본 아이콘 표시
                    <PlaceholderIcon src={ReceiptOutlineImage} alt="No Image" />
                )}
            </ImagePreviewContainer>
            
            {/* 3. 하단: 저장 버튼 */}
            <Footer>
              <Button 
                text={isLoading ? "저장 중..." : "저장"} 
                variant="primary" 
                onClick={handleSave} 
                disabled={isLoading}
              />
            </Footer>

          </Body>
        </ModalContainer>
      </Overlay>
    </>
  );
};

export default ReceiptModal;