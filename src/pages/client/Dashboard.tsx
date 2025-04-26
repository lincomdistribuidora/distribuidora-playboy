// src/pages/client/Dashboard.tsx
import React from 'react';
import { useUser } from '../../contexts/UserContext'; // Importando o hook customizado
import { colorAzul, colorBranco } from '../../values/colors';
import { useNavigate } from 'react-router-dom'; // Substituindo Link por useNavigate

const Dashboard = () => {
  const { user, logout } = useUser(); // Acessa o usuário e a função de logout
  const navigate = useNavigate(); // Hook de navegação

  return (
    <div className='menu-responsivel'>
      <div className="container mt-5" style={{ backgroundColor: '#F5F5F5' }}>
        <h1 style={{ color: colorAzul }}>
          Bem-vindo, {user?.displayName || user?.email || 'Usuário desconhecido'}!
        </h1>
        {/* <div className="mt-4">
          <button
            // onClick={() => navigate('/vendas', { replace: true })}
            style={{
              backgroundColor: colorAzul,
              color: colorBranco,
              borderRadius: 4,
              border: 0
            }}>
            Vendas/Serviços
          </button>
        </div> 

        <div className="mt-4">
          <button
            // onClick={() => navigate('/agendamentos', { replace: true })}
            style={{
              backgroundColor: colorAzul,
              color: colorBranco,
              borderRadius: 4,
              border: 0
            }}>
            Agendamentos
          </button>
        </div>

        */}

        <div className="mt-4">
          <button
            onClick={() => navigate('/clientes', { replace: true })}
            style={{
              backgroundColor: colorAzul,
              color: colorBranco,
              borderRadius: 4,
              border: 0
            }}>
            Clientes
          </button>
        </div>

        {/* 
        <Link to='/agendamento' className='btn' style={{ backgroundColor: colorAzul, color: colorBranco }}>
          Agende sua lavagem
        </Link>
        */}

        <div className="mt-4">
          <button
            onClick={() => navigate('/servicos', { replace: true })}
            style={{
              backgroundColor: colorAzul,
              color: colorBranco,
              borderRadius: 4,
              border: 0
            }}>
            Serviços
          </button>
        </div>

        {/* <div className="mt-4">
          <button
            // onClick={() => navigate('/estoque', { replace: true })}
            style={{
              backgroundColor: colorAzul,
              color: colorBranco,
              borderRadius: 4,
              border: 0
            }}>
            Estoque
          </button>
        </div> */}

        {/* 
        <div className="mt-4">
          <button className="btn btn-primary">Gráficos entre outros...</button>
        </div>

        btn-default, btn-primary, btn-success, btn-warning, btn-danger, e btn-link      
        */}

        {/*  Dentro de veículo

        <div className="mt-3">
          <button className="btn btn-secondary">Cadastrar Veículo</button>
        </div> 

        Ver todos veículos (opção para edição e exclusão)
        */}

        {/* <div className="mt-4">
          <button
            // onClick={() => navigate('/despesas', { replace: true })}
            style={{
              backgroundColor: colorAzul,
              color: colorBranco,
              borderRadius: 4,
              border: 0
            }}>
            Despesas
          </button>
        </div> */}

        <div className="mt-3">
          <button
            onClick={logout}
            style={{
              backgroundColor: '#F00',
              color: colorBranco,
              borderRadius: 4,
              border: 0
            }}>
            Sair
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;