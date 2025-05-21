// src/pages/admin/CadastrarVenda.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import Swal from 'sweetalert2';

import { Cliente } from '../../types/Cliente';
import { Produto } from '../../types/Produto';
import { Venda, Pagamento } from '../../types/Venda';

import clienteRepository from '../../repositories/ClienteRepository';
import produtoRepository from '../../repositories/ProdutoRepository';
import vendaRepository from '../../repositories/VendaRepository';
import { v4 as uuidv4 } from 'uuid';

const LIMITE_TOTAL_VENDA = 1200;

const CadastrarVenda = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<Produto[]>([]);
  const [pagamentoForma, setPagamentoForma] = useState<Pagamento['forma'] | ''>('');
  const [pagamentoValor, setPagamentoValor] = useState<number>(0);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  const [venda, setVenda] = useState<Venda>({
    id: '',
    tipo: '',
    valor: '0',
    cliente: { id: '', nome: '', contatos: [], saldo: 0 },
    produtos: [],
    pagamentos: [],
    pagamentoRecebido: 0,
    status: 'Pendente',
    criadoEm: new Date().toISOString(),
  });

  useEffect(() => {
    clienteRepository.findAll().then(setClientes).catch(console.error);
    produtoRepository.findAll().then(setProdutosDisponiveis).catch(console.error);

    if (id) {
      vendaRepository.findById(id).then((vendaData) => {
        console.log("Venda carregada:", vendaData);
        if (vendaData) {
          setVenda(vendaData);
          setClienteSelecionado(vendaData.cliente);
        }
      }).catch(console.error);
    }
  }, [id]);

  // Cálculo do saldo restante
  const saldoRestante = parseFloat(venda.valor) - venda.pagamentoRecebido;
  const saldoCliente = clienteSelecionado?.saldo || 0;
  const saldoFinalCliente = saldoCliente - saldoRestante;

  const adicionarProduto = (produto: Produto) => {
    const produtoExistente = venda.produtos.find(p => p.produtoId === produto.id);
    const valorProduto = Number(produto.valorVenda);
    const valorAtual = venda.produtos.reduce((acc, p) => acc + p.valorUnitario * p.quantidade, 0);
    const novoTotal = valorAtual + valorProduto;

    if (novoTotal > LIMITE_TOTAL_VENDA) {
      Swal.fire({
        icon: 'warning',
        title: 'Limite excedido',
        text: `O valor total da venda não pode ultrapassar R$ ${LIMITE_TOTAL_VENDA.toFixed(2)}`,
        confirmButtonColor: colorAzul,
      });
      return;
    }

    const novaLista = [...venda.produtos];
    if (produtoExistente) {
      produtoExistente.quantidade++;
    } else {
      novaLista.push({
        produtoId: produto.id,
        nome: produto.nome,
        quantidade: 1,
        valorUnitario: valorProduto,
      });
    }

    const novoValor = novaLista.reduce((acc, p) => acc + p.valorUnitario * p.quantidade, 0);

    setVenda(prev => ({
      ...prev,
      produtos: novaLista,
      valor: novoValor.toFixed(2),
    }));
  };

  const removerProduto = (produtoId: string) => {
    const produtosAtualizados = venda.produtos.filter(p => p.produtoId !== produtoId);
    const novoTotal = produtosAtualizados.reduce((acc, p) => acc + p.valorUnitario * p.quantidade, 0);

    setVenda(prev => ({
      ...prev,
      produtos: produtosAtualizados,
      valor: novoTotal.toFixed(2),
    }));
  };

  const atualizarValorTotal = () => {
    const total = venda.produtos.reduce((acc, p) => acc + p.valorUnitario * p.quantidade, 0);
    setVenda(prev => ({ ...prev, valor: total.toFixed(2) }));
  };

  const adicionarPagamento = (forma: Pagamento['forma'], valor: number) => {
    const novoPagamento: Pagamento = {
      id: uuidv4(),
      forma,
      valor,
    };
    const pagamentosAtualizados = [...venda.pagamentos, novoPagamento];
    const totalPago = pagamentosAtualizados.reduce((acc, p) => acc + p.valor, 0);
    setVenda(prev => ({
      ...prev,
      pagamentos: pagamentosAtualizados,
      pagamentoRecebido: totalPago,
    }));
  };

  const removerPagamento = (pagamentoId: string) => {
    const pagamentosAtualizados = venda.pagamentos.filter(p => p.id !== pagamentoId);
    const totalPago = pagamentosAtualizados.reduce((acc, p) => acc + p.valor, 0);
    setVenda(prev => ({
      ...prev,
      pagamentos: pagamentosAtualizados,
      pagamentoRecebido: totalPago,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalVenda = parseFloat(venda.valor);
    const totalPago = venda.pagamentoRecebido || 0;

    if (totalVenda > LIMITE_TOTAL_VENDA) {
      Swal.fire({
        icon: 'error',
        title: 'Venda acima do limite',
        text: `O total da venda excede o limite permitido de R$ ${LIMITE_TOTAL_VENDA.toFixed(2)}`,
        confirmButtonColor: colorAzul,
      });
      return;
    }

    try {
      const status = totalPago >= totalVenda ? 'Concluída' : 'Pendente';
      const novaVenda: Venda = {
        ...venda,
        criadoEm: venda.criadoEm || new Date().toISOString(),
        status,
      };

      const cliente = clientes.find(c => c.id === venda.cliente.id);
      if (!cliente) throw new Error('Cliente não encontrado');

      const valorAntigo = id ? parseFloat(venda.valor) : 0;
      const pagoAntigo = id ? venda.pagamentoRecebido : 0;

      let ajusteSaldo = 0;

      if (id) {
        const vendaAntiga = await vendaRepository.findById(id);
        if (vendaAntiga) {
          const saldoAntigo = vendaAntiga.pagamentoRecebido - parseFloat(vendaAntiga.valor);
          ajusteSaldo -= saldoAntigo;
        }
      }

      let saldoUsado = 0;
      let saldoNovo = totalPago - totalVenda;

      if (totalPago < totalVenda && cliente.saldo > 0) {
        const faltante = totalVenda - totalPago;
        saldoUsado = Math.min(cliente.saldo, faltante);

        const result = await Swal.fire({
          icon: 'question',
          title: 'Usar saldo do cliente?',
          html: `
            <p>Venda: R$ ${totalVenda.toFixed(2)}</p>
            <p>Total pago: R$ ${totalPago.toFixed(2)}</p>
            <p>Saldo atual do cliente: R$ ${cliente.saldo.toFixed(2)}</p>
            <p>Usar R$ ${saldoUsado.toFixed(2)} de saldo para completar?</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Sim, usar saldo',
          cancelButtonText: 'Não',
          confirmButtonColor: colorAzul,
        });

        if (result.isConfirmed) {
          saldoNovo = totalPago + saldoUsado - totalVenda;
        } else {
          saldoUsado = 0;
        }
      }

      ajusteSaldo += saldoNovo - saldoUsado;
      cliente.saldo = (cliente.saldo || 0) + ajusteSaldo;

      await clienteRepository.update(cliente.id, cliente);

      if (id) {
        await vendaRepository.update(id, novaVenda);
      } else {
        await vendaRepository.save(novaVenda);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Venda salva com sucesso!',
        confirmButtonColor: colorAzul,
      });

      navigate('/vendas');
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar venda',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="menu-responsivel">
      <div className="container mt-5 p-4" style={{ backgroundColor: '#fff', borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>Lançar Venda</h2>

        <form onSubmit={handleSubmit}>
          {/* Cliente */}
          <div className="mt-4">
            <label>Cliente:</label>
            <Select
              value={clienteSelecionado ? { value: clienteSelecionado.id, label: clienteSelecionado.nome } : null}
              onChange={(opt) => {
                const cliente = clientes.find(c => c.id === opt?.value);
                if (cliente) {
                  setClienteSelecionado(cliente);
                  setVenda(prev => ({ ...prev, cliente }));
                }
              }}
              options={clientes.map(c => ({ value: c.id, label: c.nome }))}
              className="mt-2"
              placeholder="Selecione o cliente"
              required
            />
            {clienteSelecionado && clienteSelecionado.saldo !== 0 && (
              <p className="mt-2">
                {clienteSelecionado.saldo < 0
                  ? `Cliente possui débito de R$ ${Math.abs(clienteSelecionado.saldo).toFixed(2)}`
                  : `Cliente possui crédito de R$ ${clienteSelecionado.saldo.toFixed(2)}`}
              </p>
            )}
          </div>

          {/* Produtos */}
          <div className="mt-4">
            <label>Produtos:</label>
            <Select
              options={produtosDisponiveis.map(p => ({ value: p.id, label: `${p.nome} - R$ ${p.valorVenda}` }))}
              onChange={(opt) => {
                const produto = produtosDisponiveis.find(p => p.id === opt?.value);
                if (produto) adicionarProduto(produto);
              }}
              placeholder="Adicionar produto"
              className="mt-2"
              isSearchable
            />

            <ul className="list-group mt-3">
              {venda.produtos.map((p, index) => (
                <li key={p.produtoId} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{p.nome}</strong>
                    <div className="d-flex align-items-center mt-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          const novaQuantidade = p.quantidade - 1;
                          if (novaQuantidade <= 0) return;
                          const atualizados = [...venda.produtos];
                          atualizados[index].quantidade = novaQuantidade;
                          setVenda(prev => ({ ...prev, produtos: atualizados }));
                          atualizarValorTotal();
                        }}
                      >-</button>

                      <input
                        type="number"
                        min={1}
                        value={p.quantidade}
                        onChange={(e) => {
                          const novaQuantidade = parseInt(e.target.value);
                          if (isNaN(novaQuantidade) || novaQuantidade <= 0) return;

                          const totalSemEsse = venda.produtos
                            .filter((_, i) => i !== index)
                            .reduce((acc, item) => acc + item.valorUnitario * item.quantidade, 0);

                          const novoTotal = totalSemEsse + p.valorUnitario * novaQuantidade;
                          if (novoTotal > LIMITE_TOTAL_VENDA) {
                            Swal.fire({
                              icon: 'warning',
                              title: 'Limite excedido',
                              text: `O valor total da venda não pode ultrapassar R$ ${LIMITE_TOTAL_VENDA.toFixed(2)}`,
                              confirmButtonColor: colorAzul,
                            });
                            return;
                          }

                          const atualizados = [...venda.produtos];
                          atualizados[index].quantidade = novaQuantidade;
                          setVenda(prev => ({ ...prev, produtos: atualizados }));
                          atualizarValorTotal();
                        }}
                        className="form-control form-control-sm me-2"
                        style={{ width: 70 }}
                      />

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-3"
                        onClick={() => {
                          const totalAtual = venda.produtos.reduce((acc, item) => acc + item.valorUnitario * item.quantidade, 0);
                          const novoTotal = totalAtual + p.valorUnitario;

                          if (novoTotal > LIMITE_TOTAL_VENDA) {
                            Swal.fire({
                              icon: 'warning',
                              title: 'Limite excedido',
                              text: `O valor total da venda não pode ultrapassar R$ ${LIMITE_TOTAL_VENDA.toFixed(2)}`,
                              confirmButtonColor: colorAzul,
                            });
                            return;
                          }

                          const atualizados = [...venda.produtos];
                          atualizados[index].quantidade += 1;
                          setVenda(prev => ({ ...prev, produtos: atualizados }));
                          atualizarValorTotal();
                        }}
                      >+</button>

                      <span className="me-3">R$ {(p.valorUnitario * p.quantidade).toFixed(2)}</span>
                    </div>
                  </div>

                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removerProduto(p.produtoId)}>
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagamentos */}
          <div className="mt-4">
            <label>Adicionar Pagamento:</label>
            <div className="d-flex flex-wrap gap-2 align-items-end mt-2">
              <div style={{ flex: 1, minWidth: 180 }}>
                <Select
                  options={["Dinheiro", "Pix", "Débito", "Crédito"].map(f => ({ value: f, label: f }))}
                  onChange={(opt) => setPagamentoForma(opt?.value as Pagamento['forma'] || '')}
                  placeholder="Forma de pagamento"
                />
              </div>
              <div>
                <NumericFormat
                  value={pagamentoValor}
                  onValueChange={(values) => setPagamentoValor(values.floatValue || 0)}
                  prefix="R$ "
                  decimalSeparator=","
                  thousandSeparator="."
                  className="form-control"
                  placeholder="Valor"
                  allowNegative={false}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (pagamentoForma && pagamentoValor > 0) {
                    adicionarPagamento(pagamentoForma, pagamentoValor);
                    setPagamentoValor(0);
                    setPagamentoForma('');
                  }
                }}
              >Adicionar</button>
            </div>

            <ul className="list-group mt-3">
              {venda.pagamentos.map(p => (
                <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{p.forma} - R$ {p.valor.toFixed(2)}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removerPagamento(p.id)}
                  >Remover</button>
                </li>
              ))}
            </ul>
          </div>


          {/* Resumo da Venda/Cliente */}
          <div className="mt-4 p-3 bg-light rounded">
            <h5>Resumo da Venda</h5>
            <p><strong>Total da Venda:</strong> R$ {parseFloat(venda.valor).toFixed(2)}</p>
            <p><strong>Total Pago:</strong> R$ {venda.pagamentoRecebido.toFixed(2)}</p>
            <p><strong>Total a pagar:</strong> R$ {saldoRestante.toFixed(2)}</p>
            <p><strong>Saldo do Cliente Após Venda:</strong> R$ {saldoFinalCliente.toFixed(2)}</p>
          </div>


          {/* Botão */}
          <div className="mt-4">
            {/* <p><strong>Total da Venda:</strong> R$ {parseFloat(venda.valor).toFixed(2)}</p>
            <p><strong>Total Pago:</strong> R$ {(venda.pagamentoRecebido || 0).toFixed(2)}</p> */}
            <button type="submit" className="btn btn-success mt-3">
              {id ? 'Atualizar Venda' : 'Concluir Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarVenda;