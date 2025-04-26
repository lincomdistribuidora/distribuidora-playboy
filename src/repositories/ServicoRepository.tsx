import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import FirebaseService from '../services/FirebaseService';
import { Servico } from '../types/Servico';
import { Cliente } from '../types/Cliente';

class ServicoRepository {
  async save(servico: Servico) {
    await FirebaseService.saveData('servicos', servico);
  }

  async findAll(): Promise<Servico[]> {
    const snapshot = await getDocs(collection(db, 'servicos'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        tipo: data.tipo || '',
        valor: data.valor || '',
        cliente: data.cliente as Cliente || undefined // 👈 importante
      };
    });
  }

  async findById(id: string): Promise<Servico> {
    const ref = doc(db, 'servicos', id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      throw new Error('Serviço não encontrado');
    }

    const data = snapshot.data();

    return {
      id: snapshot.id,
      tipo: data.tipo || '',
      valor: data.valor || '',
      cliente: data.cliente as Cliente || undefined  || null // 👈 importante
    };
  }

  async update(id: string, servico: Servico) {
    const servicoRef = doc(db, 'servicos', id);
    await updateDoc(servicoRef, {
      tipo: servico.tipo,
      valor: servico.valor,
      cliente: servico.cliente
    });
  }

  async delete(id: string) {
    await deleteDoc(doc(db, 'servicos', id));
  }
}

export default new ServicoRepository();