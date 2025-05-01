import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Header from './components/Header';
import Home from './pages/public/Home';
import Agendamento from './pages/public/Agendamento';
import ComoChegar from './pages/public/ComoChegar';
import Login from './pages/public/Login';
import Dashboard from './pages/client/Dashboard';
import PrivateLayout from './layouts/PrivateLayout';
import ProtectedRoute from './pages/protected/ProtectedRoute';
import Clientes from './pages/admin/Clientes';
import Servicos from './pages/admin/Servicos';
import CadastrarCliente from './pages/admin/CadastrarCliente';
import CadastrarServico from './pages/admin/CadastrarServico';
import CadastrarTipoServico from './pages/admin/CadastrarTipoServico';  // Nova página para cadastrar tipo de serviço

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

          {/* Páginas Privadas */}
          <Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/cadastrar-clientes" element={<CadastrarCliente />} />
            <Route path="/cadastrar-clientes/:id" element={<CadastrarCliente />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/cadastrar-servicos" element={<CadastrarServico />} />
            <Route path="/cadastrar-servicos/:id" element={<CadastrarServico />} />
            <Route path="/cadastrar-tipo-servico" element={<CadastrarTipoServico />} /> 
            <Route path="/cadastrar-tipo-servico/:id" element={<CadastrarTipoServico />} /> 
          </Route>

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;