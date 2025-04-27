// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaTools, FaSignOutAlt } from 'react-icons/fa'; // Adicionado ícone de logout
import { useUser } from '../contexts/UserContext';
import { getAuth, signOut } from 'firebase/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { setUser } = useUser();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/login');
  };

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: isOpen ? 0 : '-250px',
    width: '250px',
    height: '100vh',
    backgroundColor: '#0b1d40',
    color: '#fff',
    transition: 'left 0.3s ease',
    zIndex: 1000,
    paddingTop: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // para manter o logout sempre embaixo
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
  };

  const titleIconStyle: React.CSSProperties = {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  };

  const titleTextStyle: React.CSSProperties = {
    fontSize: '1.1rem',
  };

  const navLinkStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    marginBottom: '1rem',
    backgroundColor: 'transparent',
  };

  const activeLinkStyle: React.CSSProperties = {
    backgroundColor: '#0d6efd',
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '10px',
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '2rem',
    cursor: 'pointer',
    display: window.innerWidth < 768 ? 'block' : 'none',
    marginBottom: '1rem',
  };

  return (
    <div style={sidebarStyle}>
      <div>
        {/* Botão de fechar no mobile */}
        {window.innerWidth < 768 && (
          <button style={closeButtonStyle} onClick={onClose}>
            ×
          </button>
        )}

        {/* Cabeçalho com texto e ícone */}
        <div style={headerStyle}>
          <span style={titleIconStyle}>🧽</span>
          <span style={titleTextStyle}>
            Serviços <span style={{ color: '#ffc107' }}>Rômulo</span>
          </span>
        </div>

        {/* Navegação */}
        <nav>
          <Link
            to="/dashboard"
            style={{
              ...navLinkStyle,
              ...(location.pathname === '/dashboard' ? activeLinkStyle : {}),
            }}
          >
            <FaHome style={iconStyle} /> Dashboard
          </Link>

          <Link
            to="/clientes"
            style={{
              ...navLinkStyle,
              ...(location.pathname === '/clientes' ? activeLinkStyle : {}),
            }}
          >
            <FaUsers style={iconStyle} /> Clientes
          </Link>

          <Link
            to="/servicos"
            style={{
              ...navLinkStyle,
              ...(location.pathname === '/servicos' ? activeLinkStyle : {}),
            }}
          >
            <FaTools style={iconStyle} /> Serviços
          </Link>
        </nav>
      </div>

      {/* Botão de Logout embaixo */}
      <div style={{ padding: '1rem' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            backgroundColor: '#dc3545', // vermelho
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;