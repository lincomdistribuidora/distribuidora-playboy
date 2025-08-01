// src/types/Venda.ts

export interface Pagamento {
  id: string;
  forma: 'Dinheiro' | 'Pix' | 'Débito' | 'Crédito';
  valor: number;
}

export interface ProdutoVenda {
  produtoId: string;
  nome: string;
  quantidade: number;
  preco: number;
  valorUnitario: number;
}

export interface Venda {
  id: string;

  /** Tipo de venda: ex: "Avista", "Parcelado" */
  tipo: string;

  /** Valor em formato de string por compatibilidade (ex: "100.00") */
  valor: string;

  /** Cliente completo */
  cliente: {
    id: string;
    nome: string;
    contatos: string[];
    saldo: number;
  };

  /** Lista de produtos vendidos */
  produtos: ProdutoVenda[];

  /** Lista de pagamentos realizados */
  pagamentos: Pagamento[];

  /** Valor total pago no momento da venda */
  pagamentoRecebido: number;

  /** Status da venda: ex: "Pendente" ou "Concluída" */
  status: string;

  /** ISO String da data de criação */
  criadoEm: string;

  /** Valor total da venda, calculado com base nos produtos */
  valorTotal: number;

  /** ID do cliente (redundante mas útil em algumas consultas) */
  clienteId?: string;
}