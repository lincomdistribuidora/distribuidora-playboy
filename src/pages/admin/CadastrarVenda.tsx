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

  const saldoClienteExibir = Number(clienteSelecionado?.saldo) || 0;

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

  // Carrega clientes e produtos apenas uma vez ao montar o componente
  useEffect(() => {
    clienteRepository.findAll().then(setClientes).catch(console.error);
    produtoRepository.findAll().then(setProdutosDisponiveis).catch(console.error);
  }, []);

  const [vendaOriginal, setVendaOriginal] = useState<Venda | null>(null);

  useEffect(() => {
    if (!id) return;

    const carregarVenda = async () => {
      try {
        const vendaData = await vendaRepository.findById(id);
        if (vendaData) {
          setVenda(vendaData);
          setVendaOriginal(vendaData);  // Guarda a venda original para comparar
          const clienteAtualizado = await clienteRepository.findById(vendaData.cliente.id);
          if (clienteAtualizado) setClienteSelecionado(clienteAtualizado);
        }
      } catch (error) {
        console.error(error);
      }
    };

    carregarVenda();
  }, [id]);

  const vendaAlterada = JSON.stringify(vendaOriginal) !== JSON.stringify(venda);

  // Carrega a venda e seleciona o cliente correto após os clientes estarem carregados
  useEffect(() => {
    if (!id) return;

    const carregarVenda = async () => {
      try {
        const vendaData = await vendaRepository.findById(id);
        console.log('Venda carregada:', vendaData);
        if (vendaData) {
          setVenda(vendaData);

          // Agora aguarda até que clientes estejam carregados para selecionar o cliente da venda
          // Espera até que clientes.length > 0 para tentar achar o cliente
          if (clientes.length > 0) {
            const cliente = clientes.find(c => c.id === vendaData.cliente.id);
            if (cliente) setClienteSelecionado(cliente);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    carregarVenda();
  }, [id, clientes]);

  // Cálculo do saldo restante
  // const saldoRestante = parseFloat(venda.valor) - venda.pagamentoRecebido;
  // const saldoCliente = clienteSelecionado?.saldo || 0;
  // const saldoFinalCliente = saldoCliente - saldoRestante;

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
  // Dentro da função handleSubmit (substitua a lógica do cálculo do pagamento)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalVenda = parseFloat(venda.valor);  // O valor total da venda
    const totalPago = venda.pagamentoRecebido || 0;  // O total pago

    // 1. Pegamos o saldo atual do cliente (antes da venda)
    const saldoAtual = clienteSelecionado?.saldo || 0;

    // 2. Verificar se estamos criando ou editando
    const saldoAposVenda = saldoAtual + totalPago - totalVenda;


    // Lógica condicional para exibir o saldo correto no alerta
    let somenteParaDisplayAlert = saldoAposVenda.toString();  // Exibe o saldo após a venda


    // Cria o objeto novaVenda (sem o id)
    const novaVenda: Omit<Venda, 'id'> = {
      ...venda,
      status,
      criadoEm: venda.criadoEm || new Date().toISOString(),
    };

    const saldoFuturo = await vendaRepository.calcularSaldoFuturoCliente(novaVenda);
    console.log('Saldo futuro calculado:', saldoFuturo);


    console.log("Saldo Atual: ", saldoAtual);
    console.log("Total Pago: ", totalPago);
    console.log("Total Venda: ", totalVenda);
    console.log("Saldo Após Venda (alerta): ", saldoAposVenda);

    // 3. Verifique se o total da venda não ultrapassa o limite
    if (totalVenda > LIMITE_TOTAL_VENDA) {
      Swal.fire({
        icon: 'error',
        title: 'Venda acima do limite',
        text: `O total da venda excede o limite permitido de R$ ${LIMITE_TOTAL_VENDA.toFixed(2)}`,
        confirmButtonColor: colorAzul,
      });
      return;
    }

    // 4. Verifique se o saldo do cliente ficará negativo após a venda
    if (saldoAposVenda < 0) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Saldo Insuficiente',
        html: `
        <p>O saldo do cliente ficará negativo após esta venda.</p>
        <p><strong>Nome:</strong> ${clienteSelecionado?.nome}</p>
        <p><strong>Saldo após Venda:</strong> R$ ${saldoFuturo.toFixed(2)}</p>
        <p>Deseja continuar mesmo assim?</p>
      `,
        showCancelButton: true,
        confirmButtonText: 'Sim, continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: colorAzul,
        cancelButtonColor: '#d33',
      });

      if (!result.isConfirmed) {
        // Se o usuário cancelar, para a execução
        return;
      }
    }

    // 5. Continuamos com a lógica de salvar a venda e atualizar o saldo
    try {
      const status = totalPago >= totalVenda ? 'Concluída' : 'Pendente';
      const novaVenda: Venda = {
        ...venda,
        status: status,
        criadoEm: venda.criadoEm || new Date().toISOString(),
      };

      // Buscar cliente para atualizar saldo
      const cliente = clientes.find(c => c.id === venda.cliente.id);
      if (!cliente) throw new Error('Cliente não encontrado');

      // Atualiza o saldo do cliente no banco
      cliente.saldo = saldoAposVenda;  // Atualiza o saldo do cliente com o valor correto no banco

      // Atualiza o cliente no repositório (banco de dados)
      await clienteRepository.update(cliente.id, cliente);
      setClienteSelecionado(cliente);  // Atualiza a variável clienteSelecionado com o novo saldo

      // Atualiza ou salva a venda
      if (id) {
        let cliente = await vendaRepository.update(id, novaVenda);
        console.log("cliente update ")
        console.log(cliente)

      } else {
        await vendaRepository.save(novaVenda);
      }

      await Swal.fire({
        icon: 'success',
        title: `Venda ${status === 'Concluída' ? 'Concluída' : 'Pendente'} com sucesso!`,
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
            {clienteSelecionado && saldoClienteExibir !== 0 && (
              <div className="mt-2">
                <p>
                  {saldoClienteExibir < 0

                    ? `Cliente possui débito de R$ ${Math.abs(saldoClienteExibir).toFixed(2)}`
                    : `Cliente possui crédito de R$ ${saldoClienteExibir.toFixed(2)}`}
                </p>
                <small className="text-muted">
                  (consultado em {new Date().toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })})
                </small>
              </div>
            )}
          </div>

          {/* Produtos */}
          <div className="mt-4">
            <label>Produtos:</label>
            {/* <button
              type="button"
              className="btn btn-primary ms-2"
              onClick={() => {
                // ir para adicionar produto e quando voltar tem que vim preenchido o campo para continuar com a venda.
              }}
            >Adicionar</button> */}
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
            <p><strong>Valor total da venda:</strong> R$ {parseFloat(venda.valor).toFixed(2)}</p>
            <p><strong>Total pago:</strong> R$ {venda.pagamentoRecebido.toFixed(2)}</p>
            <p><strong>Saldo restante:</strong> R$ {(parseFloat(venda.valor) - venda.pagamentoRecebido).toFixed(2)}</p>
            {/* {clienteSelecionado && (
              <p><strong>Saldo do cliente:</strong> R$ {clienteSelecionado.saldo.toFixed(2)}</p>
            )} */}
          </div>

          {/* Condição para mostrar o botão */}
          <button
            type="submit"
            className="btn btn-success mt-3"
            disabled={!vendaAlterada || venda.produtos.length === 0}
          >
            {venda.pagamentoRecebido >= parseFloat(venda.valor)
              ? 'Concluir Venda'
              : 'Salvar Venda Pendente'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CadastrarVenda;