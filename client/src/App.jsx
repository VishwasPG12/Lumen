import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile'; 

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState('home'); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setView('home');
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-purple-500/30">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#121214',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '16px'
          },
        }}
      />
      
      {!token ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <Navbar 
            onAddClick={() => { setView('home'); setShowAddModal(true); }} 
            onLogout={handleLogout} 
            onProfileClick={() => setView('profile')} 
          />
          
          <main className="max-w-7xl mx-auto p-6">
            {view === 'home' ? (
              <Home 
                token={token} 
                showAddModal={showAddModal} 
                setShowAddModal={setShowAddModal} 
              />
            ) : (
              <Profile 
                token={token} 
                onBack={() => setView('home')} 
                onLogout={handleLogout} 
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;