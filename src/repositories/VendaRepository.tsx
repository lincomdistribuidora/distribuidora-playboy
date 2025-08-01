// src/repositories/VendaRepository.ts
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Venda } from '../types/Venda';
import { Produto } from '../types/Produto';
import { Cliente } from '../types/Cliente';

const VENDAS_COLLECTION = 'vendas';
const PRODUTOS_COLLECTION = 'produtos';
const CLIENTES_COLLECTION = 'clientes';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Debita estoque dos produtos vendidos */
const debitarEstoque = async (venda: Omit<Venda, 'id'>): Promise<void> => {
  for (const item of venda.produtos || []) {
    const prodRef = doc(db, PRODUTOS_COLLECTION, item.produtoId);
    const prodSnap = await getDoc(prodRef);
    if (!prodSnap.exists()) continue;

    const produto = prodSnap.data() as Produto;
    const estoqueAtual = Number(produto.quantidadeEstoque || 0);
    const novoEstoque = Math.max(estoqueAtual - item.quantidade, 0);

    await updateDoc(prodRef, { quantidadeEstoque: String(novoEstoque) });
  }
};

/** Reverte estoque dos produtos da venda antiga */
const reporEstoque = async (vendaAntiga: Venda): Promise<void> => {
  for (const item of vendaAntiga.produtos || []) {
    const prodRef = doc(db, PRODUTOS_COLLECTION, item.produtoId);
    const prodSnap = await getDoc(prodRef);
    if (!prodSnap.exists()) continue;

    const produto = prodSnap.data() as Produto;
    const estoqueAtual = Number(produto.quantidadeEstoque || 0);
    const novoEstoque = estoqueAtual + item.quantidade;

    await updateDoc(prodRef, { quantidadeEstoque: String(novoEstoque) });
  }
};

/** Debita saldo do cliente caso total pago seja menor que o total da venda */
const debitarSaldoCliente = async (venda: Omit<Venda, 'id'>): Promise<void> => {
  if (!venda.clienteId) return;

  const clienteRef = doc(db, CLIENTES_COLLECTION, venda.clienteId);
  const clienteSnap = await getDoc(clienteRef);
  if (!clienteSnap.exists()) return;

  const cliente = clienteSnap.data() as Cliente;
  const saldoAtual = Number(cliente.saldo || 0);

  const totalPago = venda.pagamentos?.reduce((acc, pag) => acc + (pag.valor || 0), 0) || 0;
  const valorVenda = parseFloat(venda.valor || '0');

  if (isNaN(valorVenda)) {
    console.warn('Venda com valor inválido para debitarSaldoCliente:', venda);
    return;
  }

  const valorRestante = valorVenda - totalPago;

  // Só debita se há valor pendente
  if (valorRestante > 0) {
    const novoSaldo = saldoAtual - valorRestante;
    await updateDoc(clienteRef, { saldo: novoSaldo });
  }
};

/** Reverte o saldo do cliente (ex: ao excluir ou editar uma venda) */
const reporSaldoCliente = async (venda: Venda): Promise<void> => {
  const clienteId = venda.cliente?.id || venda.clienteId;
  if (!clienteId) return;

  const clienteRef = doc(db, CLIENTES_COLLECTION, clienteId);
  const clienteSnap = await getDoc(clienteRef);
  if (!clienteSnap.exists()) return;

  const cliente = clienteSnap.data() as Cliente;
  const saldoAtual = Number(cliente.saldo || 0);

  const totalPago = venda.pagamentos?.reduce((acc, pag) => acc + (pag.valor || 0), 0) || 0;
  const valorVenda = parseFloat(venda.valor || '0');

  if (isNaN(valorVenda)) {
    console.warn('Venda com valor inválido para reporSaldoCliente:', venda);
    return;
  }

  // Repõe o valor que havia sido debitado
  const valorQueHaviaSidoDebitado = valorVenda - totalPago;
  const novoSaldo = saldoAtual + valorQueHaviaSidoDebitado;
  await updateDoc(clienteRef, { saldo: novoSaldo });
};

/* -------------------------------------------------------------------------- */
/* CRUD                                                                       */
/* -------------------------------------------------------------------------- */

const findAll = async (): Promise<Venda[]> => {
  const snap = await getDocs(collection(db, VENDAS_COLLECTION));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Venda[];
};

const findById = async (id: string): Promise<Venda> => {
  const vendaSnap = await getDoc(doc(db, VENDAS_COLLECTION, id));
  return { id: vendaSnap.id, ...vendaSnap.data() } as Venda;
};

const save = async (venda: Omit<Venda, 'id'>): Promise<void> => {
  const docRef = await addDoc(collection(db, VENDAS_COLLECTION), venda);
  await updateDoc(docRef, { id: docRef.id });

  await debitarEstoque(venda);
  await debitarSaldoCliente(venda); // ✅ AGORA FUNCIONA CORRETAMENTE
};

const update = async (id: string, venda: Venda): Promise<void> => {
  const docRef = doc(db, VENDAS_COLLECTION, id);

  const vendaAntigaSnap = await getDoc(docRef);
  if (vendaAntigaSnap.exists()) {
    const vendaAntiga = vendaAntigaSnap.data() as Venda;
    await reporEstoque(vendaAntiga);
    await reporSaldoCliente(vendaAntiga);
  }

  const { id: _, ...dadosSemId } = venda;
  await updateDoc(docRef, dadosSemId);

  await debitarEstoque(venda);
  await debitarSaldoCliente(venda);
};

const remove = async (id: string): Promise<void> => {
  const docRef = doc(db, VENDAS_COLLECTION, id);
  const vendaSnap = await getDoc(docRef);
  if (vendaSnap.exists()) {
    const venda = vendaSnap.data() as Venda;
    await reporEstoque(venda);
    await reporSaldoCliente(venda);
  }

  await deleteDoc(docRef);
};

const calcularSaldoFuturoCliente = async (venda: Omit<Venda, 'id'>): Promise<number | null> => {
  if (!venda.cliente?.id && !venda.clienteId) return null;

  const clienteId = venda.cliente?.id || venda.clienteId;

  const clienteRef = doc(db, CLIENTES_COLLECTION, clienteId);
  const clienteSnap = await getDoc(clienteRef);
  if (!clienteSnap.exists()) return null;

  const cliente = clienteSnap.data() as Cliente;
  const saldoAtual = Number(cliente.saldo || 0);

  const totalPago = venda.pagamentos?.reduce((acc, pag) => acc + (pag.valor || 0), 0) || 0;
  const valorVenda = parseFloat(venda.valor || '0');

  if (isNaN(valorVenda)) return null;

  const valorRestante = valorVenda - totalPago;

  const novoSaldo = saldoAtual + valorRestante;

  return novoSaldo;
};

export default {
  findAll,
  findById,
  save,
  update,
  remove,
  calcularSaldoFuturoCliente,
};