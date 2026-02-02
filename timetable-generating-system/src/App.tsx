import { useState } from 'react';
import { StudentLandingPage } from './components/StudentLandingPage';
import { OfficerLoginPage } from './components/OfficerLoginPage';
import { SchoolOfficerDashboard } from './components/SchoolOfficerDashboard';
import { DepartmentOfficerDashboard } from './components/DepartmentOfficerDashboard';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentView, setCurrentView] = useState('student');
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const handleOfficerLogin = (email, role) => {
    setUserEmail(email);
    setUserRole(role);
    setCurrentView('officer-dashboard');
  };

  const handleLogout = () => {
    setCurrentView('student');
    setUserEmail(null);
    setUserRole(null);
  };

  const handleGoToOfficerLogin = () => {
    setCurrentView('officer-login');
  };

  const handleBackToStudent = () => {
    setCurrentView('student');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      
      {currentView === 'student' && (
        <StudentLandingPage onOfficerLoginClick={handleGoToOfficerLogin} />
      )}
      
      {currentView === 'officer-login' && (
        <OfficerLoginPage 
          onLogin={handleOfficerLogin}
          onBackToHome={handleBackToStudent}
        />
      )}
      
      {currentView === 'officer-dashboard' && userRole === 'school-officer' && (
        <SchoolOfficerDashboard 
          userEmail={userEmail} 
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'officer-dashboard' && userRole === 'department-officer' && (
        <DepartmentOfficerDashboard 
          userEmail={userEmail} 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}