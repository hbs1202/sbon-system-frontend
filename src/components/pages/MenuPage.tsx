import React from 'react';
import { Student } from '../../types';

interface MenuPageProps {
  currentStudent: Student | null;
  setCurrentStudent: (student: Student | null) => void;
  setCurrentPage: (page: string) => void;
}

const MenuPage = ({ currentStudent, setCurrentStudent, setCurrentPage }: MenuPageProps) => {
    const menuItems = [
      { id: 'outing-register', title: '외출 신청', icon: '🚶‍♂️', label: '걷는 사람', color: 'primary' },
      { id: 'outing-return', title: '외출 복귀', icon: '🏠', label: '집', color: 'success' },
      { id: 'stay-register', title: '외박 신청', icon: '🌙', label: '달', color: 'warning' },
      { id: 'stay-return', title: '외박 복귀', icon: '☀️', label: '태양', color: 'info' }
    ];

    return (
      <div className="container-fluid vh-100 bg-light">
        <div className="row h-100">
          <div className="col-12">
            <div className="bg-primary text-white p-4 text-center">
              <h3 className="mb-1">안녕하세요, {currentStudent?.Student_Name}님</h3>
              <p className="mb-0 opacity-75">{currentStudent?.Grade}학년</p>
            </div>
            
            <div className="p-4">
              <div className="row g-3">
                {menuItems.map(item => (
                  <div key={item.id} className="col-6">
                    <button
                      className={`btn btn-${item.color} w-100 h-100 py-4 border-0 shadow-sm`}
                      style={{ minHeight: '120px' }}
                      onClick={() => setCurrentPage(item.id)}
                    >
                      <div className="fs-1 mb-2">
                        <span role="img" aria-label={item.label} className="d-inline-block">{item.icon}</span>
                      </div>
                      <div className="fw-bold">{item.title}</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="position-fixed bottom-0 start-0 end-0 p-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setCurrentStudent(null);
                  setCurrentPage('login');
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default MenuPage;