import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul, colorBranco } from '../../values/colors';
import ClienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';

interface Contato {
  tipo: string;
  valor: string;
}

const CadastrarCliente = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState('');
  const [contatos, setContatos] = useState<Contato[]>([{ tipo: '', valor: '' }]);
  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  });

  useEffect(() => {
    if (id) {
      ClienteRepository.findById(id)
        .then((cliente) => {
          if (cliente) {
            setNome(cliente.nome || '');
            setContatos(cliente.contatos || [{ tipo: 'Telefone', valor: '' }]);
            setEndereco(cliente.endereco || {
              rua: '',
              numero: '',
              bairro: '',
              cidade: '',
              estado: '',
              cep: '',
            });
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar cliente:', error);
        });
    }
  }, [id]);

  const handleAddContato = () => {
    setContatos([...contatos, { tipo: 'Telefone', valor: '' }]);
  };

  const handleRemoveContato = (index: number) => {
    const updated = [...contatos];
    updated.splice(index, 1);
    setContatos(updated);
  };

  const handleContatoChange = (index: number, field: keyof Contato, value: string) => {
    const updated = [...contatos];
    updated[index][field] = value;
    setContatos(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contatosValidos = contatos.filter(contato => contato.tipo.trim() && contato.valor.trim());

    if (contatos.length > 0 && contatosValidos.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Contato inválido!',
        text: 'Preencha pelo menos um contato completo ou remova os campos vazios.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    const cliente = {
      nome,
      contatos: contatosValidos,
      endereco,
      criadoEm: new Date().toISOString(),
    };

    try {
      if (id) {
        await ClienteRepository.update(id, cliente);
      } else {
        await ClienteRepository.save(cliente);
      }

      await Swal.fire({
        icon: 'success',
        title: id ? 'Cliente atualizado!' : 'Cliente salvo!',
        text: id ? 'O cliente foi editado com sucesso.' : 'O cliente foi cadastrado com sucesso.',
        confirmButtonColor: colorAzul,
      });

      navigate('/clientes', { replace: true });
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Não foi possível salvar o cliente.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className='menu-responsivel'>
      <div className="container mt-5" style={{ backgroundColor: '#F5F5F5', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>
          {id ? 'Editar Cliente' : 'Cadastrar Cliente'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="mt-3">
            <label>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Contatos */}
          <div className="mt-3">
            <label>Contatos:</label>
            {contatos.map((contato, index) => (
              <div key={index} className="d-flex gap-2 mt-2">
                <select
                  value={contato.tipo}
                  onChange={(e) => handleContatoChange(index, 'tipo', e.target.value)}
                  className="form-control"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="Telefone">Telefone</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="E-mail">E-mail</option>
                </select>
                <input
                  type="text"
                  placeholder="ex: (xx) xxxxx-xxxx email@dominio.com"
                  value={contato.valor}
                  onChange={(e) => handleContatoChange(index, 'valor', e.target.value)}
                  className="form-control"
                />
                {contatos.length > 1 && (
                  <button type="button" onClick={() => handleRemoveContato(index)} className="btn btn-danger">
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddContato} className="btn btn-sm mt-2" style={{ backgroundColor: colorAzul, color: colorBranco }}>
              Adicionar Contato
            </button>
          </div>

          {/* Endereço */}
          <div className="mt-4">
            <label>Endereço:</label>
            <input
              type="text"
              placeholder="Rua"
              value={endereco.rua}
              onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
              className="form-control mt-2"
              required
            />
            <input
              type="text"
              placeholder="Número"
              value={endereco.numero}
              onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
              className="form-control mt-2"
              required
            />
            <input
              type="text"
              placeholder="Bairro"
              value={endereco.bairro}
              onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
              className="form-control mt-2"
              required
            />
            <input
              type="text"
              placeholder="Cidade"
              value={endereco.cidade}
              onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
              className="form-control mt-2"
              required
            />
            <input
              type="text"
              placeholder="Estado"
              value={endereco.estado}
              onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })}
              className="form-control mt-2"
              required
            />
            <input
              type="text"
              placeholder="CEP"
              value={endereco.cep}
              onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
              className="form-control mt-2"
              required
            />
          </div>

          {/* Botões */}
          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              {id ? 'Salvar Alterações' : 'Salvar Cliente'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/clientes')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarCliente;