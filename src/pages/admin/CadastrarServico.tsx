import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import servicoeRepository from '../../repositories/ServicoRepository';
import clienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';
import { Servico } from '../../types/Servico';
import { Cliente } from '../../types/Cliente';
import Select from 'react-select';

/**
 * Lista fixa dos tipos de serviços disponíveis.
 */
const servicosDisponiveis = [
  "Limpeza Técnica",
  "Higienização de Banco - Tecido/Couro",
  "Higienização Interna",
  "Descontaminação e Vitrificação Vidros",
  "Descontaminação e Cristalização de Pinturas",
  "Limpeza de Motor",
  "Polimento de Farol",
  "Polimento de Prata",
  "Polimento Ouro",
  "Vitrificação de Banco de Couro",
  "Vitrificação de Plástico Externo",
  "Vitrificação de Pintura",
  "Vitrificação de Pintura de Moto",
  "OUTRAS OPÇÕES"
];

const CadastrarServico = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servico, setServico] = useState<Servico>({
    id: '',
    tipo: '',
    valor: '',
    cliente: {
      id: '',
      nome: '',
      contatos: [],
    }
  });

  useEffect(() => {
    // Busca todos os clientes ao carregar a tela
    clienteRepository.findAll().then(setClientes).catch(console.error);

    // Se estiver editando, carrega o serviço pelo ID
    if (id) {
      servicoeRepository.findById(id)
        .then((servicoData) => {
          if (servicoData) {
            setServico({
              id: servicoData.id,
              tipo: servicoData.tipo || '',
              valor: servicoData.valor || '',
              cliente: servicoData.cliente || { id: '', nome: '', contatos: [] }
            });
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar serviço:', error);
        });
    }
  }, [id]);

  /**
   * Atualiza um campo simples do serviço (tipo ou valor)
   */
  const handleChange = (field: keyof Servico, value: string) => {
    setServico((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Função para filtrar clientes no campo de pesquisa
   */
  const handleClientSearch = (search: string) => {
    return clientes
      .filter(cliente => cliente.nome.toLowerCase().includes(search.toLowerCase()))
      .map(cliente => ({
        value: cliente.id,
        label: cliente.nome,
      }));
  };

  /**
   * Submete o formulário para salvar ou atualizar o serviço
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (id) {
        await servicoeRepository.update(id, servico);
      } else {
        await servicoeRepository.save({
          ...servico,
          criadoEm: new Date().toISOString(),
        });
      }

      await Swal.fire({
        icon: 'success',
        title: id ? 'Serviço atualizado!' : 'Serviço salvo!',
        text: id ? 'O serviço foi editado com sucesso.' : 'O serviço foi cadastrado com sucesso.',
        confirmButtonColor: colorAzul,
      });

      navigate('/servicos', { replace: true });
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Não foi possível salvar o serviço.',
        confirmButtonColor: '#d33',
      });
    }
  };

  // Formatação para os dados do React-Select
  const servicosOptions = servicosDisponiveis.map((servicoTipo) => ({
    value: servicoTipo,
    label: servicoTipo
  }));

  return (
    <div className='menu-responsivel'>
      <div className="container mt-5" style={{ backgroundColor: '#F5F5F5', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>
          {id ? 'Editar Serviço' : 'Cadastrar Serviço'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Tipo do Serviço com React-Select */}
          <div className="mt-4">
            <label>Tipo do Serviço:</label>
            <Select
              value={servicosOptions.find(option => option.value === servico.tipo)}
              onChange={(selectedOption) => handleChange('tipo', selectedOption?.value || '')}
              options={servicosOptions}
              className="mt-2"
              placeholder="Selecione..."
              required
            />
          </div>

          {/* Valor */}
          <div className="mt-4">
            <label>Valor:</label>
            <NumericFormat
              placeholder='R$ 150,00'
              value={servico.valor}
              onValueChange={(values) => handleChange('valor', values.value)}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              className="form-control mt-2"
              required
            />
          </div>

          {/* Cliente */}
          <div className="mt-4">
            <label>Nome do Cliente:</label>
            <Select
              value={servico.cliente?.id ? { value: servico.cliente.id, label: servico.cliente.nome } : null}
              onChange={(selectedOption) => {
                const selectedCliente = clientes.find(c => c.id === selectedOption?.value);
                if (selectedCliente) {
                  setServico(prev => ({
                    ...prev,
                    cliente: {
                      id: selectedCliente.id,
                      nome: selectedCliente.nome,
                      contatos: selectedCliente.contatos,
                    }
                  }));
                }
              }}
              options={handleClientSearch('')}  // Passando as opções filtradas aqui
              className="mt-2"
              placeholder="Digite o nome do cliente"
              required
            />
          </div>

          {/* Botões */}
          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              {id ? 'Salvar Alterações' : 'Salvar Serviço'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/servicos')}
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

export default CadastrarServico;