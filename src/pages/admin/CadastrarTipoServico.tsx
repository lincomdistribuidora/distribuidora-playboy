import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import tipoServicoRepository from '../../repositories/TipoServicoRepository';
import Swal from 'sweetalert2';

/**
 * Cadastrar e Editar Tipos de Serviço com Paginação e Busca
 */
const CadastrarTipoServico = () => {
  const { id } = useParams();
  const [tipoServico, setTipoServico] = useState<string>('');
  const [tiposServico, setTiposServico] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);  // Estado para controlar se estamos editando ou criando um novo
  const [search, setSearch] = useState<string>('');  // Estado de busca
  const [currentPage, setCurrentPage] = useState<number>(1);  // Página atual
  const [itemsPerPage] = useState<number>(10);  // Número de itens por página

  useEffect(() => {
    // Carregar os tipos de serviço ao carregar a página
    tipoServicoRepository.findAll().then(setTiposServico).catch(console.error);

    if (id) {
      tipoServicoRepository.findById(id)
        .then((tipoServicoData) => {
          if (tipoServicoData) {
            setTipoServico(tipoServicoData);
            setEditing(true);  // Marcando que estamos editando um tipo de serviço existente
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar tipo de serviço:', error);
        });
    }
  }, [id]);

  // Filtra os tipos de serviço com base na busca
  const filteredTiposServico = tiposServico.filter(tipo => tipo.toLowerCase().includes(search.toLowerCase()));

  // Paginação
  const indexOfLastTipo = currentPage * itemsPerPage;
  const indexOfFirstTipo = indexOfLastTipo - itemsPerPage;
  const currentTiposServico = filteredTiposServico.slice(indexOfFirstTipo, indexOfLastTipo);

  /**
   * Atualiza o tipo de serviço
   */
  const handleChange = (value: string) => {
    setTipoServico(value);
  };

  /**
   * Submete o formulário para salvar ou atualizar o tipo de serviço
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (id) {
        await tipoServicoRepository.update(id, tipoServico);
        // Atualiza o item na lista sem precisar recarregar a página
        setTiposServico(tiposServico.map(tipo => tipo === id ? tipoServico : tipo));
      } else {
        await tipoServicoRepository.save({
          nome: tipoServico,
          criadoEm: new Date().toISOString(),
        });
        // Adiciona o novo tipo de serviço à lista sem precisar recarregar
        setTiposServico(prevTipos => [...prevTipos, tipoServico]);
      }

      await Swal.fire({
        icon: 'success',
        title: id ? 'Tipo de serviço atualizado!' : 'Tipo de serviço salvo!',
        text: id ? 'O tipo de serviço foi editado com sucesso.' : 'O tipo de serviço foi cadastrado com sucesso.',
        confirmButtonColor: colorAzul,
      });

      // Após o envio, você pode resetar os campos
      setTipoServico('');
      setEditing(false);  // Resetar o estado de edição

    } catch (error) {
      console.error('Erro ao salvar tipo de serviço:', error);
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
      await tipoServicoRepository.delete(tipo);
      setTiposServico(tiposServico.filter((item) => item !== tipo));

      await Swal.fire({
        icon: 'success',
        title: 'Tipo de serviço excluído!',
        text: 'O tipo de serviço foi excluído com sucesso.',
        confirmButtonColor: colorAzul,
      });
    } catch (error) {
      console.error('Erro ao excluir tipo de serviço:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Não foi possível excluir o tipo de serviço.',
        confirmButtonColor: '#d33',
      });
    }
  };

  /**
   * Função para mudar a página
   */
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
            onChange={(e) => setSearch(e.target.value)}
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
                  onClick={() => handleDelete(tipo)}
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
              onClick={() => paginate(index + 1)}
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