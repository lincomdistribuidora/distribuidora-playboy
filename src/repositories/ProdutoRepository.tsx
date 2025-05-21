// src/repositories/ProdutoRepository.ts

import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc, // <-- importar deleteDoc
} from 'firebase/firestore';
import { Produto } from '../types/Produto';

const COLLECTION_NAME = 'produtos';

const findAll = async (): Promise<Produto[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Produto[];
};

const findById = async (id: string): Promise<Produto> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const produtoDoc = await getDoc(docRef);
  return { id: produtoDoc.id, ...produtoDoc.data() } as Produto;
};

const save = async (produto: Produto): Promise<void> => {
  await addDoc(collection(db, COLLECTION_NAME), produto);
};

const update = async (id: string, produto: Produto): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, produto);
};

const updateEstoque = async (id: string, novaQuantidade: number): Promise<void> => {
  const produto = await findById(id);
  await update(id, { ...produto, quantidadeEstoque: novaQuantidade });
};

// ✅ Novo método para deletar produto
const deleteProduto = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

export default {
  findAll,
  findById,
  save,
  update,
  updateEstoque,
  delete: deleteProduto, // <-- Aqui você mapeia "delete" para o método correto
};