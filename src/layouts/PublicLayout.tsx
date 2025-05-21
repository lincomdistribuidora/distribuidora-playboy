// src/layouts/PublicLayout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import PublicSidebar from '../components/PublicSidebar';

const PublicLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen && isMobile ? 'hidden' : 'auto';
  }, [sidebarOpen, isMobile]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <PublicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 998,
          }}
        />
      )}

      {/* Conteúdo principal sem margens extras para permitir que o background seja exibido corretamente */}
      <div style={{ flex: 1 }}>
        <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;