// src/pages/cliente/CadastrarCliente.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul, colorBranco } from '../../values/colors';
import ClienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';

interface Contato {
  tipo: string;
  valor: string;
  erro: string;
}

const CadastrarCliente = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState('');
  const [contatos, setContatos] = useState<Contato[]>([{ tipo: '', valor: '', erro: '' }]);
  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  });

  const [saldo, setSaldo] = useState(0); // Saldo positivo (débito) ou negativo (crédito)

  const applyMask = (tipo: string, value: string): string => {
    value = value.replace(/\D/g, '');
    if (tipo === 'Telefone' || tipo === 'WhatsApp') {
      if (value.length <= 2) return value.replace(/^(\d{0,2})/, '($1');
      else if (value.length <= 6) return value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      else return value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    return value;
  };

  const validateContato = (tipo: string, valor: string): string => {
    if (!valor.trim()) return 'Campo obrigatório';

    if (tipo === 'Telefone' || tipo === 'WhatsApp') {
      const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      return telefoneRegex.test(valor) ? '' : 'Telefone inválido';
    }

    if (tipo === 'E-mail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(valor) ? '' : 'E-mail inválido';
    }

    return '';
  };

  useEffect(() => {
    if (id) {
      ClienteRepository.findById(id)
        .then((cliente) => {
          if (cliente) {
            setNome(cliente.nome || '');
            const contatosCarregados = (cliente.contatos || []).map((c: any) => ({
              tipo: c.tipo || '',
              valor: c.valor || '',
              erro: '',
            }));
            setContatos(contatosCarregados.length ? contatosCarregados : [{ tipo: '', valor: '', erro: '' }]);
            setEndereco(cliente.endereco || {
              rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: ''
            });
            setSaldo(Number(cliente.saldo || 0));
          }
        })
        .catch(console.error);
    }
  }, [id]);

  const handleAddContato = () => {
    setContatos([...contatos, { tipo: '', valor: '', erro: '' }]);
  };

  const handleRemoveContato = (index: number) => {
    const updated = [...contatos];
    updated.splice(index, 1);
    setContatos(updated);
  };

  const handleTipoChange = (index: number, value: string) => {
    const updated = [...contatos];
    updated[index].tipo = value;
    updated[index].valor = '';
    updated[index].erro = 'Campo obrigatório';
    setContatos(updated);
  };

  const handleContatoChange = (index: number, value: string) => {
    const updated = [...contatos];
    const tipo = updated[index].tipo;

    const valorFormatado = tipo === 'Telefone' || tipo === 'WhatsApp'
      ? applyMask(tipo, value)
      : value;

    updated[index].valor = valorFormatado;
    updated[index].erro = validateContato(tipo, valorFormatado);
    setContatos(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contatosPreenchidos = contatos.filter(c => c.tipo || c.valor);

    const contatosValidados = contatosPreenchidos.map((c) => ({
      ...c,
      erro: validateContato(c.tipo, c.valor),
    }));

    const contatosValidos = contatosValidados.filter(c => !c.erro && c.tipo && c.valor);

    if (contatosValidos.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'É necessário pelo menos um contato válido!',
        confirmButtonColor: '#d33',
      });
      setContatos(contatosValidados);
      return;
    }

    setContatos(contatosValidados);

    const cliente = {
      nome,
      contatos: contatosValidos.map(({ tipo, valor }) => ({ tipo, valor })),
      endereco,
      saldo, // campo unificado de crédito/débito
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
        title: id ? 'Cliente atualizado!' : 'Cliente cadastrado!',
        confirmButtonColor: colorAzul,
      });

      navigate('/clientes', { replace: true });
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Falha ao salvar cliente.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="menu-responsivel">
      <div className="container mt-5" style={{ backgroundColor: '#F5F5F5', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>{id ? 'Editar Cliente' : 'Cadastrar Cliente'}</h2>

        <form onSubmit={handleSubmit}>
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

          <div className="mt-3">
            <label>Contatos:</label>
            {contatos.map((contato, index) => (
              <div key={index} className="mt-2">
                <div className="d-flex gap-2">
                  <select
                    value={contato.tipo}
                    onChange={(e) => handleTipoChange(index, e.target.value)}
                    className="form-control"
                  >
                    <option value="">Tipo</option>
                    <option value="Telefone">Telefone</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="E-mail">E-mail</option>
                  </select>
                  <input
                    type="text"
                    placeholder="(xx) xxxxx-xxxx ou email@dominio.com"
                    value={contato.valor}
                    onChange={(e) => handleContatoChange(index, e.target.value)}
                    className={`form-control ${contato.erro ? 'is-invalid' : ''}`}
                  />
                  {contatos.length > 1 && (
                    <button type="button" onClick={() => handleRemoveContato(index)} className="btn btn-danger">
                      Remover
                    </button>
                  )}
                </div>
                {contato.erro && (
                  <small className="text-danger">{contato.erro}</small>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddContato}
              className="btn btn-sm mt-2"
              style={{ backgroundColor: colorAzul, color: colorBranco }}
            >
              Adicionar Contato
            </button>
          </div>

          {/* Campo de saldo com máscara e seletor de tipo (débito ou crédito) */}
          <div className="mt-3">
            <label>Saldo com o cliente:</label>
            <div className="d-flex gap-2">
              <select
                value={saldo < 0 ? 'credito' : 'debito'}
                onChange={(e) => {
                  const tipo = e.target.value;
                  setSaldo((prev) => Math.abs(prev) * (tipo === 'credito' ? -1 : 1));
                }}
                className="form-control"
                style={{ maxWidth: 150 }}
              >
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
              <NumericFormat
                value={Math.abs(saldo)}
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="R$ "
                className="form-control"
                onValueChange={(values) => {
                  const valor = values.floatValue || 0;
                  setSaldo(saldo < 0 ? -valor : valor);
                }}
              />
            </div>
            <div className="mt-1">
              {saldo < 0 && <span className="text-danger">💸 Cliente deve R$ {saldo.toFixed(2)}</span>}
              {saldo > 0 && <span className="text-success">💰 Cliente tem crédito de R$ {Math.abs(saldo).toFixed(2)}</span>}
              {saldo === 0 && <span className="text-muted">Cliente sem saldo pendente</span>}
            </div>
          </div>

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
