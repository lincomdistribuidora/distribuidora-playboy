import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import tipoServicoRepository from '../../repositories/TipoServicoRepository';
import Swal from 'sweetalert2';

/**
 * Cadastrar e Editar Tipos de Serviço com Paginação e Busca
 */
const CadastrarTipoServico = () => {
  const { id } = useParams();  // Obtém o ID do tipo de serviço a ser editado (se houver)
  const [tipoServico, setTipoServico] = useState<string>('');  // Estado para armazenar o nome do tipo de serviço
  const [tiposServico, setTiposServico] = useState<string[]>([]);  // Lista de tipos de serviço cadastrados
  const [editing, setEditing] = useState(false);  // Estado para controlar se estamos editando ou criando um novo
  const [search, setSearch] = useState<string>('');  // Estado de busca para filtrar tipos de serviço
  const [currentPage, setCurrentPage] = useState<number>(1);  // Página atual da listagem
  const [itemsPerPage] = useState<number>(10);  // Número de itens por página

  useEffect(() => {
    // Carregar os tipos de serviço ao carregar a página
    tipoServicoRepository.findAll()
      .then(setTiposServico)  // Atualiza o estado com os tipos de serviço
      .catch(console.error);  // Caso haja erro, apenas loga no console

    // Se estamos editando um tipo de serviço (se o ID existir)
    if (id) {
      tipoServicoRepository.findById(id)
        .then((tipoServicoData) => {
          if (tipoServicoData) {
            setTipoServico(tipoServicoData);  // Preenche o campo de tipo de serviço com os dados existentes
            setEditing(true);  // Marca como edição
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar tipo de serviço:', error);  // Erro ao buscar o tipo de serviço
        });
    }
  }, [id]);

  // Filtra os tipos de serviço com base na busca
  const filteredTiposServico = tiposServico.filter(tipo => tipo.toLowerCase().includes(search.toLowerCase()));

  // Ordena os tipos de serviço em ordem alfabética
  const sortedTiposServico = filteredTiposServico.sort((a, b) => a.localeCompare(b));

  // Paginação
  const indexOfLastTipo = currentPage * itemsPerPage;  // Índice do último tipo de serviço na página atual
  const indexOfFirstTipo = indexOfLastTipo - itemsPerPage;  // Índice do primeiro tipo de serviço na página atual
  const currentTiposServico = sortedTiposServico.slice(indexOfFirstTipo, indexOfLastTipo);  // Tipos de serviço da página atual

  /**
   * Atualiza o valor do tipo de serviço
   */
  const handleChange = (value: string) => {
    setTipoServico(value);  // Atualiza o estado do tipo de serviço
  };

  /**
   * Submete o formulário para salvar ou atualizar o tipo de serviço
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Evita o comportamento padrão do formulário

    try {
      if (id) {
        // Se estamos editando, atualiza o tipo de serviço
        await tipoServicoRepository.update(id, tipoServico);

        // Atualiza a lista de tipos de serviço sem precisar recarregar a página
        setTiposServico(tiposServico.map(tipo => tipo === id ? tipoServico : tipo));
      } else {
        // Caso contrário, cria um novo tipo de serviço
        await tipoServicoRepository.save({
          nome: tipoServico,
          criadoEm: new Date().toISOString(),  // Define a data de criação como a data atual
        });

        // Adiciona o novo tipo de serviço à lista sem precisar recarregar
        setTiposServico(prevTipos => [...prevTipos, tipoServico]);
      }

      // Exibe um alerta de sucesso
      await Swal.fire({
        icon: 'success',
        title: id ? 'Tipo de serviço atualizado!' : 'Tipo de serviço salvo!',
        text: id ? 'O tipo de serviço foi editado com sucesso.' : 'O tipo de serviço foi cadastrado com sucesso.',
        confirmButtonColor: colorAzul,
      });

      // Após o envio, limpa os campos e reseta o estado de edição
      setTipoServico('');
      setEditing(false);
    } catch (error) {
      console.error('Erro ao salvar tipo de serviço:', error);
      // Exibe um alerta de erro
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Não foi possível salvar o tipo de serviço.',
        confirmButtonColor: '#d33',
      });
    }
  };

  /**
   * Excluir o tipo de serviço
   */
  const handleDelete = async (tipo: string) => {
    try {
      await tipoServicoRepository.delete(tipo);  // Exclui o tipo de serviço

      // Atualiza a lista de tipos de serviço sem o tipo excluído
      setTiposServico(tiposServico.filter((item) => item !== tipo));

      // Exibe um alerta de sucesso
      await Swal.fire({
        icon: 'success',
        title: 'Tipo de serviço excluído!',
        text: 'O tipo de serviço foi excluído com sucesso.',
        confirmButtonColor: colorAzul,
      });
    } catch (error) {
      console.error('Erro ao excluir tipo de serviço:', error);
      // Exibe um alerta de erro
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Não foi possível excluir o tipo de serviço.',
        confirmButtonColor: '#d33',
      });
    }
  };

  /**
   * Função para mudar a página da listagem
   */
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);  // Altera a página atual

  return (
    <div className="menu-responsivel">
      <div className="container mt-5" style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>
          {editing ? 'Editar Tipo de Serviço' : 'Cadastrar Tipo de Serviço'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Nome do Tipo de Serviço */}
          <div className="mt-4">
            <label>Digite o tipo de serviço prestado:</label>
            <input
              type="text"
              className="form-control mt-2"
              value={tipoServico}
              onChange={(e) => handleChange(e.target.value)}
              required
            />
          </div>

          {/* Botões */}
          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              {editing ? 'Salvar Alterações' : 'Salvar Tipo de Serviço'}
            </button>
          </div>
        </form>

        {/* Campo de Busca */}
        <div className="mt-5">
          <label>Buscar Tipo de Serviço:</label>
          <input
            type="text"
            className="form-control mt-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}  // Atualiza o valor da busca
            placeholder="Digite o nome do tipo de serviço"
          />
        </div>

        {/* Lista de Tipos de Serviço */}
        <div className="mt-5">
          <h3>Tipos de Serviço Cadastrados</h3>
          <ul className="list-group mt-3">
            {currentTiposServico.map((tipo) => (
              <li key={tipo} className="list-group-item d-flex justify-content-between align-items-center">
                {tipo}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(tipo)}  // Chama a função de exclusão
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Paginação */}
        <div className="mt-4 d-flex justify-content-center">
          {Array.from({ length: Math.ceil(filteredTiposServico.length / itemsPerPage) }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}  // Muda a página
              className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'} mx-1`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CadastrarTipoServico;