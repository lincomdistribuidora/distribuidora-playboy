// src/components/Sidebar.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiSettings, FiMenu } from 'react-icons/fi';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Clientes', path: '/clientes', icon: <FiUsers /> },
    { name: 'Serviços', path: '/servicos', icon: <FiSettings /> },
  ];

  return (
    <div style={{
      width: isCollapsed ? '80px' : '240px',
      transition: 'width 0.4s ease',
      backgroundColor: '#0f172a', // Cor ainda mais escura
      color: '#cbd5e1',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      borderRight: '1px solid #334155',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center' }}>
        {!isCollapsed && <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>Painel</h1>}
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          <FiMenu />
        </button>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              textDecoration: 'none',
              color: location.pathname === item.path ? '#3b82f6' : '#cbd5e1',
              backgroundColor: location.pathname === item.path ? '#1e293b' : 'transparent',
              transition: 'background 0.2s',
              fontWeight: 500
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = location.pathname === item.path ? '#1e293b' : 'transparent'}
          >
            <span style={{ fontSize: '22px' }}>{item.icon}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;