// src/pages/protected/MeusAgendamentos.tsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useUser } from '../../contexts/UserContext';

interface Servico {
  id: string;
  tipo: string;
  data: string;
  status: string;
}

const MeusAgendamentos: React.FC = () => {
  const { user } = useUser();
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    const buscarAgendamentos = async () => {
      if (!user?.uid) return;
      const q = query(
        collection(db, 'servicos'),
        where('uidCliente', '==', user.uid),
        where('status', '==', 'pendente')
      );

      const querySnapshot = await getDocs(q);
      const resultado: Servico[] = [];
      querySnapshot.forEach((doc) => {
        resultado.push({ id: doc.id, ...doc.data() } as Servico);
      });

      setServicos(resultado);
    };

    buscarAgendamentos();
  }, [user]);

  return (
    <div className="container mt-4">
      <h2>Meus Agendamentos Pendentes</h2>
      {servicos.length === 0 ? (
        <p>Você não possui agendamentos pendentes.</p>
      ) : (
        <ul>
          {servicos.map((servico) => (
            <li key={servico.id}>
              <strong>{servico.tipo}</strong> - {servico.data}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MeusAgendamentos;