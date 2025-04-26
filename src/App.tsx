// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext'; // Importando o UserProvider
import Header from './components/Header';
import Home from './pages/public/Home';
import Agendamento from './pages/public/Agendamento';
import ComoChegar from './pages/public/ComoChegar';
import Login from './pages/public/Login';
import Dashboard from './pages/client/Dashboard';

import DashboardServicos from './pages/admin/Servicos';
import DashboardCadastrarServicos from './pages/admin/CadastrarServico'

import DashboardClientes from './pages/admin/Clientes';
import DashboardCadastrarCliente from './pages/admin/CadastrarCliente ';



import ProtectedRoute from './pages/protected/ProtectedRoute'; // Para proteção de rotas

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/agendamento' element={<Agendamento />} />
          <Route path='/como-chegar' element={<ComoChegar />} />
          <Route path='/login' element={<Login />} />

          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/servicos'
            element={
              <ProtectedRoute>
                <DashboardServicos />
              </ProtectedRoute>
            }
          />

          <Route
            path='/cadastrar-servicos'
            element={
              <ProtectedRoute>
                <DashboardCadastrarServicos />
              </ProtectedRoute>
            }
          />
          <Route
            path='/cadastrar-servicos/:id'
            element={
              <ProtectedRoute>
                <DashboardCadastrarServicos />
              </ProtectedRoute>
            }
          />






          <Route
            path='/clientes'
            element={
              <ProtectedRoute>
                <DashboardClientes />
              </ProtectedRoute>
            }
          />
          <Route
            path='/cadastrar-clientes'
            element={
              <ProtectedRoute>
                <DashboardCadastrarCliente />
              </ProtectedRoute>
            }
          />
          <Route
            path='/cadastrar-clientes/:id'
            element={
              <ProtectedRoute>
                <DashboardCadastrarCliente />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;