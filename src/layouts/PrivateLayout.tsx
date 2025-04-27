// src/layouts/PrivateLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const PrivateLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar fixo */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Conteúdo principal */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: !isMobile ? '250px' : '0', // <- AQUI: dar espaço do Sidebar
        transition: 'margin-left 0.3s ease',
      }}>
        {/* Header apenas no mobile */}
        {isMobile && (
          <header style={{
            backgroundColor: '#0b1d40',
            color: '#fff',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}>
            <button
              style={{
                fontSize: '1.5rem',
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <span style={{ fontWeight: 'bold' }}>Painel Administrativo</span>
          </header>
        )}

        {/* Conteúdo privado */}
        <main style={{
          flex: 1,
          padding: '2rem',
          minWidth: '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;