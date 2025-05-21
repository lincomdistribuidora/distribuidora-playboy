// src/types/Cliente.ts

/**
 * Representa um tipo de contato do cliente, como telefone ou email.
 */
export interface Contato {
  tipo: string;   // Exemplo: 'telefone', 'email'
  valor: string;  // Exemplo: '(11) 91234-5678', 'exemplo@email.com'
}

/**
 * Representa o endereço do cliente.
 */
export interface Endereco {
  rua: string;           // Nome da rua
  numero: string;        // Número do imóvel
  bairro: string;        // Bairro
  cidade: string;        // Cidade
  estado: string;        // Estado (sigla)
  cep: string;           // Código postal
}

export interface Cliente {
  id: string;                   // Identificador único no banco
  nome: string;                 // Nome completo do cliente
  contatos: Contato[];          // Lista de contatos (telefone, email, etc.)
  endereco?: Endereco;          // Endereço do cliente (opcional)
  saldo: number;                // Saldo do cliente (obrigatório para evitar undefined)
}