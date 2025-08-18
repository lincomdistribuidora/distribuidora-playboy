// src/pages/cliente/CadastrarCliente.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul, colorBranco } from '../../values/colors';
import ClienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';
import { PlusCircle } from 'lucide-react';

import { ptBR } from 'date-fns/locale';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // ajuste o caminho se necessário

import { parseISO, format } from 'date-fns';

interface Contato {
  tipo: string;
  valor: string;
  erro: string;
}

import { Venda } from '../../types/Venda';
import { Cliente } from '../../types/Cliente';



const mesesTraduzidos: Record<string, string> = {
  January: 'Janeiro',
  February: 'Fevereiro',
  March: 'Março',
  April: 'Abril',
  May: 'Maio',
  June: 'Junho',
  July: 'Julho',
  August: 'Agosto',
  September: 'Setembro',
  October: 'Outubro',
  November: 'Novembro',
  December: 'Dezembro',
};

const CadastrarCliente = () => {

  const numMaximoDiasNoMes = 31

  const navigate = useNavigate();

  const [numDiasNoMes, setNumDiasNoMes] = useState(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"])

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



  const [vendas, setVendas] = useState<Venda[]>([]);
  const [erroVendas, setErroVendas] = useState<string | null>(null);
  const [agrupado, setAgrupado] = useState<any>({});

  const buscarVendasDoCliente = async (clienteId: string): Promise<any[]> => {
    try {
      const vendasRef = collection(db, 'vendas');
      const q = query(vendasRef, where('cliente.id', '==', clienteId));
      const snapshot = await getDocs(q);
      console.log("O valor de snapshot:")
      console.log(snapshot)

      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  };

  const agruparVendasPorData = (vendas: any[]) => {
    const agrupado: Record<string, Record<string, Record<string, any[]>>> = {};
    vendas.forEach(venda => {
      if (!venda.criadoEm) return; // pula vendas sem data
      const data = parseISO(venda.criadoEm);
      const ano = format(data, 'yyyy');
      const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
      const mes = capitalizar(format(data, 'MMMM', { locale: ptBR }));
      const dia = format(data, 'dd');
      if (!agrupado[ano]) agrupado[ano] = {};
      if (!agrupado[ano][mes]) agrupado[ano][mes] = {};
      if (!agrupado[ano][mes][dia]) agrupado[ano][mes][dia] = [];
      agrupado[ano][mes][dia].push(venda);
    });
    return agrupado;
  };

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
    const carregarClienteEHistorico = async () => {
      if (!id) return;

      try {
        const cliente = await ClienteRepository.findById(id);
        if (cliente) {
          setNome(cliente.nome || '');
          // ... outros campos
          setSaldo(Number(cliente.saldo || 0));

          const vendasDoCliente = await buscarVendasDoCliente(id);
          setVendas(vendasDoCliente);
          setErroVendas(vendasDoCliente.length === 0 ? 'Nenhum histórico encontrado.' : null);
          setAgrupado(agruparVendasPorData(vendasDoCliente));
        }
      } catch (err: any) {
        console.error('Erro geral:', err);
        if (err.message === 'timeout') {
          setErroVendas('Tempo de conexão excedido. Tente novamente.');
        } else {
          setErroVendas('Erro ao carregar histórico.');
        }
      }
    };

    carregarClienteEHistorico();
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

    // 1. Validação dos contatos
    const contatosPreenchidos = contatos.filter(c => c.tipo && c.valor);

    const contatosValidados = contatosPreenchidos.map((c) => {
      const valorFormatado = applyMask(c.tipo, c.valor);
      const erro = validateContato(c.tipo, valorFormatado);
      return { ...c, valor: valorFormatado, erro };
    });

    const contatosValidos = contatosValidados.filter(c => !c.erro);

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

    // 2. Monta objeto cliente
    const cliente: Cliente = {
      ...(id ? { id } : {}),
      nome,
      contatos: contatosValidos.map(({ tipo, valor }) => ({ tipo, valor })),
      endereco,
      saldo,
      criadoEm: new Date().toISOString(),
    };

    // 3. Salva ou atualiza
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


  const calcularTotaisVenda = (venda: Venda) => {
    const totalProdutos = venda.produtos?.reduce((acc, p) => {
      const preco = Number(p.valorUnitario || 0);
      const qtd = Number(p.quantidade || 1);
      return acc + preco * qtd;
    }, 0) || 0;

    const totalPago = venda.pagamentos?.reduce((acc, p) => acc + Number(p.valor || 0), 0) || 0;
    const saldo = totalPago - totalProdutos;
    return { totalProdutos, totalPago, saldo };
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
              {saldo > 0 && <span className="text-success">💰 Cliente tem crédito de R$ {Math.abs(saldo.toFixed(2))}</span>}
              {saldo === 0 && <span className="text-muted">Cliente sem saldo pendente</span>}
            </div>
          </div>

          <div className='historicoClienteComponent mt-5'>
            <h1 className='bg-light shadow-sm d-flex justify-content-between align-items-center p-3 sticky-top'>
              Histórico do cliente
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => navigate('/cadastrar-venda', { state: { clienteSelecionado: { id, nome, contatos, saldo } } })}
              >
                <PlusCircle size={18} />
                Nova Venda
              </button>
            </h1>

            {erroVendas ? (
              <div className="alert alert-warning mt-3">{erroVendas}</div>
            ) : (
              Object.entries(agrupado).map(([ano, meses]) => (
                <div key={ano}>
                  <h4 className="mt-3">{ano}</h4>
                  {Object.entries(meses).map(([mes, dias]) => (
                    <details key={mes} className="mb-2">
                      <summary className="fw-bold">{mes}</summary>
                      <ul className="list-group mt-2">
                        {Object.entries(dias)
                          .sort(([a], [b]) => Number(b) - Number(a)) // dias em ordem decrescente
                          .map(([dia, vendasDoDia]) => {
                            const vendas = vendasDoDia as Venda[];

                            // ✅ Ordena por horário decrescente
                            const vendasOrdenadas = [...vendas].sort((a, b) => {
                              const horaA = parseISO(a.criadoEm).getTime();
                              const horaB = parseISO(b.criadoEm).getTime();
                              return horaB - horaA;
                            });

                            const saldoDia = vendasOrdenadas.reduce((acc, venda) => {
                              const { saldo } = calcularTotaisVenda(venda);
                              return acc + saldo;
                            }, 0);

                            const corFundo = saldoDia === 0
                              ? 'white'
                              : saldoDia > 0
                                ? '#e6ffe6'
                                : '#ffe6e6';

                            const corTexto = saldoDia === 0
                              ? '#333'
                              : saldoDia > 0
                                ? '#006400'
                                : '#8B0000';

                            return (
                              <li
                                key={dia}
                                className="list-group-item"
                                style={{ backgroundColor: corFundo }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <strong>Dia {dia}</strong>
                                  <span style={{ color: corTexto, fontWeight: 'bold' }}>
                                    Total do dia: R$ {saldoDia.toFixed(2).replace('.', ',')}
                                  </span>
                                </div>

                                <ul className="mt-2">
                                  {vendasOrdenadas.map(venda => {
                                    const dataVenda = parseISO(venda.criadoEm);
                                    const horaVenda = format(dataVenda, 'HH:mm');
                                    const { totalProdutos, totalPago, saldo } = calcularTotaisVenda(venda);

                                    return (
                                      <li
                                        key={venda.id}
                                        className="d-flex justify-content-between align-items-center mb-1"
                                      >
                                        <span
                                          style={{
                                            color:
                                              saldo === 0
                                                ? 'black'
                                                : saldo > 0
                                                  ? 'green'
                                                  : 'red'
                                          }}
                                        >
                                          - às {horaVenda} | Total: R$ {totalProdutos.toFixed(2)} | Pago: R$ {totalPago.toFixed(2)} | Saldo: R$ {saldo.toFixed(2)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => navigate(`/cadastrar-venda/${venda.id}`)}
                                          className="btn btn-primary"
                                        >
                                          Ir para venda
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </li>
                            );
                          })}
                      </ul>
                    </details>
                  ))}
                </div>
              ))
            )}
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
  )
};

export default CadastrarCliente;
