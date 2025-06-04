import React, { useState } from 'react';
import { Student } from '../../types';
import axios from 'axios';

interface LoginPageProps {
  setCurrentStudent: (student: Student) => void;
  setCurrentPage: (page: string) => void;
}

interface StudentNameResponse {
  Student_ID: string;
  Student_Name: string;
  Grade: number;
  Pwd: string;
}

const LoginPage = ({ setCurrentStudent, setCurrentPage }: LoginPageProps) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [studentInfo, setStudentInfo] = useState<StudentNameResponse | null>(null);

    const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '');
      const formattedValue = value.length > 0 ? `010-${value.slice(0, 4)}${value.length > 4 ? '-' + value.slice(4, 8) : ''}` : '';
      setPhone(value);
      
      if (value.length === 8) {
        setLoading(true);
        try {
          const apiUrl = `${process.env.REACT_APP_API_URL || 'https://port-0-sbon-system-backend-mbhiy4va1af0e6e0.sel4.cloudtype.app'}/api/student/name/${formattedValue}`;
          const response = await axios.get<StudentNameResponse>(apiUrl);

          


          alert(response.data.Student_Name);

          setStudentName(response.data.Student_Name);
          setStudentInfo(response.data);
        } catch (error: unknown) {
          setStudentName('');
          setStudentInfo(null);
          
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            alert('등록된 핸드폰 번호가 없습니다.');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setStudentName('');
        setStudentInfo(null);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!phone || phone.length !== 8) {
        alert('올바른 전화번호를 입력해주세요.');
        return;
      }

      if (!password) {
        alert('비밀번호를 입력해주세요.');
        return;
      }

      if (!studentInfo) {
        alert('전화번호를 입력하고 학생 정보를 확인해주세요.');
        return;
      }
      
      setLoading(true);
      
      try {
        if (password !== studentInfo.Pwd) {
          alert('비밀번호가 일치하지 않습니다.');
          return;
        }

        const studentData: Student = {
          Student_ID: studentInfo.Student_ID,
          Student_Name: studentInfo.Student_Name,
          Grade: studentInfo.Grade.toString(),
          Pwd: studentInfo.Pwd,
          phone: phone,
          class: '',
          number: ''
        };

        setCurrentStudent(studentData);
        setCurrentPage('menu');
      } catch (error) {
        alert('로그인 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-primary">
        <div className="card shadow-lg" style={{ maxWidth: '400px', width: '90%' }}>
          <div className="card-header bg-white text-center py-4">
            <h2 className="text-primary mb-0">
              <span role="img" aria-label="학교">🏫</span> SBON
            </h2>
            <p className="text-muted mt-2">외출/외박 신청 시스템</p>
          </div>
          <div className="card-body p-4">
            <div className="mb-3">
              <label className="form-label fw-bold">전화번호</label>
              <div className="d-flex align-items-center gap-2">
                <div className="input-group">
                  <span className="input-group-text" style={{ fontSize: '1rem' }}>010-</span>
                  <input
                    type="tel"
                    className="form-control form-control-lg"
                    placeholder="0000-0000"
                    value={phone.length > 0 ? `${phone.slice(0, 4)}${phone.length > 4 ? '-' + phone.slice(4, 8) : ''}` : ''}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    maxLength={9}
                  />
                </div>
                {loading ? (
                  <span className="spinner-border spinner-border-sm text-primary"></span>
                ) : studentName && (
                  <span className="badge bg-info text-white p-2" style={{ fontSize: '1rem' }}>
                    {studentName}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">비밀번호</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>
            <button
              className="btn btn-primary btn-lg w-100"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  로그인 중...
                </>
              ) : '로그인'}
            </button>
            <div className="mt-3 text-center">
              <small className="text-muted">
                테스트용 번호: 010-1234-5678
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default LoginPage;