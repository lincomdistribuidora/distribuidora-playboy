// src/pages/protected/DashboardClientePublico.tsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Importa a configuração do Firebase
import { useUser } from '../../contexts/UserContext'; // Importa o contexto do usuário

// Interface que representa a estrutura do cliente armazenado no Firestore
interface Cliente {
  id: string;
  nome: string;
  email: string;
  endereco: string;
}

const DashboardClientePublico: React.FC = () => {
  const { user } = useUser(); // Obtém os dados do usuário autenticado via contexto
  const [cliente, setCliente] = useState<Cliente | null>(null); // Estado para armazenar os dados do cliente
  const [loading, setLoading] = useState(true); // Estado de carregamento da requisição
  const [enderecoEditado, setEnderecoEditado] = useState(''); // Estado do campo de endereço que será editado

  /**
   * Efeito que roda ao carregar o componente para buscar os dados do cliente
   * do Firestore, utilizando o UID como chave primária (ID do documento).
   */
  useEffect(() => {
    const buscarCliente = async () => {
      if (!user?.uid) return;

      try {
        const clienteRef = doc(db, 'clientes', user.uid); // Busca documento pelo UID
        const docSnapshot = await getDoc(clienteRef);

        if (docSnapshot.exists()) {
          const dados = docSnapshot.data() as Omit<Cliente, 'id'>;
          const clienteEncontrado = { id: docSnapshot.id, ...dados };
          setCliente(clienteEncontrado); // Armazena cliente no estado
          setEnderecoEditado(clienteEncontrado.endereco); // Inicializa campo de edição
        } else {
          console.log('Cliente não encontrado com o UID:', user.uid);
        }
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
      } finally {
        setLoading(false); // Finaliza carregamento
      }
    };

    buscarCliente();
  }, [user]);

  /**
   * Atualiza o endereço do cliente no Firestore com o valor editado
   */
  const salvarEndereco = async () => {
    if (!cliente) return;

    try {
      const clienteRef = doc(db, 'clientes', cliente.id); // Referência ao documento do cliente
      await updateDoc(clienteRef, {
        endereco: enderecoEditado
      });

      // Atualiza o estado com o novo endereço após salvar
      setCliente((prev) => prev ? { ...prev, endereco: enderecoEditado } : null);
      alert('Endereço atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      alert('Erro ao salvar o endereço.');
    }
  };

  // Exibe um indicador enquanto os dados estão sendo carregados
  if (loading) return <p>Carregando dados...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard do Cliente</h1>

      {cliente ? (
        <div>
          <p><strong>ID:</strong> {cliente.id}</p>
          <p><strong>Nome:</strong> {cliente.nome}</p>
          <p><strong>Email:</strong> {cliente.email}</p>

          <div style={{ marginTop: '1rem' }}>
            <label><strong>Endereço:</strong></label><br />
            <input
              type="text"
              value={enderecoEditado}
              onChange={(e) => setEnderecoEditado(e.target.value)}
              style={{ padding: '0.5rem', width: '300px' }}
            />
            <br />
            <button
              onClick={salvarEndereco}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
            >
              Salvar Endereço
            </button>
          </div>
        </div>
      ) : (
        <p>Cliente não encontrado.</p>
      )}
    </div>
  );
};

export default DashboardClientePublico;