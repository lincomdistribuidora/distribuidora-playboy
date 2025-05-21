// src/repositories/ClienteRepository.ts

import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc, // import necessário para deletar documentos
} from 'firebase/firestore';
import { Cliente } from '../types/Cliente';

const COLLECTION_NAME = 'clientes';

// Busca todos os clientes
const findAll = async (): Promise<Cliente[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Cliente[];
};

// Busca um cliente pelo ID
const findById = async (id: string): Promise<Cliente> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const clienteDoc = await getDoc(docRef);
  return { id: clienteDoc.id, ...clienteDoc.data() } as Cliente;
};

// Salva um novo cliente
const save = async (cliente: Cliente): Promise<void> => {
  await addDoc(collection(db, COLLECTION_NAME), cliente);
};

// Atualiza um cliente existente
const update = async (id: string, cliente: Cliente): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, cliente);
};

// Remove um cliente (delete)
const remove = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

// Adiciona débito ao cliente (saldo negativo)
const adicionarDebito = async (id: string, valor: number): Promise<void> => {
  const cliente = await findById(id);
  const novoSaldo = (cliente.saldo || 0) - valor;
  await update(id, { ...cliente, saldo: novoSaldo });
};

// Adiciona crédito ao cliente (saldo positivo)
const adicionarCredito = async (id: string, valor: number): Promise<void> => {
  const cliente = await findById(id);
  const novoSaldo = (cliente.saldo || 0) + valor;
  await update(id, { ...cliente, saldo: novoSaldo });
};

export default {
  findAll,
  findById,
  save,
  update,
  remove, // agora disponível para uso
  adicionarDebito,
  adicionarCredito,
};