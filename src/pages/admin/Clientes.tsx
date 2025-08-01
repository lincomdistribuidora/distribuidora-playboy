// src/pages/admin/Clientes.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import ClienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';
import { Edit2, Trash2, Users } from 'lucide-react';

interface Contato {
  tipo: string;
  valor: string;
}

interface Cliente {
  id: string;
  nome: string;
  contatos: Contato[];
  saldo?: number;
}

const Clientes = () => {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroSaldo, setFiltroSaldo] = useState('todos'); // novo filtro
  const [paginaAtual, setPaginaAtual] = useState(1);
  const clientesPorPagina = 10;

  useEffect(() => {
    const fetchClientes = async () => {
      const lista = await ClienteRepository.findAll();
      setClientes(lista);
    };
    fetchClientes();
  }, []);

  const handleEditar = (id: string) => navigate(`/cadastrar-cliente/${id}`);
  const handleCadastrar = () => navigate('/cadastrar-cliente');
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
      await ClienteRepository.remove(id);
      setClientes(clientes.filter((c) => c.id !== id));
      Swal.fire('Excluído!', 'O cliente foi removido com sucesso.', 'success');
    }
  };

  const clientesFiltrados = clientes
    .filter((cliente) => {
      const saldo = Number(cliente.saldo) || 0;
      if (filtroSaldo === 'credito') {
        return saldo < 0;
      }
      if (filtroSaldo === 'debito') {
        return saldo > 0;
      }
      return true;
    })
    .filter((cliente) =>
      JSON.stringify(cliente).toLowerCase().includes(filtro.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicial = (paginaAtual - 1) * clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(
    indiceInicial,
    indiceInicial + clientesPorPagina
  );

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
          Cadastrar Cliente
        </button>
      </div>

      {/* Campo de busca + filtro de saldo */}
      <div className="d-flex align-items-center gap-2 mb-4 px-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar cliente..."
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
          style={{ flex: 1, minWidth: '200px' }}
        />

        <select
          className="form-select"
          value={filtroSaldo}
          onChange={(e) => {
            setFiltroSaldo(e.target.value);
            setPaginaAtual(1);
          }}
          style={{ maxWidth: '200px' }}
        >
          <option value="todos">Todos</option>
          <option value="credito">Com saldo (Crédito)</option>
          <option value="debito">Com saldo (Débito)</option>
        </select>
      </div>

      {/* Lista de clientes */}
      {clientesFiltrados.length === 0 ? (
        <p className="text-center">Nenhum cliente encontrado.</p>
      ) : (
        clientesPaginados.map((cliente) => {
          const saldo = Number(cliente.saldo) || 0;
          const saldoFormatado = saldo.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });

          const textoSaldo =
            saldo < 0
              ? `Crédito: ${saldoFormatado}`
              : saldo > 0
                ? `Débito: ${saldoFormatado}`
                : 'Sem saldo pendente';

          const corSaldo =
            saldo < 0 ? '#d9534f' : saldo > 0 ? '#5cb85c' : '#6c757d';

          return (
            <div key={cliente.id} style={styles.card}>
              <div style={styles.cardBody}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={32} strokeWidth={2} color={colorAzul} />
                  <div>
                    <strong style={{ fontSize: '18px' }}>{cliente.nome}</strong>
                    <br />
                    <small style={{ fontSize: '14px' }}>
                      {cliente.contatos?.length
                        ? cliente.contatos.map(c => `${c.tipo}: ${c.valor}`).join(', ')
                        : 'Sem contato'}
                    </small>
                    <br />
                    <small
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: corSaldo,
                      }}
                    >
                      {textoSaldo}
                    </small>
                  </div>
                </div>

                <div style={styles.botoesCard}>
                  <button
                    onClick={() => handleEditar(cliente.id)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(cliente.id)}
                    className="btn btn-danger btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })
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

const styles = {
  titulo: {
    color: colorAzul,
    fontSize: '1.8rem',
    marginBottom: '1rem',
    paddingLeft: '8px',
  },
  botoesContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '20px',
    paddingInline: '8px',
  },
  inputBusca: {
    padding: '10px',
    fontSize: '16px',
    margin: '10px',
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

export default Clientes;