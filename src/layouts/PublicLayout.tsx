// src/layouts/PublicLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const PublicLayout = () => {
  return (
    <div>
      <Header />
      <div style={{ padding: '24px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;