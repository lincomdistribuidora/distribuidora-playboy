import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul, colorBranco } from '../../values/colors';
import ClienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';
import { PlusCircle, Contact } from 'lucide-react'; // Corrigido para 'Contact'
import { ptBR } from 'date-fns/locale';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
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

// Interface para Contacts API (para TypeScript, caso não esteja global)
interface NavigatorWithContacts extends Navigator {
  contacts?: {
    select(properties: string[], options: { multiple: boolean }): Promise<any[]>;
  };
}

// ============== NOVA FUNÇÃO PARA NORMALIZAR NÚMEROS DE TELEFONE ==============
const normalizePhoneNumber = (rawNumber: string): string => {
  // Remove todos os caracteres não numéricos
  let cleanedNumber = rawNumber.replace(/\D/g, '');

  // Se o número for maior que 11 dígitos, assumimos que ele contém prefixos
  // (como código de país '55', ou '0' na frente do DDD, etc.)
  // e pegamos apenas os últimos 11 dígitos.
  // Isso é ideal para telefones celulares brasileiros (DD + 9 + 8 dígitos).
  if (cleanedNumber.length > 11) {
    return cleanedNumber.slice(-11);
  }

  // Para casos onde o número já tem 11 dígitos ou menos (ex: fixo com 8/9 dígitos,
  // ou já limpo corretamente), retornamos como está.
  return cleanedNumber;
};
// ===========================================================================


const CadastrarCliente = () => {
  const numMaximoDiasNoMes = 31; // Variável não utilizada, pode ser removida se não for usada em outro lugar.
  const navigate = useNavigate();
  // numDiasNoMes também não parece ser utilizada diretamente, pode ser removida se não for usada em outro lugar.
  const [numDiasNoMes, setNumDiasNoMes] = useState(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"]); 
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

  const [saldo, setSaldo] = useState(0);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [erroVendas, setErroVendas] = useState<string | null>(null);
  const [agrupado, setAgrupado] = useState<any>({});

  const [canUseContactPicker, setCanUseContactPicker] = useState(false);

  // Efeito para verificar a disponibilidade da Contact Picker API ao carregar o componente
  useEffect(() => {
    const navigatorWithContacts = navigator as NavigatorWithContacts;
    const isContactApiAvailable = !!navigatorWithContacts.contacts;
    const isSecure = window.isSecureContext;

    // Logs de depuração que podem ser removidos após confirmação de funcionamento
    console.log("DEBUG: Checking Contact Picker API availability:");
    console.log("navigator.contacts is available:", isContactApiAvailable);
    console.log("window.isSecureContext is true:", isSecure);

    if (isContactApiAvailable && isSecure) {
      setCanUseContactPicker(true);
    } else {
      setCanUseContactPicker(false);
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez

  const buscarVendasDoCliente = async (clienteId: string): Promise<any[]> => {
    try {
      const vendasRef = collection(db, 'vendas');
      const q = query(vendasRef, where('cliente.id', '==', clienteId));
      const snapshot = await getDocs(q);
      // console.log("O valor de snapshot:") // Pode ser removido, era para depuração
      // console.log(snapshot) // Pode ser removido, era para depuração

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
      if (!venda.criadoEm) return;
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
    // Remove qualquer coisa que não seja dígito antes de aplicar a máscara.
    // Isso garante que a máscara sempre comece de um número "limpo".
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
      // Valida o formato final esperado após a aplicação da máscara.
      const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      return telefoneRegex.test(valor) ? '' : 'Telefone inválido (ex: (xx) xxxxx-xxxx)';
    }

    if (tipo === 'E-mail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(valor) ? '' : 'E-mail inválido';
    }

    return '';
  };

  // Função para verificar duplicidade de contato no Firestore
  const verificarDuplicidadeContato = async (tipo: string, valor: string): Promise<Cliente | null> => {
    try {
      const clientesRef = collection(db, 'clientes');
      // Busca por um cliente que tenha um contato com o mesmo tipo e valor
      const q = query(clientesRef, where('contatos', 'array-contains', { tipo, valor }));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Se encontrar, retorna o primeiro cliente correspondente
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Cliente;
      }
      return null; // Nenhum cliente duplicado encontrado
    } catch (error) {
      console.error('Erro ao verificar duplicidade de contato:', error);
      return null;
    }
  };

  // Função para importar contatos da agenda do dispositivo
  const handleImportContacts = async () => {
    const navigatorWithContacts = navigator as NavigatorWithContacts;
    if (!navigatorWithContacts.contacts) {
      Swal.fire({
        icon: 'info',
        title: 'Funcionalidade não disponível',
        text: 'A importação de contatos da agenda só funciona em navegadores mobile que suportam essa função (ex: Chrome no Android) e em um ambiente seguro (HTTPS).',
        confirmButtonColor: colorAzul,
      });
      return;
    }

    try {
      // Solicita ao usuário a seleção de contatos
      const selectedContacts = await navigatorWithContacts.contacts.select(
        ['name', 'email', 'tel'], // Propriedades que queremos dos contatos
        { multiple: false } // Permite ao usuário selecionar apenas um contato por vez
      );

      if (selectedContacts.length === 0) {
        return; // Usuário cancelou a seleção
      }

      const contact = selectedContacts[0]; // Pega o primeiro (e único) contato selecionado

      // Tenta preencher o nome do cliente se o campo estiver vazio
      if (!nome.trim() && contact.name && contact.name.length > 0) {
        setNome(contact.name[0]);
      }

      const newContactsToAdd: Contato[] = []; // Array para armazenar os novos contatos a serem adicionados

      // Processa os números de telefone do contato selecionado
      if (contact.tel && contact.tel.length > 0) {
        for (const tel of contact.tel) {
          const normalizedTel = normalizePhoneNumber(tel); // Normaliza o número antes de tudo!
          const formattedTel = applyMask('Telefone', normalizedTel); // Aplica a máscara no número normalizado

          // Verifica duplicidade no Firestore para o telefone formatado
          const isDuplicate = await verificarDuplicidadeContato('Telefone', formattedTel);
          if (isDuplicate) {
            const result = await Swal.fire({
              icon: 'warning',
              title: 'Contato duplicado!',
              html: `O telefone <strong>${formattedTel}</strong> já pertence ao cliente <strong>${isDuplicate.nome}</strong>. Deseja adicionar mesmo assim?`,
              showCancelButton: true,
              confirmButtonText: 'Sim, adicionar',
              cancelButtonText: 'Não, cancelar',
              confirmButtonColor: colorAzul,
              cancelButtonColor: '#d33',
            });
            if (result.isConfirmed) {
              newContactsToAdd.push({
                tipo: 'Telefone',
                valor: formattedTel,
                erro: validateContato('Telefone', formattedTel),
              });
            }
          } else {
            newContactsToAdd.push({
              tipo: 'Telefone',
              valor: formattedTel,
              erro: validateContato('Telefone', formattedTel),
            });
          }
        }
      }

      // Processa os e-mails do contato selecionado
      if (contact.email && contact.email.length > 0) {
        for (const email of contact.email) {
          // Verifica duplicidade no Firestore para o e-mail
          const isDuplicate = await verificarDuplicidadeContato('E-mail', email);
          if (isDuplicate) {
            const result = await Swal.fire({
              icon: 'warning',
              title: 'Contato duplicado!',
              html: `O e-mail <strong>${email}</strong> já pertence ao cliente <strong>${isDuplicate.nome}</strong>. Deseja adicionar mesmo assim?`,
              showCancelButton: true,
              confirmButtonText: 'Sim, adicionar',
              cancelButtonText: 'Não, cancelar',
              confirmButtonColor: colorAzul,
              cancelButtonColor: '#d33',
            });
            if (result.isConfirmed) {
              newContactsToAdd.push({
                tipo: 'E-mail',
                valor: email,
                erro: validateContato('E-mail', email),
              });
            }
          } else {
            newContactsToAdd.push({
              tipo: 'E-mail',
              valor: email,
              erro: validateContato('E-mail', email),
            });
          }
        }
      }

      // Atualiza o estado dos contatos no formulário
      setContatos(prevContatos => {
        // Filtra quaisquer campos de contato vazios que não foram preenchidos
        const filteredPrevContatos = prevContatos.filter(c => c.tipo || c.valor.trim()); 
        return [...filteredPrevContatos, ...newContactsToAdd];
      });

    } catch (error: any) {
      console.error('Erro ao importar contatos:', error);
      if (error.name === 'AbortError') {
        // Quando o usuário cancela a seleção de contatos
        console.log('Seleção de contatos cancelada pelo usuário.');
      } else if (error.name === 'SecurityError') {
        Swal.fire({
          icon: 'error',
          title: 'Erro de segurança',
          text: 'A importação de contatos requer um ambiente seguro (HTTPS) e permissão do usuário.',
          confirmButtonColor: '#d33',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao importar',
          text: 'Não foi possível importar contatos. Verifique as permissões.',
          confirmButtonColor: '#d33',
        });
      }
    }
  };


  // Efeito para carregar dados do cliente e histórico de vendas ao editar
  useEffect(() => {
    const carregarClienteEHistorico = async () => {
      if (!id) return; // Se não há ID, não estamos editando

      try {
        const cliente = await ClienteRepository.findById(id);
        if (cliente) {
          setNome(cliente.nome || '');
          // Garante que 'contatos' é um array e mapeia para o formato do estado,
          // adicionando um campo vazio se não houver contatos.
          setContatos(cliente.contatos?.map((c: any) => ({
            tipo: c.tipo || '',
            valor: c.valor || '',
            erro: validateContato(c.tipo || '', c.valor || '')
          })) || [{ tipo: '', valor: '', erro: '' }]);
          setSaldo(Number(cliente.saldo || 0));

          const vendasDoCliente = await buscarVendasDoCliente(id);
          setVendas(vendasDoCliente);
          setErroVendas(vendasDoCliente.length === 0 ? 'Nenhum histórico encontrado.' : null);
          setAgrupado(agruparVendasPorData(vendasDoCliente));
        }
      } catch (err: any) {
        console.error('Erro geral ao carregar cliente:', err);
        if (err.message === 'timeout') {
          setErroVendas('Tempo de conexão excedido. Tente novamente.');
        } else {
          setErroVendas('Erro ao carregar histórico.');
        }
      }
    };

    carregarClienteEHistorico();
  }, [id]); // Dependência do ID para recarregar quando o ID da rota mudar

  // Adiciona um novo campo de contato vazio ao formulário
  const handleAddContato = () => {
    setContatos([...contatos, { tipo: '', valor: '', erro: '' }]);
  };

  // Remove um campo de contato específico do formulário
  const handleRemoveContato = (index: number) => {
    const updated = [...contatos];
    updated.splice(index, 1);
    // Garante que sempre haja pelo menos um campo de contato no formulário
    if (updated.length === 0) {
      setContatos([{ tipo: '', valor: '', erro: '' }]);
    } else {
      setContatos(updated);
    }
  };

  // Lida com a mudança do tipo de contato (Telefone, E-mail, WhatsApp)
  const handleTipoChange = (index: number, value: string) => {
    const updated = [...contatos];
    updated[index].tipo = value;
    updated[index].valor = ''; // Limpa o valor ao mudar o tipo
    updated[index].erro = 'Campo obrigatório'; // Define erro inicial
    setContatos(updated);
  };

  // Lida com a mudança do valor do contato, aplicando máscara e validação
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

  // Lida com o envio do formulário de cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validação e formatação dos contatos
    // Filtra para pegar apenas os contatos que têm tipo E valor preenchidos
    const contatosPreenchidos = contatos.filter(c => c.tipo && c.valor.trim());

    // Re-valida e formata os contatos preenchidos
    const contatosValidados = contatosPreenchidos.map((c) => {
      const valorFormatado = applyMask(c.tipo, c.valor);
      const erro = validateContato(c.tipo, valorFormatado);
      return { ...c, valor: valorFormatado, erro };
    });

    // Verifica se há erros de validação visíveis nos contatos
    if (contatosValidados.some(c => c.erro)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Corrija os erros nos contatos!',
        confirmButtonColor: '#d33',
      });
      setContatos(contatosValidados); // Atualiza para mostrar os erros na UI
      return;
    }

    // Se nenhum contato preenchido/válido após a validação
    if (contatosValidados.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'É necessário pelo menos um contato válido!',
        confirmButtonColor: '#d33',
      });
      return;
    }
    
    // Mapeia para o formato final a ser salvo no Firestore (apenas tipo e valor)
    const contatosParaSalvar = contatosValidados.map(({ tipo, valor }) => ({ tipo, valor }));

    // 2. Monta o objeto cliente
    const cliente: Cliente = {
      ...(id ? { id } : {}), // Inclui o ID se estiver editando
      nome,
      contatos: contatosParaSalvar,
      endereco,
      saldo,
      criadoEm: new Date().toISOString(), // Grava a data de criação/última atualização
    };

    // 3. Salva ou atualiza o cliente no Firestore
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

      navigate('/clientes', { replace: true }); // Redireciona para a lista de clientes
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

  // Calcula totais de vendas para exibição no histórico
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
            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleAddContato}
                className="btn btn-sm"
                style={{ backgroundColor: colorAzul, color: colorBranco }}
              >
                Adicionar Contato
              </button>
              {canUseContactPicker && ( // Renderiza o botão de importação condicionalmente
                <button
                  type="button"
                  onClick={handleImportContacts}
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                >
                  <Contact size={18} /> Importar da Agenda
                </button>
              )}
            </div>
          </div>

          {/* Seção de Saldo com o Cliente */}
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
              {saldo < 0 && <span className="text-danger">💸 Cliente deve R$ {saldo.toFixed(2).replace('.', ',')}</span>}
              {saldo > 0 && <span className="text-success">💰 Cliente tem crédito de R$ {Math.abs(saldo).toFixed(2).replace('.', ',')}</span>}
              {saldo === 0 && <span className="text-muted">Cliente sem saldo pendente</span>}
            </div>
          </div>

          {/* Seção de Histórico do Cliente (Vendas) */}
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
                          .sort(([a], [b]) => Number(b) - Number(a)) // Ordena dias em ordem decrescente
                          .map(([dia, vendasDoDia]) => {
                            const vendas = vendasDoDia as Venda[];

                            // Ordena vendas do dia por horário decrescente
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
                                ? '#e6ffe6' // Verde claro para saldo positivo
                                : '#ffe6e6'; // Vermelho claro para saldo negativo

                            const corTexto = saldoDia === 0
                              ? '#333'
                              : saldoDia > 0
                                ? '#006400' // Verde escuro para saldo positivo
                                : '#8B0000'; // Vermelho escuro para saldo negativo

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
                                          - às {horaVenda} | Total: R$ {totalProdutos.toFixed(2).replace('.', ',')} | Pago: R$ {totalPago.toFixed(2).replace('.', ',')} | Saldo: R$ {saldo.toFixed(2).replace('.', ',')}
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

          {/* Botões de Ação do Formulário */}
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