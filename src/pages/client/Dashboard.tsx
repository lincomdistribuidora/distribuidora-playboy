// src/pages/client/Dashboard.tsx
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaCogs, FaSignOutAlt, FaPlus } from 'react-icons/fa'; // Importando ícone para 'Cadastrar'
import { colorAzul, colorBranco } from '../../values/colors';

const Dashboard = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const menuOptions = [
    {
      label: 'Clientes',
      icon: <FaUsers size={22} />,
      onClick: () => navigate('/clientes', { replace: true }),
    },
    {
      label: 'Serviços',
      icon: <FaCogs size={22} />,
      onClick: () => navigate('/servicos', { replace: true }),
    },
    {
      label: 'Cadastrar Tipo de Serviço', // Nova opção no menu
      icon: <FaPlus size={22} />, // Ícone para "Cadastrar"
      onClick: () => navigate('/cadastrar-tipo-servico', { replace: true }), // Navegação para a nova página
    },
  ];

  return (
    <div className="container mt-5" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '700px' }}>
      <h1 style={{ color: colorAzul, fontSize: '26px', fontWeight: 'bold', marginBottom: '30px' }}>
        👋 Bem-vindo, {user?.displayName || user?.email || 'Usuário'}!
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {menuOptions.map((option, index) => (
          <motion.button
            key={index}
            onClick={option.onClick}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: colorAzul,
              color: colorBranco,
              fontSize: '18px',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {option.icon}
            {option.label}
          </motion.button>
        ))}

        <motion.button
          onClick={logout}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#e74c3c',
            color: colorBranco,
            fontSize: '18px',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '20px',
          }}
        >
          <FaSignOutAlt size={22} />
          Sair
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;