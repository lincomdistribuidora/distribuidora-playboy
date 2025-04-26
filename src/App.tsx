import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Header from './components/Header';
import Home from './pages/public/Home';
import Agendamento from './pages/public/Agendamento';
import ComoChegar from './pages/public/ComoChegar';
import Login from './pages/public/Login';
import Dashboard from './pages/client/Dashboard';
import PrivateLayout from './layouts/PrivateLayout'; // <-- Importa o novo Layout
import ProtectedRoute from './pages/protected/ProtectedRoute'; // <-- Para proteger rotas


import Clientes from './pages/admin/Clientes';
import CadastrarCliente from './pages/admin/CadastrarCliente';
import CadastrarServico from './pages/admin/CadastrarServico';

import Servicos from './pages/admin/Servicos';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>

          {/* Páginas Públicas */}
          <Route path="/" element={<><Header /><Home /></>} />
          <Route path="/agendamento" element={<><Header /><Agendamento /></>} />
          <Route path="/como-chegar" element={<><Header /><ComoChegar /></>} />
          <Route path="/login" element={<><Header /><Login /></>} />

          {/* Páginas Privadas (Protegidas) */}
          <Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Pode colocar outras privadas aqui também, tipo: */}
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/cadastrar-clientes" element={<CadastrarCliente />} />
            
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/cadastrar-servicos" element={<CadastrarServico />} />
          </Route>

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;