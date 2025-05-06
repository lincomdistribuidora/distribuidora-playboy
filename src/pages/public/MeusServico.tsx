import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import servicoRepository from '../../repositories/ServicoRepository';

interface Servico {
  id: string;
  tipo: string;
  valor: string;
  criadoEm?: string;
  status?: string;
  data?: any; // se usar no futuro
}

const MeusServicos: React.FC = () => {
  const { user } = useUser();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarServicosDoCliente = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const resultado = await servicoRepository.findByClienteId(user.uid);
        
        // opcional: filtrar status = 'finalizado'
        // const finalizados = resultado.filter(servico => servico.status === 'finalizado');

        // setServicos(finalizados);
      } catch (err) {
        console.error('Erro ao buscar serviços do cliente:', err);
        setErro('Erro ao carregar seus serviços. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    buscarServicosDoCliente();
  }, [user]);

  const formatarData = (data?: string) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mt-4">
      <h2>Histórico de Serviços</h2>

      {loading ? (
        <p>Carregando serviços...</p>
      ) : erro ? (
        <p style={{ color: 'red' }}>{erro}</p>
      ) : servicos.length === 0 ? (
        <p>Você ainda não tem serviços finalizados.</p>
      ) : (
        <ul>
          {servicos.map((servico) => (
            <li key={servico.id}>
              <strong>{servico.tipo}</strong> — {formatarData(servico.criadoEm)} — R$ {servico.valor}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MeusServicos;