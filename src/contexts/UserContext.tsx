// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Importa a configuração do Firebase (auth)

// Definindo o tipo do usuário que será armazenado no estado do contexto
interface User {
  email: string | null;    // E-mail do usuário
  uid: string | null;      // ID único do usuário (identificador único)
  displayName: string | null; // Nome exibido do usuário (caso tenha configurado no Firebase)
}

// Tipo do contexto de usuário que será acessado por outros componentes
interface UserContextType {
  user: User | null;         // Estado do usuário (pode ser null se não houver usuário logado)
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Função para atualizar o estado do usuário
  logout: () => void;        // Função para fazer o logout do usuário
}

// Criando o contexto de usuário
// Este contexto será utilizado para compartilhar o estado do usuário entre os componentes
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provedor do contexto de usuário
// Este componente envolve outros componentes para fornecer acesso ao estado de usuário
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Estado para armazenar os dados do usuário

  // Efeito para verificar se o usuário está autenticado sempre que o componente for montado
  useEffect(() => {
    // onAuthStateChanged é uma função do Firebase que monitora o estado de autenticação do usuário
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Se o usuário estiver autenticado, armazenamos seus dados no estado
        setUser({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
        });
      } else {
        // Se o usuário não estiver autenticado, definimos o estado como null
        setUser(null);
      }
    });

    // Limpeza do efeito (desinscreve o listener) quando o componente for desmontado
    return unsubscribe;
  }, []); // O array vazio [] significa que este efeito será executado apenas uma vez, quando o componente for montado

  // Função para fazer logout do usuário
  const logout = () => {
    signOut(auth) // Função do Firebase para deslogar o usuário
      .then(() => {
        setUser(null); // Após o logout, limpamos o estado do usuário
      })
      .catch((error) => {
        console.error('Erro ao fazer logout:', error); // Log de erro em caso de falha no logout
      });
  };

  // Fornecendo o contexto para os componentes filhos
  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children} {/* Renderiza os filhos do provedor, permitindo que acessem o estado do usuário */}
    </UserContext.Provider>
  );
};

// Hook personalizado para acessar o contexto de usuário
// Esse hook será utilizado por outros componentes para obter o estado do usuário
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    // Se o hook for utilizado fora de um provedor, lança um erro
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context; // Retorna o contexto com os dados do usuário
};