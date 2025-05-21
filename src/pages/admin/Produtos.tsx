// src/pages/admin/Produtos.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
// import ProdutoRepository from '../../repositories/ProdutoRepository';
import ProdutoRepository from '../../repositories/ProdutoRepository';
import Swal from 'sweetalert2';
import { Edit2, Trash2, Users } from 'lucide-react';
import { FaUsers, FaBeer, FaSignOutAlt, FaPlus } from 'react-icons/fa';

// Tipagens auxiliares
// interface Contato {
//   tipo: string;
//   valor: string;
// }

interface Produto {
  id: string;
  nome: string;
  valorVenda: string;
  quantidadeEstoque: string;
  // contatos: Contato[];
}

const Produtos = () => {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const produtosPorPagina = 10;

  // Buscar todos os produtos ao carregar a tela
  useEffect(() => {
    const fetchProdutos = async () => {
      const lista = await ProdutoRepository.findAll();
      setProdutos(lista);
    };
    fetchProdutos();
  }, []);

  // Ações de navegação
  const handleEditar = (id: string) => navigate(`/cadastrar-produto/${id}`);
  const handleCadastrar = () => navigate('/cadastrar-produto');
  const handleDashboard = () => navigate('/dashboard');

  // Excluir produto com confirmação
  const handleExcluir = async (id: string) => {
    console.log('Excluindo produto com ID:', id); // 👈 Adicione isso

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
      await ProdutoRepository.delete(id);
      setProdutos(produtos.filter((c) => c.id !== id));
      Swal.fire('Excluído!', 'O produto foi removido com sucesso.', 'success');
    }
  };

  // Filtrar e ordenar produtoss por nome (A-Z)
  const produtosFiltrados = produtos
    .filter(produto =>
      JSON.stringify(produto).toLowerCase().includes(filtro.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome));

  // Paginação
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const indiceInicial = (paginaAtual - 1) * produtosPorPagina;
  const produtosPaginados = produtosFiltrados.slice(indiceInicial, indiceInicial + produtosPorPagina);

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
          Cadastrar Produto
        </button>
      </div>

      {/* Campo de busca */}
      <input
        type="text"
        className="form-control mb-4"
        placeholder="Buscar produto..."
        value={filtro}
        onChange={(e) => {
          setFiltro(e.target.value);
          setPaginaAtual(1); // Reiniciar para página 1 ao filtrar
        }}
        style={styles.inputBusca}
      />

      {/* Lista de produtos ou mensagem de vazio */}
      {produtosFiltrados.length === 0 ? (
        <p className="text-center">Nenhum produto encontrado.</p>
      ) : (
        produtosPaginados.map((produto) => (
          <div key={produto.id} style={styles.card}>
            <div style={styles.cardBody}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaBeer size={32} strokeWidth={2} color={colorAzul} />
                <div>
                  <strong style={{ fontSize: '18px' }}>{produto.nome}</strong>
                  <br />
                  <small style={{ fontSize: '14px' }}>
                    Valor de Venda: {'R$ ' + produto.valorVenda}
                    {/* {produto.contatos?.length
                      ? produto.contatos.map(c => `${c.tipo}: ${c.valor}`).join(', ')
                      : 'Sem valor de venda'} */}
                  </small>
                  <br />
                  <strong style={{ fontSize: '10px' }}>Quantidade: {produto.quantidadeEstoque}</strong>
                </div>
              </div>

              <div style={styles.botoesCard}>
                <button
                  onClick={() => handleEditar(produto.id)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleExcluir(produto.id)}
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

// Estilização inline
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

export default Produtos;