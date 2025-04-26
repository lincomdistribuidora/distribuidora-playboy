import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { colorAzul, colorBranco } from '../../values/colors';

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

const Agendamento = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);

  const handleCheckboxChange = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = evento.target;
    setServicosSelecionados(prev =>
      checked ? [...prev, value] : prev.filter(servico => servico !== value)
    );
  };

  const onSubmit = (data: any) => {
    const mensagem = `Olá Rômulo! Meu nome é ${data.nome} e quero fazer um orçamento dos seguintes serviços: 

Serviços Selecionados:
${servicosSelecionados.map(servico => ` - ${servico}`).join("\n")}

Data: A combinar pelo WhatsApp.
Valor: A combinar pelo WhatsApp.

Aguardo um retorno, ${data.nome}!`;

    const whatsappURL = `https://wa.me/5527988792730?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="container mt-5" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '700px' }}>
      <h2 style={{ color: colorAzul, fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>📋 Agendar Serviço</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="form-label" style={{ color: colorAzul, fontSize: '18px' }}>Seu Nome</label>
          <input
            className="form-control"
            {...register('nome', { required: 'O nome é obrigatório' })}
            placeholder="Digite seu nome..."
            style={{ fontSize: '16px', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
          />
          {errors.nome && <p style={{ color: 'red', fontSize: '14px' }}>{errors.nome.message}</p>}
        </div>

        <div className="mb-4">
          <label className="form-label" style={{ color: colorAzul, fontSize: '18px', marginBottom: '10px' }}>Serviços Desejados</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {servicosDisponiveis.map(servico => (
              <label
                key={servico}
                htmlFor={servico}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f9f9f9',
                  border: `1px solid ${colorAzul}`,
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  color: '#333'
                }}
              >
                <input
                  type="checkbox"
                  value={servico}
                  onChange={handleCheckboxChange}
                  id={servico}
                  style={{ marginRight: '10px' }}
                />
                {servico}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn"
          style={{
            backgroundColor: colorAzul,
            color: colorBranco,
            fontSize: '18px',
            padding: '12px 30px',
            borderRadius: '10px',
            border: 'none',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          💬 Enviar via WhatsApp
        </button>
      </form>
    </div>
  );
};

export default Agendamento;