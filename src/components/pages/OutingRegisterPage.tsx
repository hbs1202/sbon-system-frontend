import React, { useState, useEffect } from 'react';
import { Student, OutingRequest } from '../../types';
import axios from 'axios';

interface OutingReason {
  SysDtl_Cd: string;
  SysDtl_Name: string;
}

interface OutingRegisterPageProps {
  currentStudent: Student | null;
  setCurrentPage: (page: string) => void;
  setOutingRequests: React.Dispatch<React.SetStateAction<OutingRequest[]>>;
}

interface FormData {
  date: string;
  time: string;
  returnTime: string;
  reason1: string;
  reason2: string;
  otherReason: string;
  reason1_Name: string;
  reason2_Name: string;
}

const OutingRegisterPage: React.FC<OutingRegisterPageProps> = ({ currentStudent, setCurrentPage, setOutingRequests }) => {
    // 학생 정보가 없으면 로그인 페이지로 리다이렉트
    useEffect(() => {
      if (!currentStudent) {
        alert('로그인이 필요합니다.');
        setCurrentPage('login');
      }
    }, [currentStudent, setCurrentPage]);

    // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
    const today = new Date().toISOString().split('T')[0];
    
    // 현재 시간을 HH:mm 형식으로 가져오기 (10분 단위로 반올림)
    const now = new Date();
    const minutes = Math.round(now.getMinutes() / 10) * 10;
    const roundedTime = new Date(now.setMinutes(minutes));
    const currentTime = `${String(roundedTime.getHours()).padStart(2, '0')}:${String(roundedTime.getMinutes()).padStart(2, '0')}`;

    const [formData, setFormData] = useState<FormData>({
      date: today,
      time: currentTime,
      returnTime: '',
      reason1: '',
      reason2: '',
      otherReason: '',
      reason1_Name: '',
      reason2_Name: ''
    });
    const [loading, setLoading] = useState(false);
    const [outingReasons1, setOutingReasons1] = useState<OutingReason[]>([]);
    const [outingReasons2, setOutingReasons2] = useState<OutingReason[]>([]);

    // 외출사유 데이터 가져오기
    useEffect(() => {
      const fetchOutingReasons = async () => {
        try {
          const response = await axios.get<OutingReason[]>('https://port-0-sbon-system-backend-mbhiy4va1af0e6e0.sel4.cloudtype.app/api/outing/reasons');
          setOutingReasons1(response.data);
          setOutingReasons2(response.data);
        } catch (error) {
          alert('외출사유 데이터를 불러오는데 실패했습니다.');
        }
      };

      fetchOutingReasons();
    }, []);

    // 시간 입력 처리 함수
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'time' | 'returnTime') => {
      const value = e.target.value;
      const [hours, minutes] = value.split(':').map(Number);
      
      // 분을 10분 단위로 반올림
      const roundedMinutes = Math.round(minutes / 10) * 10;
      const formattedTime = `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
      
      setFormData(prev => ({ ...prev, [field]: formattedTime }));

      // 분이 선택되면 input에서 포커스 제거
      if (minutes !== undefined) {
        e.target.blur();
      }
    };

    const handleReason1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCode = e.target.value;
      
      if (!selectedCode) {
        alert('외출사유 1을 선택해주세요.');
        return;
      }

      const selectedReason = outingReasons1.find(reason => reason.SysDtl_Cd === selectedCode);
      
      setFormData({
        ...formData,
        reason1: selectedCode,
        reason1_Name: selectedReason?.SysDtl_Name || ''
      });
    };

    const handleReason2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCode = e.target.value;
      const selectedReason = outingReasons2.find(reason => reason.SysDtl_Cd === selectedCode);
      
      setFormData({
        ...formData,
        reason2: selectedCode,
        reason2_Name: selectedReason?.SysDtl_Name || ''
      });
    };

    const handleSubmit = async () => {
      try {
        if (!formData.date || !formData.time || !formData.returnTime) {
          alert('외출일자, 외출시간, 복귀예정시간을 모두 입력해주세요.');
          return;
        }

        if (!formData.reason1) {
          alert('외출사유 1을 선택해주세요.');
          return;
        }

        if (!currentStudent?.Student_ID) {
          alert('학생 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
          return;
        }

        setLoading(true);

        const requestData = {
          studentId: currentStudent.Student_ID,
          date: formData.date,
          time: formData.time,
          returnTime: formData.returnTime,
          reason1: formData.reason1,
          reason1_Name: outingReasons1.find(reason => reason.SysDtl_Cd === formData.reason1)?.SysDtl_Name || '',
          reason2: formData.reason2,
          reason2_Name: outingReasons2.find(reason => reason.SysDtl_Cd === formData.reason2)?.SysDtl_Name || '',
          otherReason: formData.otherReason
        };

        

        await axios.post('https://port-0-sbon-system-backend-mbhiy4va1af0e6e0.sel4.cloudtype.app/api/outing/register', requestData);

        const newRequest: OutingRequest = {
          id: Date.now().toString(),
          studentId: currentStudent.Student_ID,
          ...formData,
          status: 'pending',
          seq: 0,  // 임시값으로 0 설정
          actualReturnTime: undefined  // 외출 신청 시에는 아직 반납 시간이 없으므로 undefined로 설정
        };

        setOutingRequests(prev => [...prev, newRequest]);
        alert('외출 신청이 완료되었습니다.');
        setCurrentPage('menu');
      } catch (error) {
        alert('외출 신청 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const handleButtonClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    };

    return (
      <div className="container-fluid vh-100 bg-light">
        <div className="bg-primary text-white p-3 d-flex align-items-center">
          <button 
            className="btn btn-outline-light me-3"
            onClick={() => setCurrentPage('menu')}
          >
            ←
          </button>
          <h4 className="mb-0">외출 신청</h4>
        </div>

        <div className="p-4">
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">학생 정보</h6>
              <p className="mb-0">{currentStudent?.Student_Name} ({currentStudent?.Grade}학년)</p>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-bold">외출일자 *</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div className="col-6">
              <label className="form-label fw-bold">외출시간 *</label>
              <input
                type="time"
                className="form-control"
                value={formData.time}
                onChange={(e) => handleTimeChange(e, 'time')}
                step="600"
                required
              />
            </div>

            <div className="col-6">
              <label className="form-label fw-bold">복귀예정시간 *</label>
              <input
                type="time"
                className="form-control"
                value={formData.returnTime}
                onChange={(e) => handleTimeChange(e, 'returnTime')}
                step="600"
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">외출사유 1 *</label>
              <select
                className="form-select"
                value={formData.reason1}
                onChange={handleReason1Change}
                required
              >
                <option value="">선택하세요</option>
                {outingReasons1.map(reason => (
                  <option key={reason.SysDtl_Cd} value={reason.SysDtl_Cd}>
                    {reason.SysDtl_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">외출사유 2</label>
              <select
                className="form-select"
                value={formData.reason2}
                onChange={handleReason2Change}
              >
                <option value="">선택하세요</option>
                {outingReasons2.map(reason => (
                  <option key={reason.SysDtl_Cd} value={reason.SysDtl_Cd}>
                    {reason.SysDtl_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">기타사유</label>
              <input
                type="text"
                className="form-control"
                value={formData.otherReason}
                onChange={(e) => setFormData({...formData, otherReason: e.target.value})}
                placeholder="기타사유를 입력해주세요"
              />
            </div>

            <div className="col-12 mt-4">
              <button
                type="button"
                className="btn btn-primary btn-lg w-100"
                disabled={loading}
                onClick={(e) => {
                  handleButtonClick(e);
                }}
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  border: '2px solid #0056b3',
                  padding: '15px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    신청 중...
                  </>
                ) : '신청하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default OutingRegisterPage;