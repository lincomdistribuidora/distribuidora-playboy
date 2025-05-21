// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';

// Componentes
import Header from './components/Header';
import ProtectedRoute from './pages/protected/ProtectedRoute';

// Páginas públicas (sem login)
// import Home from './pages/public/Home';
// import Agendamento from './pages/public/Agendamento';
import ComoChegar from './pages/public/ComoChegar';
import Login from './pages/public/Login';

// Páginas públicas com login (clientes)
import DashboardClientePublico from './pages/public/DashboardClientePublico';
// import MeusAgendamentos from './pages/public/MeusAgendamento';
// import MeusServicos from './pages/public/MeusServico';

// Páginas privadas (admin/sistema interno)
import Dashboard from './pages/client/Dashboard';
import Clientes from './pages/admin/Clientes';
import CadastrarCliente from './pages/admin/CadastrarCliente';
// import Servicos from './pages/admin/Servicos';
// import CadastrarServico from './pages/admin/CadastrarServico';
// import CadastrarTipoServico from './pages/admin/CadastrarTipoServico';

import Produtos from './pages/admin/Produtos';
import CadastrarProduto from './pages/admin/CadastrarProduto';

// import Vendas from './pages/admin/Vendas';
import Vendas from './pages/admin/Vendas';
import CadastrarVenda from './pages/admin/CadastrarVenda';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>

          {/* Rotas públicas sem autenticação, com Header */}
          <Route path="/" element={<><Header /><ComoChegar /></>} />
          {/* <Route path="/agendamento" element={<><Header /><Agendamento /></>} />
          <Route path="/como-chegar" element={<><Header /><ComoChegar /></>} /> */}
          <Route path="/login" element={<><Header /><Login /></>} />

          {/* Rotas públicas autenticadas (clientes) com layout próprio e sem Header */}
          <Route element={<PublicLayout />}>
            <Route path="/dashboard-cliente-publico" element={<DashboardClientePublico />} />
            {/* <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
            <Route path="/meus-servicos" element={<MeusServicos />} /> */}
          </Route>

          {/* Rotas privadas protegidas por autenticação (admin ou usuários internos) */}
          <Route element={
            <ProtectedRoute>
              <PrivateLayout />
            </ProtectedRoute>
          }>
            {/* Dashboard inicial */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Cliente */}
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/cadastrar-cliente" element={<CadastrarCliente />} />
            <Route path="/cadastrar-cliente/:id" element={<CadastrarCliente />} />

            {/* Produtos */}
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/cadastrar-produto" element={<CadastrarProduto />} />
            <Route path="/cadastrar-produto/:id" element={<CadastrarProduto />} />

            {/* Vendas */}
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/cadastrar-venda" element={<CadastrarVenda />} />
            <Route path="/cadastrar-venda/:id" element={<CadastrarVenda />} />
            {/* Serviços */}
            {/* <Route path="/servicos" element={<Servicos />} />
            <Route path="/cadastrar-servico" element={<CadastrarServico />} />
            <Route path="/cadastrar-servico/:id" element={<CadastrarServico />} /> */}

            {/* Tipos de Serviço */}
            {/* <Route path="/cadastrar-tipo-servico" element={<CadastrarTipoServico />} />
            <Route path="/cadastrar-tipo-servico/:id" element={<CadastrarTipoServico />} /> */}
          </Route>

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;