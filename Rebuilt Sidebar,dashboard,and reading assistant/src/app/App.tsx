import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TextToSpeech from './pages/TextToSpeech';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'text-to-speech':
        return <TextToSpeech />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FEFEFE]">
      <Sidebar activeItem={activePage} onNavigate={setActivePage} />
      {renderPage()}
    </div>
  );
}