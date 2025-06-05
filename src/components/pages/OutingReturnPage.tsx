import React, { useState, useEffect, useCallback } from 'react';
import { Student, OutingRequest } from '../../types';
import axios from 'axios';

// API 엔드포인트 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://port-0-sbon-system-backend-mbhiy4va1af0e6e0.sel4.cloudtype.app';

interface OutingReturnResponse {
  message: string;
  data: {
    Out_Dt: string;
    Out_Time: string;
    Out_Reason: string;
  };
}

interface OutingListResponse {
  Seq: string;
  Out_Dt: string;
  Out_Time: string;
  Out_Reason: string;
  Return_Time?: string;
}

interface OutingReturnPageProps {
  currentStudent: Student | null;
  setCurrentPage: (page: string) => void;
  outingRequests: OutingRequest[];
  setOutingRequests: React.Dispatch<React.SetStateAction<OutingRequest[]>>;
}

const OutingReturnPage: React.FC<OutingReturnPageProps> = ({ 
  currentStudent, 
  setCurrentPage, 
  outingRequests, 
  setOutingRequests 
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OutingRequest | null>(null);
  const [returnType, setReturnType] = useState('복귀');
  const [returnNote, setReturnNote] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 외출 내역 가져오기
  const fetchOutingList = useCallback(async () => {
    if (!currentStudent?.Student_ID) {
      console.log('학생 ID가 없어 외출 내역을 가져올 수 없습니다.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get<OutingListResponse[]>(`${API_BASE_URL}/api/outing/list/${currentStudent.Student_ID}`);

      if (!response.data || response.data.length === 0) {
        console.log('외출 내역이 없습니다.');
        setOutingRequests([]);
        return;
      }

      const formattedRequests = response.data.map(item => ({
        id: `${item.Out_Dt}_${item.Out_Time}`,
        studentId: currentStudent.Student_ID,
        date: item.Out_Dt,
        time: item.Out_Time,
        returnTime: '',
        reason1: item.Out_Reason,
        reason2: '',
        otherReason: '',
        status: 'pending' as const,
        seq: Number(item.Seq),
        actualReturnTime: item.Return_Time || undefined,
        reason1_Name: '',
        reason2_Name: ''
      }));

      setOutingRequests(formattedRequests);
    } catch (error) {
      console.error('외출 내역 조회 실패:', error);
      setErrorMessage('외출 내역을 가져오는데 실패했습니다.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [currentStudent?.Student_ID, setOutingRequests]);

  useEffect(() => {
    if (!currentStudent) {
      setErrorMessage('로그인이 필요합니다.');
      setShowErrorModal(true);
      setCurrentPage('login');
      return;
    }

    fetchOutingList();
  }, [currentStudent, setCurrentPage, fetchOutingList]);

  const handleReturn = async () => {
    if (!selectedRequest || !currentStudent?.Student_ID) {
      setErrorMessage('외출 정보를 찾을 수 없습니다.');
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        outDate: selectedRequest.date,
        seq: selectedRequest.seq,
        returnType,
        returnNote
      };

      const response = await axios.post<OutingReturnResponse>(
        `${API_BASE_URL}/api/outing/return`,
        requestData
      );

      if (response.data.message) {
        setOutingRequests(prev => 
          prev.map(request => 
            request.id === selectedRequest.id 
              ? { ...request, status: 'completed' } 
              : request
          )
        );

        setShowSuccessModal(true);
        setSelectedRequest(null);
        setReturnType('복귀');
        setReturnNote('');
      }
    } catch (error) {
      console.error('외출 복귀 처리 오류:', error);
      setErrorMessage('외출 복귀 처리 중 오류가 발생했습니다.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // 외출 내역 필터링 (현재 학생의 외출 내역만)
  const filteredRequests = outingRequests.filter(
    request => request.studentId === currentStudent?.Student_ID
  );

  return (
    <div className="container-fluid vh-100 bg-light">
      <div className="bg-primary text-white p-3 d-flex align-items-center">
        <button 
          className="btn btn-outline-light me-3"
          onClick={() => setCurrentPage('menu')}
        >
          ←
        </button>
        <h4 className="mb-0">외출 복귀</h4>
      </div>

      <div className="p-4">
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">학생 정보</h6>
            <p className="mb-0">{currentStudent?.Student_Name} ({currentStudent?.Grade}학년)</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th style={{ width: '25%' }}>외출일자</th>
                <th style={{ width: '20%' }}>외출시간</th>
                <th style={{ width: '40%' }}>외출사유</th>
                <th style={{ width: '15%' }}>처리</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.date}</td>
                  <td>{request.time}</td>
                  <td className="text-break text-truncate" style={{ maxWidth: '200px' }}>{request.reason1}</td>
                  <td>
                    {request.status === 'pending' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setReturnType('복귀');
                          setReturnNote('');
                        }}
                        disabled={loading}
                      >
                        복귀
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    외출 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedRequest && (
          <div className="modal fade show d-flex align-items-center justify-content-center" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-sm" style={{ maxWidth: '300px', margin: '0' }}>
              <div className="modal-content" style={{ 
                boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                border: 'none'
              }}>
                <div className="modal-body pt-4">
                  <div className="mb-3">
                    <label className="form-label">복귀유형</label>
                    <select
                      className="form-select"
                      value={returnType}
                      onChange={(e) => setReturnType(e.target.value)}
                    >
                      <option value="복귀">복귀</option>
                      <option value="외박">외박</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">비고</label>
                    <input
                      type="text"
                      className="form-control"
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      placeholder="비고를 입력해주세요"
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedRequest(null);
                        setReturnType('복귀');
                        setReturnNote('');
                      }}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleReturn}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          처리 중...
                        </>
                      ) : '확인'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 성공 모달 */}
        <div className={`modal fade ${showSuccessModal ? 'show' : ''}`} 
             style={{ display: showSuccessModal ? 'block' : 'none' }} 
             tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">복귀 처리 완료</h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentPage('menu');
                }}></button>
              </div>
              <div className="modal-body text-center">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3 mb-0" style={{ fontSize: '1.2rem' }}>외출 복귀 처리가 완료되었습니다.</p>
                <p className="text-muted mt-2">메뉴 페이지로 이동합니다.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentPage('menu');
                }}>
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
        {showSuccessModal && <div className="modal-backdrop fade show"></div>}

        {/* 에러 모달 */}
        <div className={`modal fade ${showErrorModal ? 'show' : ''}`} 
             style={{ display: showErrorModal ? 'block' : 'none' }} 
             tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">오류 발생</h5>
                <button type="button" className="btn-close" onClick={() => setShowErrorModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <i className="bi bi-exclamation-circle-fill text-danger" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3 mb-0" style={{ fontSize: '1.2rem' }}>{errorMessage}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowErrorModal(false)}>
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
        {showErrorModal && <div className="modal-backdrop fade show"></div>}
      </div>
    </div>
  );
};

export default OutingReturnPage;