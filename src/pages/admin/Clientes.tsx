// src/pages/admin/Clientes.tsx
import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { colorAzul, colorBranco, colorVermelho } from '../../values/colors';
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
}

const Clientes = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const clientesPorPagina = 10;

  useEffect(() => {
    const fetchClientes = async () => {
      const lista = await ClienteRepository.findAll();
      setClientes(lista);
    };
    fetchClientes();
  }, []);

  const handleEditar = (id: string) => navigate(`/cadastrar-clientes/${id}`);
  const handleCadastrar = () => navigate('/cadastrar-clientes');
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
      await ClienteRepository.delete(id);
      setClientes(clientes.filter((c) => c.id !== id));
      Swal.fire('Excluído!', 'O cliente foi removido com sucesso.', 'success');
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    JSON.stringify(cliente).toLowerCase().includes(filtro.toLowerCase())
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicial = (paginaAtual - 1) * clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicial, indiceInicial + clientesPorPagina);

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  return (
    <div className="container mt-4">
      <h1 style={styles.titulo}>
        Bem-vindo, {user?.displayName || user?.email || 'Usuário'}!
      </h1>

      <div style={styles.botoesContainer}>
        <button onClick={handleDashboard} className="btn btn-outline-secondary w-100">
          Voltar ao Dashboard
        </button>
        <button onClick={handleCadastrar} className="btn btn-success w-100">
          Cadastrar Cliente
        </button>
      </div>

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Buscar cliente..."
        value={filtro}
        onChange={(e) => {
          setFiltro(e.target.value);
          setPaginaAtual(1);
        }}
        style={styles.inputBusca}
      />

      {clientesFiltrados.length === 0 ? (
        <p className="text-center">Nenhum cliente encontrado.</p>
      ) : (
        clientesPaginados.map((cliente) => (
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
        ))
      )}

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