import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Button from './Button';
import ReceiptOutlineImage from '../assets/famicons_receipt-outline.png'; 
import { API_BASE_URL } from "../config";

// [1] UUID 생성 함수
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const CloseIcon = () => ( <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13 1L1 13M1 1L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );

const ReceiptModal = ({ 
  isOpen = true, 
  onClose, 
  onSave, 
  expenseId, 
  receiptImgData 
}) => {
  
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  // 조회 모드 초기화
  useEffect(() => {
    if (receiptImgData) {
      setPreviewUrl(receiptImgData);
    }
  }, [receiptImgData]);

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
    if (previewUrl) setIsZoomed(true);
    else handleUploadClick();
  };

  const handleConfirm = async () => {
    // 1. [3번 로직] 지출 ID가 없으면 (지출 생성 중) -> 파일만 부모에게 전달
    if (!expenseId) {
      if (receiptFile) {
        onSave(receiptFile); 
        onClose();
      } else {
        alert("이미지를 선택하거나 취소해주세요.");
      }
      return;
    }

    // 2. 지출 ID가 있으면 (수정/조회 중) -> 직접 API 호출
    if (!receiptFile) return alert('파일을 선택해주세요.');
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', receiptFile);
      const token = localStorage.getItem('accessToken');
      
      // [1] Idempotency-Key 생성
      const idempotencyKey = generateUUID();

      // [2] 경로 수정 및 헤더 추가
      const response = await axios.post(
        `${API_BASE_URL}/expenses/${expenseId}/receipts`, 
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data', 
            'Authorization': `Bearer ${token}`,
            'Idempotency-Key': idempotencyKey 
          } 
        }
      );

      if (response.data.code === 'SU') {
        alert('영수증이 등록되었습니다.');
        onSave?.(); 
        onClose();
      } else {
        alert(response.data.message || "업로드 실패");
      }
    } catch (e) {
      console.error(e);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isZoomed && previewUrl && (
        <ZoomOverlay onClick={() => setIsZoomed(false)}>
          <ZoomedImage src={previewUrl} onClick={(e) => e.stopPropagation()} />
        </ZoomOverlay>
      )}

      <Overlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <Header>
            <CloseButton onClick={onClose}><CloseIcon /></CloseButton>
          </Header>
          <Body>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                <Button 
                  text={previewUrl ? "이미지 변경하기" : "+ 파일 업로드"} 
                  variant="primary" 
                  onClick={handleUploadClick} 
                  style={{ width: '100%' }} 
                />
            </div>
            <ImagePreviewContainer onClick={handleImageClick}>
                {previewUrl ? <StyledReceiptImage src={previewUrl} /> : <PlaceholderIcon src={ReceiptOutlineImage} />}
            </ImagePreviewContainer>
            <Footer>
              <Button 
                text={!expenseId ? "확인 (선택 완료)" : (isLoading ? "업로드 중..." : "저장")} 
                variant="primary" 
                onClick={handleConfirm} 
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

// --- Styled Components ---
const Overlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; `;
const ModalContainer = styled.div` background-color: white; width: 400px; min-height: 400px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; position: relative; `;
const Header = styled.div` background-color: #548BF4; height: 48px; display: flex; align-items: center; justify-content: flex-end; padding: 0 16px; flex-shrink: 0; `;
const CloseButton = styled.button` background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; `;
const Body = styled.div` padding: 24px; display: flex; flex-direction: column; gap: 20px; flex: 1; `;
const ImagePreviewContainer = styled.div` width: 100%; height: 300px; background-color: #F8F9FA; border: 1px dashed #E0E0E0; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden; cursor: pointer; position: relative; &:hover { background-color: #F0F2F5; } `;
const StyledReceiptImage = styled.img` max-width: 100%; max-height: 100%; object-fit: contain; display: block; `;
const PlaceholderIcon = styled.img` width: 60px; opacity: 0.5; `;
const Footer = styled.div` display: flex; justify-content: flex-end; width: 100%; margin-top: auto; `;
const ZoomOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.9); display: flex; justify-content: center; align-items: center; z-index: 2000; cursor: zoom-out; `;
const ZoomedImage = styled.img` max-width: 95%; max-height: 95%; object-fit: contain; `;