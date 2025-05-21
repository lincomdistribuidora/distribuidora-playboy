import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Swal from 'sweetalert2';
import { FiLogOut, FiHome } from 'react-icons/fi';

interface PublicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const PublicSidebar: React.FC<PublicSidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();

  // Estilo para os links do menu, aplicando destaque se for a rota atual
  const linkStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    textDecoration: 'none',
    color: location.pathname === path ? '#fff' : '#e3f2fd',
    backgroundColor: location.pathname === path ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
    fontWeight: 500,
    transition: 'all 0.2s',
    borderRadius: '8px',
  });

  // Função para lidar com logout com confirmação via SweetAlert2
  const handleLogout = () => {
    Swal.fire({
      title: 'Tem certeza que deseja sair?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/'); // Redireciona para a home
      }
    });
  };

  return (
    <aside
      style={{
        width: isOpen ? '250px' : '0',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        backgroundColor: 'rgba(13, 71, 161, 0.9)', // Azul claro
        color: '#fff',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '64px', // Altura do header
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }}>
        <Link to="/dashboard-cliente-publico" style={linkStyle('/dashboard-cliente-publico')}>
          <FiHome /> Dashboard
        </Link>

        <button
          onClick={handleLogout}
          style={{
            ...linkStyle(''),
            backgroundColor: 'red',
            border: 'none',
            color: '#e3f2fd',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <FiLogOut /> Sair
        </button>
      </nav>
    </aside>
  );
};

export default PublicSidebar;