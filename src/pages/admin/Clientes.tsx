import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { colorAzul, colorBranco, colorVermelho } from '../../values/colors';
import ClienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';
import { Edit2, Trash2, Users } from 'lucide-react';

// Define o tipo Cliente
interface Contato {
  tipo: string;
  valor: string;
}

interface Cliente {
  id: string;
  nome: string;
  contatos: Contato[];
  endereco?: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
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

  const handleEditar = (id: string) => {
    navigate(`/cadastrar-clientes/${id}`);
  };

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

  const clientesFiltrados = clientes.filter((cliente) => {
    const clienteString = JSON.stringify(cliente).toLowerCase();
    return clienteString.includes(filtro.toLowerCase());
  });

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicial = (paginaAtual - 1) * clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicial, indiceInicial + clientesPorPagina);

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  return (
    <div className="menu-responsivel">
      <div
        className="container mt-5"
        style={{ backgroundColor: '#F5F5F5', padding: '20px', borderRadius: '10px' }}
      >
        <h1 style={{ color: colorAzul }}>
          Bem-vindo, {user?.displayName || user?.email || 'Usuário desconhecido'}!
        </h1>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Clientes</h2>

        <div className="mt-3" style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            style={{
              backgroundColor: '#F0F0F0',
              borderRadius: 4,
              border: 0,
              color: colorAzul,
              padding: '10px 20px',
              fontSize: '16px',
            }}
          >
            <button className="btn btn-outline-secondary">Voltar</button>
          </button>
          <button
            onClick={() => navigate('/cadastrar-clientes', { replace: true })}
            style={{
              backgroundColor: '#F0F0F0',
              borderRadius: 4,
              border: 0,
              color: colorBranco,
              padding: '10px 20px',
              fontSize: '16px',
            }}
          >
            <button className="btn btn-success">Cadastrar</button>
          </button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar cliente por qualquer informação..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaAtual(1);
            }}
            style={{ fontSize: '16px', padding: '10px' }}
          />
        </div>

        <div className="mt-4">
          {clientesFiltrados.length === 0 ? (
            <p>Nenhum cliente encontrado.</p>
          ) : (
            clientesPaginados.map((cliente) => (
              <div
                key={cliente.id}
                style={{
                  backgroundColor: '#FFF',
                  padding: '15px',
                  marginBottom: 10,
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={32} strokeWidth={2} color={colorAzul} />
                  <div>
                    <strong style={{ fontSize: '18px' }}>{cliente.nome}</strong>
                    <br />
                    <small style={{ fontSize: '14px' }}>
                      {cliente.contatos?.length > 0
                        ? cliente.contatos.map((c) => `${c.tipo}: ${c.valor}`).join(', ')
                        : 'Sem contato'}
                    </small>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEditar(cliente.id)}
                    style={{
                      backgroundColor: colorAzul,
                      color: colorBranco,
                      fontSize: '14px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(cliente.id)}
                    style={{
                      backgroundColor: colorVermelho,
                      color: colorBranco,
                      fontSize: '14px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPaginas > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
            {/* Botão Anterior */}
            <button
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              style={{
                padding: '8px 12px',
                marginRight: '10px',
                flexShrink: 0, // Não permite que o botão encolha
              }}
            >
              Anterior
            </button>

            {/* Números das páginas em scroll horizontal */}
            <div
              className="scroll-paginacao"
              style={{
                display: 'flex',
                overflowX: 'auto', // Ativa scroll horizontal
                gap: '10px',
                padding: '5px 0',
                flexGrow: 1, // Permite ocupar o espaço disponível
              }}
            >
              {[...Array(totalPaginas)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => mudarPagina(i + 1)}
                  style={{
                    padding: '8px 12px',
                    fontWeight: paginaAtual === i + 1 ? 'bold' : 'normal',
                    backgroundColor: paginaAtual === i + 1 ? colorAzul : '#e0e0e0',
                    color: paginaAtual === i + 1 ? colorBranco : '#000',
                    flexShrink: 0, // Garante que o botão não encolha no scroll
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Botão Próximo */}
            <button
              onClick={() => mudarPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              style={{
                padding: '8px 12px',
                marginLeft: '10px',
                flexShrink: 0, // Não permite que o botão encolha
              }}
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clientes;