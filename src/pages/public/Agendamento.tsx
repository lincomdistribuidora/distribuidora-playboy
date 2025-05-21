import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaCarSide, FaMotorcycle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { colorAzul, colorBranco } from '../../values/colors';
import { FaSpinner } from 'react-icons/fa'; // Ícone de spinner
// import { db } from '../../firebase'; // Importe a instância do Firestore
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Alterado de useHistory para useNavigate

const tiposVeiculo = [
  { value: "carro", label: "Carro", icon: <FaCarSide size={20} style={{ marginRight: '8px' }} /> },
  { value: "moto", label: "Moto", icon: <FaMotorcycle size={20} style={{ marginRight: '8px' }} /> }
];

const tiposCarro = ["Hatch", "Sedan", "SUV"];

const Agendamento = () => {
  const { register, handleSubmit, formState: { errors }, resetField } = useForm();
  const [servicosDisponiveis, setServicosDisponiveis] = useState<string[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // estado do spinner
  const [loadingServices, setLoadingServices] = useState<boolean>(true); // Carregamento dos serviços
  const navigate = useNavigate(); // Inicializando o navigate

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, 'tipo-servico'); // Caminho correto para os serviços
        const serviceSnapshot = await getDocs(servicesCollection);
        const servicesList = serviceSnapshot.docs.map(doc => doc.data().nome);
        
        if (servicesList.length === 0) {
          // Exibe o alerta com a opção de navegar para outra página ou continuar no agendamento
          Swal.fire({
            icon: 'info',
            title: 'Nenhum serviço disponível',
            text: 'Atualmente não há serviços disponíveis, mas você pode ir para a página de como chegar ou continuar com o agendamento.',
            showCancelButton: true,
            cancelButtonText: 'Continuar no agendamento',
            confirmButtonText: 'Ir para Como Chegar',
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/como-chegar'); // Usando navigate para redirecionar
            }
          });
        }
        
        setServicosDisponiveis(servicesList);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os serviços disponíveis no momento.'
        });
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [navigate]);

  const handleCheckboxChangeServico = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = evento.target;
    setServicosSelecionados(prev =>
      checked ? [...prev, value] : prev.filter(servico => servico !== value)
    );
  };

  const handleRadioChangeTipo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setTipoSelecionado(evento.target.value);
    resetField('marca');
    resetField('modelo');
    resetField('tipoCarro');
  };

  const onSubmit = async (data: any) => {
    if (!tipoSelecionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Selecione o tipo de veículo (carro ou moto).'
      });
      return;
    }

    if (servicosSelecionados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Selecione pelo menos um serviço desejado.'
      });
      return;
    }

    if (!data.marca || !data.modelo) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Preencha todos os campos obrigatórios do veículo.'
      });
      return;
    }

    setIsLoading(true);

    const mensagem = `Olá Limcom! Meu nome é ${data.nome} e quero fazer um orçamento dos seguintes serviços:

Tipo de veículo:
 - ${tipoSelecionado === "carro" ? `Carro (${data.tipoCarro || "Tipo não informado"})` : "Moto"}

Marca: ${data.marca}
Modelo: ${data.modelo}

Serviços Selecionados:
${servicosSelecionados.map(servico => ` - ${servico}`).join("\n")}

Data: A combinar pelo WhatsApp.
Valor: A combinar pelo WhatsApp.

Aguardo um retorno, ${data.nome}!`;

    const whatsappURL = `https://wa.me/5527988792730?text=${encodeURIComponent(mensagem)}`;
    
    // Simular um pequeno tempo de carregamento para UX
    setTimeout(() => {
      window.open(whatsappURL, '_blank');
      Swal.fire({
        icon: 'success',
        title: 'Mensagem enviada!',
        text: 'Você será redirecionado para o WhatsApp.',
        timer: 3000,
        showConfirmButton: false
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.opacity = '0.9';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.opacity = '1';
  };

  return (
    <div className="container mt-5" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '700px' }}>
      <h2 style={{ color: colorAzul, fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>📋 Agendar Serviço</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="form-label" style={{ color: colorAzul, fontSize: '18px' }}>
            Seu Nome <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className="form-control"
            {...register('nome', { required: 'O nome é obrigatório' })}
            placeholder="Digite seu nome..."
            style={{ fontSize: '16px', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
          />
          {errors.nome && errors.nome.message && (
            <p style={{ color: 'red', fontSize: '14px' }}>
              {errors.nome.message as string}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label" style={{ color: colorAzul, fontSize: '18px' }}>Tipo</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {tiposVeiculo.map(tipo => (
              <motion.label
                key={tipo.value}
                htmlFor={tipo.value}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: tipoSelecionado === tipo.value ? '#d0ebff' : '#f9f9f9',
                  border: `1px solid ${colorAzul}`,
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  color: '#333',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={tipo.value}
                  checked={tipoSelecionado === tipo.value}
                  onChange={handleRadioChangeTipo}
                  id={tipo.value}
                  style={{ display: 'none' }}
                />
                {tipo.icon}
                {tipo.label}
              </motion.label>
            ))}
          </div>
        </div>

        {tipoSelecionado && (
          <>
            <div className="mb-4">
              <label className="form-label" style={{ color: colorAzul, fontSize: '18px' }}>
                Marca <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                className="form-control"
                {...register('marca')}
                placeholder="Digite a marca..."
                style={{ fontSize: '16px', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label" style={{ color: colorAzul, fontSize: '18px' }}>
                Modelo <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                className="form-control"
                {...register('modelo')}
                placeholder="Digite o modelo..."
                style={{ fontSize: '16px', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
              />
            </div>

            {tipoSelecionado === "carro" && (
              <div className="mb-4">
                <label className="form-label" style={{ color: colorAzul, fontSize: '18px' }}>
                  Tipo de Carro (Opcional)
                </label>
                <select
                  className="form-select"
                  {...register('tipoCarro')}
                  style={{ fontSize: '16px', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
                >
                  <option value="">Selecione...</option>
                  {tiposCarro.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div className="mb-4">
          <label className="form-label" style={{ color: colorAzul, fontSize: '18px', marginBottom: '10px' }}>
            Serviços Desejados <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {loadingServices ? (
              <div>Carregando serviços...</div>
            ) : (
              servicosDisponiveis.length > 0 ? (
                servicosDisponiveis.map(servico => (
                  <motion.label
                    key={servico}
                    htmlFor={servico}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: servicosSelecionados.includes(servico) ? '#d4edda' : '#f9f9f9',
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
                      onChange={handleCheckboxChangeServico}
                      id={servico}
                      style={{ marginRight: '10px' }}
                    />
                    {servico}
                  </motion.label>
                ))
              ) : (
                <div>Nenhum serviço disponível no momento</div>
              )
            )}
          </div>
        </div>

        <motion.button
          type="submit"
          className="btn"
          whileTap={{ scale: 0.95 }}
          style={{
            backgroundColor: colorAzul,
            color: colorBranco,
            fontSize: '18px',
            padding: '12px 30px',
            borderRadius: '10px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>💬 Enviar via WhatsApp</>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default Agendamento;