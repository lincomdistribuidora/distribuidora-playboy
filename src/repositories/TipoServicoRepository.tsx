import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Importando a configuração do Firestore

class TipoServicoRepository {
  /**
   * Salva um novo tipo de serviço
   * @param tipoServico Objeto contendo o nome do tipo de serviço e a data de criação
   */
  async save(tipoServico: { nome: string; criadoEm: string }): Promise<void> {
    const tipoServicoRef = doc(collection(db, 'tipo-servico')); // Agora com hífen
    await setDoc(tipoServicoRef, {
      nome: tipoServico.nome,
      criadoEm: tipoServico.criadoEm
    });
  }

  /**
   * Retorna todos os tipos de serviço cadastrados
   * @returns Lista de nomes de tipos de serviços
   */
  async findAll(): Promise<string[]> {
    const snapshot = await getDocs(collection(db, 'tipo-servico')); // Agora com hífen
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return data.nome || '';
    });
  }

  /**
   * Retorna um tipo de serviço pelo ID
   * @param id ID do tipo de serviço
   * @returns Nome do tipo de serviço
   */
  async findById(id: string): Promise<string | null> {
    const tipoServicoRef = doc(db, 'tipo-servico', id); // Agora com hífen
    const snapshot = await getDoc(tipoServicoRef);

    if (!snapshot.exists()) {
      throw new Error('Tipo de serviço não encontrado');
    }

    const data = snapshot.data();
    return data?.nome || null;
  }

  /**
   * Atualiza um tipo de serviço
   * @param id ID do tipo de serviço
   * @param tipoServico Nome do tipo de serviço
   */
  async update(id: string, tipoServico: string): Promise<void> {
    const tipoServicoRef = doc(db, 'tipo-servico', id); // Agora com hífen
    await updateDoc(tipoServicoRef, { nome: tipoServico });
  }

  /**
   * Exclui um tipo de serviço
   * @param id ID do tipo de serviço a ser excluído
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tipo-servico', id)); // Agora com hífen
  }
}

export default new TipoServicoRepository();