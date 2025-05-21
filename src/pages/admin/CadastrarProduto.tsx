import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import ProdutoRepository from '../../repositories/ProdutoRepository';
import Swal from 'sweetalert2';

// interface Contato {
//   tipo: string;
//   valor: string;
//   erro: string;
// }

const CadastrarProduto = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');

  // const [contatos, setContatos] = useState<Contato[]>([{ tipo: '', valor: '', erro: '' }]);
  // const [endereco, setEndereco] = useState({
  //   rua: '',
  //   numero: '',
  //   bairro: '',
  //   cidade: '',
  //   estado: '',
  //   cep: '',
  // });

  // Máscara para telefone/whatsapp
  // const applyMask = (tipo: string, value: string): string => {
  //   value = value.replace(/\D/g, '');
  //   if (tipo === 'Telefone' || tipo === 'WhatsApp') {
  //     if (value.length <= 2) return value.replace(/^(\d{0,2})/, '($1');
  //     else if (value.length <= 6) return value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  //     else return value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  //   }
  //   return value;
  // };

  // Validação para tipos de contato
  // s

  // Buscar dados se for edição
  useEffect(() => {
    if (id) {
      ProdutoRepository.findById(id)
        .then((produto) => {
          if (produto) {
            setNome(produto.nome || '');
            setValorVenda('' + produto.valorVenda || '');
            // setValorVenda('R$ ' + produto.valorVenda || '');
            setQuantidadeEstoque(produto.quantidadeEstoque || '');

            // const contatosCarregados = (produto.contatos || []).map((c: any) => ({
            //   tipo: c.tipo || '',
            //   valor: c.valor || '',
            //   erro: '',
            // }));


            // setContatos(contatosCarregados.length ? contatosCarregados : [{ tipo: '', valor: '', erro: '' }]);
            // setEndereco(produto.endereco || {
            //   rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: ''
            // });
          }
        })
        .catch(console.error);
    }
  }, [id]);

  // Adicionar novo contato
  // const handleAddContato = () => {
  //   setContatos([...contatos, { tipo: '', valor: '', erro: '' }]);
  // };

  // Remover contato
  // const handleRemoveContato = (index: number) => {
  //   const updated = [...contatos];
  //   updated.splice(index, 1);
  //   setContatos(updated);
  // };

  // Atualizar tipo do contato e limpar valor
  // const handleTipoChange = (index: number, value: string) => {
  //   const updated = [...contatos];
  //   updated[index].tipo = value;
  //   updated[index].valor = '';
  //   updated[index].erro = 'Campo obrigatório';
  //   setContatos(updated);
  // };

  // Atualizar valor e validar automaticamente
  // const handleContatoChange = (index: number, value: string) => {
  //   const updated = [...contatos];
  //   const tipo = updated[index].tipo;

  //   const valorFormatado = tipo === 'Telefone' || tipo === 'WhatsApp'
  //     ? applyMask(tipo, value)
  //     : value;

  //   updated[index].valor = valorFormatado;
  //   updated[index].erro = validateContato(tipo, valorFormatado);
  //   setContatos(updated);
  // };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Remove contatos totalmente vazios
    // const contatosPreenchidos = contatos.filter(c => c.tipo || c.valor);

    // Valida apenas os preenchidos
    // const contatosValidados = contatosPreenchidos.map((c) => ({
    //   ...c,
    //   erro: validateContato(c.tipo, c.valor),
    // }));

    // const contatosValidos = contatosValidados.filter(c => !c.erro && c.tipo && c.valor);

    // Verifica se ao menos um contato válido está presente
    // if (contatosValidos.length === 0) {
    //   await Swal.fire({
    //     icon: 'warning',
    //     title: 'É necessário pelo menos um contato válido!',
    //     confirmButtonColor: '#d33',
    //   });
    //   setContatos(contatosValidados);
    //   return;
    // }

    // setContatos(contatosValidados);

    const produto = {
      nome,
      valorVenda: valorVenda,
      quantidadeEstoque: quantidadeEstoque,
      // contatos: contatosValidos.map(({ tipo, valor }) => ({ tipo, valor })),
      // endereco,
      criadoEm: new Date().toISOString(),
    };

    try {
      if (id) {
        await ProdutoRepository.update(id, produto);
      } else {
        await ProdutoRepository.save(produto);
      }

      await Swal.fire({
        icon: 'success',
        title: id ? 'Produto atualizado!' : 'Produto cadastrado!',
        confirmButtonColor: colorAzul,
      });

      navigate('/produtos', { replace: true });
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
            <input
              type="text"
              value={valorVenda}
              onChange={(e) => setValorVenda(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Quantidade Estoque */}
          <div className="mt-3">
            <label>Quantidade Estoque:</label>
            <input
              type="text"
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
              onClick={() => navigate('/produtos')}
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