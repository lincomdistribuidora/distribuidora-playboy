import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import ProdutoRepository from '../../repositories/ProdutoRepository';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';

const CadastrarProduto = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const fromVenda = location.state?.fromVenda;

  const [nome, setNome] = useState('');
  const [valorVenda, setValorVenda] = useState<number>(0);
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');

  useEffect(() => {
    if (id) {
      ProdutoRepository.findById(id)
        .then((produto) => {
          if (produto) {
            setNome(produto.nome || '');
            setValorVenda(produto.valorVenda || 0);
            setQuantidadeEstoque(produto.quantidadeEstoque || '');
          }
        })
        .catch(console.error);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const produto = {
      nome,
      valorVenda,
      quantidadeEstoque,
      criadoEm: new Date().toISOString(),
    };

    try {
      let novoProduto;
      if (id) {
        await ProdutoRepository.update(id, produto);
        novoProduto = { ...produto, id };  // Garante que o ID seja passado ao voltar
      } else {
        const produtoSalvo = await ProdutoRepository.save(produto);
        novoProduto = produtoSalvo;  // Se o save já retorna o produto com ID
      }

      await Swal.fire({
        icon: 'success',
        title: id ? 'Produto atualizado!' : 'Produto cadastrado!',
        confirmButtonColor: colorAzul,
      });

      if (fromVenda) {
        // Volta para a tela de venda enviando o produto criado
        navigate('/cadastrar-venda', { state: { produtoAdicionado: novoProduto } });
      } else {
        navigate('/produtos', { replace: true });
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Falha ao salvar produto.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="menu-responsivel">
      <div className="container mt-5" style={{ backgroundColor: '#F5F5F5', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>{id ? 'Editar Produto' : 'Cadastrar Produto'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="mt-3">
            <label>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Valor de venda */}
          <div className="mt-3">
            <label>Valor Venda:</label>
            <NumericFormat
              value={valorVenda}
              onValueChange={(values) => setValorVenda(values.floatValue || 0)}
              prefix="R$ "
              decimalSeparator=","
              thousandSeparator="."
              className="form-control"
              placeholder="Valor"
              allowNegative={false}
            />
          </div>

          {/* Quantidade Estoque */}
          <div className="mt-3">
            <label>Quantidade Estoque:</label>
            <input
              type="number"
              value={quantidadeEstoque}
              onChange={(e) => setQuantidadeEstoque(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Botões */}
          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              {id ? 'Salvar Alterações' : 'Salvar Produto'}
            </button>
            <button
              type="button"
              onClick={() => navigate(fromVenda ? '/cadastrar-venda' : '/produtos')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarProduto;