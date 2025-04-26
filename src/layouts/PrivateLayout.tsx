// src/layouts/PrivateLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.tsx'; // <-- O seu menu lateral que recolhe

const PrivateLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet /> {/* Aqui vai renderizar a página que o usuário clicou */}
      </div>
    </div>
  );
};

export default PrivateLayout;