import React, { useState, useEffect } from 'react';
import { Student, StayRequest, StayReason } from '../../types';
import axios from 'axios';

interface StayRegisterPageProps {
  currentStudent: Student | null;
  setCurrentPage: (page: string) => void;
  setStayRequests: React.Dispatch<React.SetStateAction<StayRequest[]>>;
}

const StayRegisterPage: React.FC<StayRegisterPageProps> = ({ 
  currentStudent, 
  setCurrentPage, 
  setStayRequests 
}) => {
    
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
  
  const [formData, setFormData] = useState({
      date: today,
      time: currentTime,
      returnDate: '',
      returnTime: '',
      reason: '',
      otherReason: ''
    });

    const [stayReasons, setStayReasons] = useState<StayReason[]>([]);

    useEffect(() => {
      const fetchStayReasons = async () => {
        try {
          const response = await axios.get<StayReason[]>('https://port-0-sbon-system-backend-mbhiy4va1af0e6e0.sel4.cloudtype.app/api/stay/reasons');
          setStayReasons(response.data);
        } catch (error) {
          console.error('외박사유 데이터 조회 실패:', error);
        }
      };

      fetchStayReasons();
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


    const handleSubmit = async () => {
      if (!formData.date || !formData.time || !formData.returnDate || !formData.returnTime || !formData.reason) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }

      if (!currentStudent?.Student_ID) {
        alert('학생 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      try {
        const requestData = {
          studentId: currentStudent.Student_ID,
          date: formData.date,
          time: formData.time,
          returnDate: formData.returnDate,
          returnTime: formData.returnTime,
          reason: formData.reason,
          otherReason: formData.otherReason
        };

        await axios.post('https://port-0-sbon-system-backend-mbhiy4va1af0e6e0.sel4.cloudtype.app/api/stay/register', requestData);

        const newRequest: StayRequest = {
          id: Date.now().toString(),
          studentId: currentStudent.Student_ID,
          ...formData,
          status: 'pending',
          actualReturnDate: undefined,
          actualReturnTime: undefined,
          note: '',
          seq: 0
        };

        setStayRequests(prev => [...prev, newRequest]);
        alert('외박 신청이 완료되었습니다.');
        setCurrentPage('menu');
      } catch (error) {
        console.error('외박 신청 실패:', error);
        alert('외박 신청 중 오류가 발생했습니다.');
      }
    };

    return (
      <div className="container-fluid vh-100 bg-light">
        <div className="bg-warning text-dark p-3 d-flex align-items-center">
          <button 
            className="btn btn-outline-dark me-3"
            onClick={() => setCurrentPage('menu')}
          >
            ←
          </button>
          <h4 className="mb-0">외박 신청</h4>
        </div>

        <div className="p-4">
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">학생 정보</h6>
              <p className="mb-0">{currentStudent?.Student_Name} ({currentStudent?.Grade}학년)</p>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-6">
              <label className="form-label fw-bold">외박일자 *</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="col-6">
              <label className="form-label fw-bold">외박시간 *</label>
              <input
                type="time"
                className="form-control"
                value={formData.time}
                onChange={(e) => handleTimeChange(e, 'time')}
                step="600"
              />
            </div>

            <div className="col-6">
              <label className="form-label fw-bold">복귀예정일자 *</label>
              <input
                type="date"
                className="form-control"
                value={formData.returnDate}
                onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
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
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">외박사유 *</label>
              <select
                className="form-select"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              >
                <option value="">선택해주세요</option>
                {stayReasons.map(reason => (
                  <option key={reason.SysDtl_Cd} value={reason.SysDtl_Cd}>
                    {reason.SysDtl_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">기타외박사유</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="기타 사유가 있으면 입력해주세요"
                value={formData.otherReason}
                onChange={(e) => setFormData({...formData, otherReason: e.target.value})}
              />
            </div>

            <div className="col-12 mt-4">
              <button
                className="btn btn-warning btn-lg w-100"
                onClick={handleSubmit}
              >
                신청하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default StayRegisterPage;