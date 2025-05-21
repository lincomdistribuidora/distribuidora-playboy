import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaMoneyBillWave, FaSignOutAlt, FaPlus } from 'react-icons/fa'; // Importando ícone para "Cadastrar"
import { useUser } from '../contexts/UserContext';
import { getAuth, signOut } from 'firebase/auth';

import imagem from '../../img/logo.jpeg'

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const location = useLocation();
  const { setUser } = useUser();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: isOpen ? 0 : '-250px',
    width: '250px',
    height: `${viewportHeight}px`,
    backgroundColor: '#0b1d40',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'left 0.4s ease-in-out',
    zIndex: 999,
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '1rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  };

  const logoStyle: React.CSSProperties = {
    width: '100px',
    height: '100px',
  };

  const navStyle: React.CSSProperties = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '1rem 0.5rem',
  };

  const linkStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    marginBottom: '1rem',
  };

  const activeLinkStyle: React.CSSProperties = {
    backgroundColor: '#0d6efd',
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '10px',
  };

  return (
    <div style={sidebarStyle}>
      <div>
        {/* Botão de Fechar (mobile) */}
        {window.innerWidth < 768 && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              color: '#fff',
              margin: '1rem',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        )}
        {/* Header */}
        <div style={headerStyle}>
          <img src={imagem} alt="loco lincom" style={logoStyle} />
          {/* <div style={{ fontSize: '2rem' }}>🧽</div> */}
          {/* Serviços <span style={{ color: '#ffc107' }}>Lincom</span> */}
        </div>
      </div>

      {/* Navegação */}
      <nav style={navStyle}>
        {/* Dashboard no início */}
        <Link to="/dashboard" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/dashboard' ? activeLinkStyle : {}) }}>
          <FaHome style={iconStyle} /> Dashboard
        </Link>

        {/* Cadastrar Tipo de Serviço */}
        {/* <Link to="/cadastrar-tipo-servico" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/cadastrar-tipo-servico' ? activeLinkStyle : {}) }}>
          <FaPlus style={iconStyle} /> Cadastrar Tipo de Serviço
        </Link> */}

        {/* Cadastrar Cliente */}
        <Link to="/cadastrar-cliente" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/cadastrar-cliente' ? activeLinkStyle : {}) }}>
          <FaPlus style={iconStyle} /> Cadastrar Cliente
        </Link>

        {/* Clientes */}
        <Link to="/clientes" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/clientes' ? activeLinkStyle : {}) }}>
          <FaUsers style={iconStyle} /> Clientes
        </Link>

        {/* Cadastrar Produtos */}
        <Link to="/cadastrar-produto" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/cadastrar-produto' ? activeLinkStyle : {}) }}>
          <FaPlus style={iconStyle} /> Cadastrar Produto
        </Link>

        {/* Produtos */}
        <Link to="/produtos" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/produtos' ? activeLinkStyle : {}) }}>
          <FaUsers style={iconStyle} /> Produtos
        </Link>

        {/* Vendas */}
        <Link to="/vendas" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/vendas' ? activeLinkStyle : {}) }}>
          <FaMoneyBillWave style={iconStyle} /> Vendas
        </Link>

        {/* Lançar Venda */}
        <Link to="/cadastrar-venda" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/cadastrar-venda' ? activeLinkStyle : {}) }}>
          <FaPlus style={iconStyle} /> Lançar Venda
        </Link>



        {/* Serviços */}
        {/* <Link to="/servicos" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/servicos' ? activeLinkStyle : {}) }}>
          <FaTools style={iconStyle} /> Serviços
        </Link> */}

        {/* Cadastrar Serviço */}
        {/* <Link to="/cadastrar-servico" onClick={handleLinkClick} style={{ ...linkStyle, ...(location.pathname === '/cadastrar-servico' ? activeLinkStyle : {}) }}>
          <FaPlus style={iconStyle} /> Cadastrar Serviço
        </Link> */}
      </nav>

      {/* Botão Sair */}
      <div style={{ padding: '1rem' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            backgroundColor: '#dc3545',
            color: '#fff',
            padding: '10px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;