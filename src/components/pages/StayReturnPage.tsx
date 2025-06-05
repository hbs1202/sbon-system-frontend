import React, { useState, useEffect } from 'react';
import { Student, StayRequest, ServerStayRequest } from '../../types';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://port-0-sbon-system-backend-mbhiy4va1af0e6e0.sel4.cloudtype.app';

interface StayReturnPageProps {
  currentStudent: Student | null;
  stayRequests: StayRequest[];
  setStayRequests: React.Dispatch<React.SetStateAction<StayRequest[]>>;
  setCurrentPage: (page: string) => void;
}

const StayReturnPage: React.FC<StayReturnPageProps> = ({ 
  currentStudent, 
  stayRequests, 
  setStayRequests, 
  setCurrentPage 
}) => {
    const [selectedRequest, setSelectedRequest] = useState<StayRequest | null>(null);
    const [returnType, setReturnType] = useState('NORMAL');
    const [returnNote, setReturnNote] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // 외박 목록 가져오기
    useEffect(() => {
      const fetchStayList = async () => {
        if (!currentStudent?.Student_ID) {
          console.log('학생 정보가 없습니다.');
          return;
        }
        
        try {
          console.log('외박 목록 조회 시작:', currentStudent.Student_ID);
          const response = await axios.get(`${API_URL}/api/stay/list/${currentStudent.Student_ID}`);
          console.log('외박 목록 조회 결과:', response.data);
          setStayRequests(response.data);
        } catch (error) {
          console.error('외박 목록 조회 실패:', error);
        }
      };

      console.log('useEffect 실행, currentStudent:', currentStudent);
      fetchStayList();
    }, [currentStudent, setStayRequests]);

    console.log('전체 stayRequests:', stayRequests);
    const pendingRequests = (stayRequests as unknown as ServerStayRequest[]).map(req => ({
      id: req.Seq.toString(),
      studentId: currentStudent?.Student_ID || '',
      date: req.SleepOut_Dt,
      time: '',
      returnDate: req.Return_Date,
      returnTime: '',
      reason: req.SleepOut_Reason,
      otherReason: '',
      status: 'pending',
      actualReturnDate: undefined,
      actualReturnTime: undefined,
      note: '',
      seq: req.Seq
    })).filter(req => {
      // Return_Date가 오늘 이후인 경우만 표시
      const today = new Date().toISOString().split('T')[0];
      return req.returnDate >= today;
    });
    console.log('필터링된 pendingRequests:', pendingRequests);

    const handleReturn = async (request: StayRequest) => {
      setSelectedRequest(request);
    };

    const handleReturnSubmit = async () => {
      if (!selectedRequest) return;

      setLoading(true);
      try {
        const requestData = {
          sleepOut_dt: selectedRequest.date,
          seq: selectedRequest.seq,
          returnType,
          returnNote
        };

        await axios.post(`${API_URL}/api/stay/return`, requestData);

        setStayRequests(prev => 
          prev.map(req => 
            req.id === selectedRequest.id 
              ? { 
                  ...req, 
                  status: 'completed' as const,
                  actualReturnDate: selectedRequest.returnDate,
                  actualReturnTime: selectedRequest.returnTime
                }
              : req
          )
        );

        setShowSuccessModal(true);
        setSelectedRequest(null);
        setReturnType('NORMAL');
        setReturnNote('');
      } catch (error) {
        console.error('외박 복귀 처리 실패:', error);
        setErrorMessage('외박 복귀 처리 중 오류가 발생했습니다.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="container-fluid vh-100 bg-light">
        <div className="bg-info text-white p-3 d-flex align-items-center">
          <button 
            className="btn btn-outline-light me-3"
            onClick={() => setCurrentPage('menu')}
          >
            ←
          </button>
          <h4 className="mb-0">외박 복귀</h4>
        </div>

        <div className="p-4">
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">학생 정보</h6>
              <p className="mb-0">{currentStudent?.Student_Name} ({currentStudent?.Grade}학년)</p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 mb-3">
                <span role="img" aria-label="달">🌙</span>
              </div>
              <h5>복귀 처리할 외박 신청이 없습니다</h5>
              <p className="text-muted">먼저 외박을 신청해주세요.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '25%' }}>외박일자</th>
                    <th style={{ width: '25%' }}>복귀일자</th>
                    <th style={{ width: '35%' }}>외박사유</th>
                    <th style={{ width: '15%' }}>처리</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(req => (
                    <tr key={req.id}>
                      <td>{req.date}</td>
                      <td>{req.returnDate}</td>
                      <td>{req.reason}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleReturn(req)}
                        >
                          복귀
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 복귀 모달 */}
        {selectedRequest && (
          <div className="modal fade show d-flex align-items-center justify-content-center" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-sm" style={{ maxWidth: '300px', margin: '0' }}>
              <div className="modal-content" style={{ 
                boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                border: 'none'
              }}>
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">외박 복귀 처리</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedRequest(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">복귀 유형</label>
                    <select 
                      className="form-select"
                      value={returnType}
                      onChange={(e) => setReturnType(e.target.value)}
                    >
                      <option value="NORMAL">정상 복귀</option>
                      <option value="LATE">지연 복귀</option>
                      <option value="OTHER">기타</option>
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
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setSelectedRequest(null)}
                  >
                    취소
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-info text-white"
                    onClick={handleReturnSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        처리 중...
                      </>
                    ) : '복귀 처리'}
                  </button>
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
                <p className="mt-3 mb-0" style={{ fontSize: '1.2rem' }}>외박 복귀 처리가 완료되었습니다.</p>
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
    );
  };

export default StayReturnPage;