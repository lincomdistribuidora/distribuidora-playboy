import { collection, getDocs, getDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import FirebaseService from '../services/FirebaseService';

class ClienteRepository {
  async save(cliente: any) {
    await FirebaseService.saveData('clientes', cliente);
  }

  async findAll() {
    const snapshot = await getDocs(collection(db, 'clientes'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findById(id: string) {
    const clienteRef = doc(db, 'clientes', id);
    const snapshot = await getDoc(clienteRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    } else {
      throw new Error('Cliente não encontrado');
    }
  }

  async update(id: string, cliente: any) {
    const clienteRef = doc(db, 'clientes', id);
    await updateDoc(clienteRef, cliente);
  }

  async delete(id: string) {
    await deleteDoc(doc(db, 'clientes', id));
  }
}

export default new ClienteRepository();