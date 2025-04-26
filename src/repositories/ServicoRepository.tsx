import { collection, getDocs, getDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import FirebaseService from '../services/FirebaseService';

class ServicoRepository {
  async save(servico: any) {
    await FirebaseService.saveData('servicos', servico);
  }

  async findAll() {
    const snapshot = await getDocs(collection(db, 'servicos'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findById(id: string) {
    const servicoRef = doc(db, 'servicos', id);
    const snapshot = await getDoc(servicoRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    } else {
      throw new Error('servico não encontrado');
    }
  }

  async update(id: string, servico: any) {
    const servicoRef = doc(db, 'servicos', id);
    await updateDoc(servicoRef, servico);
  }

  async delete(id: string) {
    await deleteDoc(doc(db, 'servicos', id));
  }
}

export default new ServicoRepository();