import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul, colorBranco } from '../../values/colors';
import servicoeRepository from '../../repositories/ServicoRepository';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';

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

interface Servico {
  tipo: string;
  valor: string;
  nomeCliente: string;
}

const CadastrarServico = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [servico, setServico] = useState<Servico>({
    tipo: '',
    valor: '',
    nomeCliente: '',
  });

  useEffect(() => {
    if (id) {
      servicoeRepository.findById(id)
        .then((servicoData) => {
          if (servicoData) {
            setServico({
              tipo: servicoData.tipo || '',
              valor: servicoData.valor || '',
              nomeCliente: servicoData.nomeCliente || '',
            });
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar serviço:', error);
        });
    }
  }, [id]);

  const handleChange = (field: keyof Servico, value: string) => {
    setServico((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  return (
    <div className='menu-responsivel'>
      <div className="container mt-5" style={{ backgroundColor: '#F5F5F5', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>
          {id ? 'Editar Serviço' : 'Cadastrar Serviço'}
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Tipo do Serviço */}
          <div className="mt-4">
            <label>Tipo do Serviço:</label>
            <select
              value={servico.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className="form-control mt-2"
              required
            >
              <option value="" disabled>Selecione...</option>
              {servicosDisponiveis.map((tipo, index) => (
                <option key={index} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
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

          {/* Nome do Cliente */}
          <div className="mt-4">
            <label>Nome do Cliente:</label>
            <input
              type="text"
              placeholder="Ex: João da Silva (Verificar se relaciona ao cliente)"
              value={servico.nomeCliente}
              onChange={(e) => handleChange('nomeCliente', e.target.value)}
              className="form-control mt-2"
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