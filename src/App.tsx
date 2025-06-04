import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LoginPage from './components/pages/LoginPage';
import MenuPage from './components/pages/MenuPage';
import OutingRegisterPage from './components/pages/OutingRegisterPage';
import OutingReturnPage from './components/pages/OutingReturnPage';
import StayRegisterPage from './components/pages/StayRegisterPage';
import StayReturnPage from './components/pages/StayReturnPage';
import { Student, OutingRequest, StayRequest } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [outingRequests, setOutingRequests] = useState<OutingRequest[]>([]);
  const [stayRequests, setStayRequests] = useState<StayRequest[]>([]);

  // 로그인 상태가 아니면 항상 로그인 페이지로 리다이렉트
  if (!currentStudent && currentPage !== 'login') {
    setCurrentPage('login');
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage setCurrentStudent={setCurrentStudent} setCurrentPage={setCurrentPage} />;
      case 'menu':
        return <MenuPage currentStudent={currentStudent} setCurrentStudent={setCurrentStudent} setCurrentPage={setCurrentPage} />;
      case 'outing-register':
        return <OutingRegisterPage currentStudent={currentStudent} setCurrentPage={setCurrentPage} setOutingRequests={setOutingRequests} />;
      case 'outing-return':
        return <OutingReturnPage currentStudent={currentStudent} setCurrentPage={setCurrentPage} outingRequests={outingRequests} setOutingRequests={setOutingRequests} />;
      case 'stay-register':
        return <StayRegisterPage currentStudent={currentStudent} setCurrentPage={setCurrentPage} setStayRequests={setStayRequests} />;
      case 'stay-return':
        return <StayReturnPage currentStudent={currentStudent} setCurrentPage={setCurrentPage} stayRequests={stayRequests} setStayRequests={setStayRequests} />;
      default:
        return <LoginPage setCurrentStudent={setCurrentStudent} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      {renderCurrentPage()}
    </div>
  );
};

export default App; 