import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { colorAzul, colorBranco, colorVermelho } from '../../values/colors';
import ServicoRepository from '../../repositories/ServicoRepository';
import Swal from 'sweetalert2';

interface Servico {
  id: string;
  nome: string;
  nomeCliente: string;
  valor: string;
  tipo: string;
}

const Servicos: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [filtro, setFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const servicosPorPagina = 2;

  useEffect(() => {
    const fetchServicos = async () => {
      const lista = await ServicoRepository.findAll();
      setServicos(lista);
    };
    fetchServicos();
  }, []);

  const handleEditar = (id: string) => {
    navigate(`/cadastrar-servicos/${id}`);
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
      await ServicoRepository.delete(id);
      setServicos(servicos.filter(s => s.id !== id));
      Swal.fire('Excluído!', 'O serviço foi removido com sucesso.', 'success');
    }
  };

  const servicosFiltrados = servicos.filter(servico =>
    JSON.stringify(servico).toLowerCase().includes(filtro.toLowerCase())
  );

  const totalPaginas = Math.ceil(servicosFiltrados.length / servicosPorPagina);
  const indiceInicial = (paginaAtual - 1) * servicosPorPagina;
  const servicosPaginados = servicosFiltrados.slice(indiceInicial, indiceInicial + servicosPorPagina);

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  return (
    <div style={styles.menuResponsivo}>
      <div style={styles.container}>
        <h1 style={styles.titulo}>
          Bem-vindo, {user?.displayName || user?.email || 'Usuário'}!
        </h1>
        <h2 style={styles.subtitulo}>Serviços</h2>

        {/* Botões de navegação */}
        <div style={styles.botoesContainer}>
          <button onClick={() => navigate('/dashboard')} style={{ ...styles.botao, ...styles.botaoSecundario }}>
            Voltar
          </button>
          <button onClick={() => navigate('/cadastrar-servicos')} style={{ ...styles.botao, ...styles.botaoPrimario }}>
            Cadastrar
          </button>
        </div>

        {/* Campo de busca */}
        <div style={styles.campoBuscaContainer}>
          <input
            type="text"
            placeholder="Buscar serviços por qualquer informação..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaAtual(1);
            }}
            style={styles.inputBusca}
          />
        </div>

        {/* Lista de serviços */}
        <div>
          {servicosFiltrados.length === 0 ? (
            <p>Nenhum serviço encontrado.</p>
          ) : (
            servicosPaginados.map(servico => (
              <div key={servico.id} style={styles.card}>
                <div style={styles.cardBody}>
                  <div>
                    <h5 style={styles.cardTitulo}>{servico.nomeCliente}</h5>
                    <p>
                      <strong>Tipo de Serviço:</strong>{' '}
                      <span style={styles.badge}>{servico.tipo}</span>
                    </p>
                    <p>
                      <strong>Valor:</strong>{' '}
                      <span style={styles.valor}>
                        R$ {Number(servico.valor).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div style={styles.cardAcoes}>
                    <button
                      style={{ ...styles.botao, ...styles.botaoPrimario }}
                      onClick={() => handleEditar(servico.id)}
                    >
                      Editar
                    </button>
                    <button
                      style={{ ...styles.botao, ...styles.botaoPerigo }}
                      onClick={() => handleExcluir(servico.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div style={styles.paginacaoContainer}>
            <button
              style={styles.botaoPaginacao}
              disabled={paginaAtual === 1}
              onClick={() => mudarPagina(paginaAtual - 1)}
            >
              Anterior
            </button>
            <div style={styles.scrollPaginacao}>
              {[...Array(totalPaginas)].map((_, i) => (
                <button
                  key={i}
                  style={{
                    ...styles.botaoPaginacao,
                    ...(paginaAtual === i + 1 ? styles.botaoAtivo : {}),
                  }}
                  onClick={() => mudarPagina(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              style={styles.botaoPaginacao}
              disabled={paginaAtual === totalPaginas}
              onClick={() => mudarPagina(paginaAtual + 1)}
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  menuResponsivo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  container: {
    width: '100%',
    maxWidth: 1280,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  titulo: {
    color: colorAzul,
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  botoesContainer: {
    marginTop: 15,
    display: 'flex',
    gap: 10,
  },
  botao: {
    padding: '10px 20px',
    fontSize: 14,
    borderRadius: 4,
    border: 0,
    cursor: 'pointer',
  },
  botaoPrimario: {
    backgroundColor: '#28a745',
    color: colorBranco,
  },
  botaoSecundario: {
    backgroundColor: '#6c757d',
    color: colorBranco,
  },
  botaoPerigo: {
    backgroundColor: colorVermelho,
    color: colorBranco,
  },
  campoBuscaContainer: {
    marginTop: 20,
  },
  inputBusca: {
    fontSize: 16,
    padding: 10,
    borderRadius: 4,
    border: '1px solid #ddd',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    padding: 15,
    marginBottom: 10,
  },
  cardBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colorAzul,
  },
  badge: {
    backgroundColor: '#e0f7fa',
    color: colorAzul,
    padding: '5px 10px',
    borderRadius: 8,
    fontSize: 12,
  },
  valor: {
    color: '#28a745',
    fontWeight: 'bold' as const,
  },
  cardAcoes: {
    display: 'flex',
    gap: 10,
  },
  paginacaoContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  scrollPaginacao: {
    display: 'flex',
    gap: 10,
    overflowX: 'auto',
    scrollbarWidth: 'thin', // Personalização do scroll para navegadores compatíveis
    scrollbarColor: '#888 transparent',
  },
  scrollPaginacaoWebkit: {
    height: 6, // Altura do scroll para navegadores baseados em Webkit
  },
  scrollPaginacaoThumb: {
    backgroundColor: '#888',
    borderRadius: 4,
  },
  scrollPaginacaoTrack: {
    backgroundColor: 'transparent',
  },
};

export default Servicos;