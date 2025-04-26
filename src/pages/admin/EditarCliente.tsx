import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClienteRepository from '../../repositories/ClienteRepository';

import { FaPhoneAlt } from "react-icons/fa";

const EditarCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditando = Boolean(id);

  const [cliente, setCliente] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarCliente = async () => {
      if (!id) return;

      const clientes = await ClienteRepository.findAll();
      const clienteEncontrado = clientes.find((c: any) => c.id === id);

      if (clienteEncontrado) {
        setCliente({
          nome: clienteEncontrado.nome || '',
          email: clienteEncontrado.email || '',
          telefone: clienteEncontrado.telefone || ''
        });
      } else {
        alert('Cliente não encontrado!');
        navigate('/clientes');
      }

      setLoading(false);
    };

    buscarCliente();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Aqui você deve atualizar no Firebase
    alert('Cliente atualizado com sucesso!');
    navigate('/clientes');
  };

  if (loading) {
    return <p>Carregando dados do cliente...</p>;
  }

  return (
    <div className='container mt-4'>
      <h2>Editar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label className='form-label'>Nome</label>
          <input
            type='text'
            className='form-control'
            name='nome'
            value={cliente.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'>Email</label>
          <input
            type='email'
            className='form-control'
            name='email'
            value={cliente.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'>Telefone</label>
          <input
            type='text'
            className='form-control'
            name='telefone'
            value={cliente.telefone}
            onChange={handleChange}
            required
          />
        </div>
        <button type='submit' className='btn btn-primary'>Atualizar Cliente</button>
      </form>
    </div>
  );
};

export default EditarCliente;