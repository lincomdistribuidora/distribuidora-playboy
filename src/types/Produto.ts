// src/types/Produto.ts

// Interface que representa um produto no sistema
export interface Produto {
  id: string;                // Identificador único do produto
  nome: string;              // Nome do produto
  valorVenda: number;        // Valor de venda (em reais, formato numérico)
  quantidadeEstoque: number; // Quantidade disponível no estoque
}