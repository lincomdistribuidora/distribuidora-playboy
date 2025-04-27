// src/pages/admin/Servicos.tsx
import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
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
  const servicosPorPagina = 10;

  useEffect(() => {
    const fetchServicos = async () => {
      const lista = await ServicoRepository.findAll();
      const servicosCompletos = lista.map((servico: any) => ({
        id: servico.id,
        nome: servico.nome || '',
        nomeCliente: servico.cliente?.nome || '',
        valor: servico.valor || '',
        tipo: servico.tipo || '',
      }));
      setServicos(servicosCompletos);
    };
    fetchServicos();
  }, []);

  const handleEditar = (id: string) => navigate(`/cadastrar-servicos/${id}`);
  const handleCadastrar = () => navigate('/cadastrar-servicos');
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
      await ServicoRepository.delete(id);
      setServicos(servicos.filter((s) => s.id !== id));
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
    <div style={styles.containerPrincipal}>
      <div style={styles.conteudo}>
        {/* Título */}
        <h1 style={styles.titulo}>
          Bem-vindo, {user?.displayName || user?.email || 'Usuário'}!
        </h1>

        {/* Botões */}
        <div style={styles.botoesContainer}>
          <button onClick={handleDashboard} className="btn btn-outline-secondary w-100">
            Voltar ao Dashboard
          </button>
          <button onClick={handleCadastrar} className="btn btn-success w-100">
            Cadastrar Serviço
          </button>
        </div>

        {/* Campo de busca */}
        <input
          type="text"
          className="form-control mb-4"
          placeholder="Buscar serviços..."
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
          style={styles.inputBusca}
        />

        {/* Lista */}
        {servicosFiltrados.length === 0 ? (
          <p className="text-center">Nenhum serviço encontrado.</p>
        ) : (
          servicosPaginados.map((servico) => (
            <div key={servico.id} style={styles.cardServico}>
              <div style={styles.cardBody}>
                <div>
                  <strong style={{ fontSize: '18px', color: colorAzul }}>{servico.nomeCliente}</strong>
                  <br />
                  <small style={{ fontSize: '14px' }}>
                    {servico.tipo} | R$ {Number(servico.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </small>
                </div>

                <div style={styles.botoesCard}>
                  <button
                    onClick={() => handleEditar(servico.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(servico.id)}
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
    </div>
  );
};

const styles = {
  containerPrincipal: {
    padding: '0px',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  conteudo: {
    width: '100%',
    margin: '0 auto',
    paddingInline: '2px', // 📱 Apenas 2px de margem lateral
    maxWidth: '1280px',
  },
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
    fontSize: '16px',
    padding: '10px',
    margin: '10px',
    width: 'calc(100% - 20px)',
    boxSizing: 'border-box' as const,
  },
  cardServico: {
    backgroundColor: '#fff',
    padding: '15px',
    marginBottom: '10px',
    marginInline: '8px',
    borderRadius: '8px',
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

export default Servicos;