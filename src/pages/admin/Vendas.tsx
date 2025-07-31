// src/pages/admin/Vendas.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import VendaRepository from '../../repositories/VendaRepository';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import { format, isSameDay } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-datepicker/dist/react-datepicker.css';

interface Venda {
  id: string;
  tipo: string;
  valor: string;
  cliente: {
    nome: string;
    [key: string]: any;
  };
  criadoEm: string;
  status?: string;
}

const Vendas = () => {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [filtroData, setFiltroData] = useState<Date | null>(new Date());
  const [paginaAtual, setPaginaAtual] = useState(1);
  const vendasPorPagina = 10;

  // Carrega vendas do Firebase
  const fetchVendas = async () => {
    try {
      const lista = await VendaRepository.findAll();
      setVendas(
        lista.map((s) => ({
          id: s.id,
          tipo: s.tipo || '',
          valor: s.valor || '',
          cliente: s.cliente || { nome: 'Cliente não informado' },
          criadoEm: s.criadoEm || '',
          status: s.status || 'Pendente',
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  const handleEditar = (id: string) => navigate(`../cadastrar-venda/${id}`);
  const handleCadastrar = () => navigate('/cadastrar-venda');
  const handleDashboard = () => navigate('/dashboard');

  const handleExcluir = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await VendaRepository.remove(id);
        await fetchVendas();
        Swal.fire('Excluído!', 'A venda foi removida com sucesso.', 'success');
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        Swal.fire('Erro!', 'Não foi possível excluir a venda.', 'error');
      }
    }
  };

  // Aplica os filtros de texto, status e data
  const vendasFiltradas = vendas
    .filter((venda) =>
      JSON.stringify(venda).toLowerCase().includes(filtroTexto.toLowerCase())
    )
    .filter((venda) => {
      if (filtroStatus === 'todos') return true;
      return venda.status?.toLowerCase() === filtroStatus;
    })
    .filter((venda) => {
      if (!filtroData) return true;
      return isSameDay(new Date(venda.criadoEm), filtroData);
    })
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const totalPaginas = Math.ceil(vendasFiltradas.length / vendasPorPagina);
  const indiceInicial = (paginaAtual - 1) * vendasPorPagina;
  const vendasPaginadas = vendasFiltradas.slice(indiceInicial, indiceInicial + vendasPorPagina);

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  return (
    <div className="container mt-4">
      {/* Botões principais */}
      <div style={styles.botoesContainer}>
        <button onClick={handleDashboard} className="btn btn-outline-secondary w-100">
          Voltar ao Dashboard
        </button>
        <button onClick={handleCadastrar} className="btn btn-success w-100">
          Lançar Venda
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-3" style={{ paddingInline: '8px' }}>
        <label>Pesquisar por status:</label>
        <select
          className="form-control mb-2"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="concluída">Concluída</option>
        </select>

        <label>Filtrar por data:</label>
        <DatePicker
          selected={filtroData}
          onChange={(date) => {
            setFiltroData(date);
            setPaginaAtual(1);
          }}
          dateFormat="dd/MM/yyyy"
          locale={ptBR}
          isClearable
          className="form-control mb-2"
          placeholderText="Selecione uma data"
        />

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Buscar por nome, tipo, etc..."
          value={filtroTexto}
          onChange={(e) => {
            setFiltroTexto(e.target.value);
            setPaginaAtual(1);
          }}
        />
      </div>

      {/* Lista de vendas */}
      {vendasFiltradas.length === 0 ? (
        <p className="text-center">Nenhuma venda encontrada.</p>
      ) : (
        vendasPaginadas.map((venda, index) => (
          <div key={venda.id || `venda-${index}`} style={styles.card}>
            <div style={styles.cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ fontSize: '18px', color: colorAzul }}>
                  {venda.cliente?.nome}
                </strong>
                <small style={{ fontSize: '14px' }}>
                  {venda.tipo} | R$ {Number(venda.valor).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </small>
                <small style={{ fontSize: '12px', color: '#888' }}>
                  Criado em: {new Date(venda.criadoEm).toLocaleDateString('pt-BR')}
                </small>
                <small
                  style={{
                    fontSize: '13px',
                    color: venda.status === 'Concluída' ? 'green' : 'red',
                  }}
                >
                  Situação: {venda.status}
                </small>
              </div>

              <div style={styles.botoesCard}>
                <button onClick={() => handleEditar(venda.id)} className="btn btn-primary btn-sm">
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(venda.id)}
                  className="btn btn-danger btn-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="d-flex align-items-center justify-content-center flex-wrap mt-4 gap-2">
          <button
            onClick={() => mudarPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="btn btn-outline-primary btn-sm"
          >
            Anterior
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              onClick={() => mudarPagina(i + 1)}
              className={`btn btn-sm ${paginaAtual === i + 1 ? 'btn-primary' : 'btn-light'}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => mudarPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className="btn btn-outline-primary btn-sm"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

// Estilos inline
const styles = {
  botoesContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '20px',
    paddingInline: '8px',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: '10px',
    marginInline: '8px',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  botoesCard: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
};

export default Vendas;