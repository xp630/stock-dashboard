import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Header } from '@/components/Header/Header';
import { Dashboard } from '@/pages/Dashboard';
import { Watchlist } from '@/pages/Watchlist';
import { Positions } from '@/pages/Positions';
import { Alerts } from '@/pages/Alerts';
import { Settings } from '@/pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'watchlist':
        return <Watchlist />;
      case 'positions':
        return <Positions />;
      case 'alerts':
        return <Alerts />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto tech-grid">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
