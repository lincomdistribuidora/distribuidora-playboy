import React from 'react';
import { colorAzul, colorBranco } from '../../values/colors';
import { FaMapMarkedAlt } from 'react-icons/fa';

const ComoChegar = () => {
  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ backgroundColor: '#f9f9f9', minHeight: '80vh' }}>
      <div
        className="shadow p-5 rounded"
        style={{ backgroundColor: '#fff', maxWidth: '600px', width: '100%', textAlign: 'center' }}
      >
        <h2 style={{ color: colorAzul }} className="mb-4">📍 Como Chegar</h2>
        <p style={{ color: '#555', fontSize: '1.1rem' }}>
          Clique no botão abaixo para visualizar nossa localização no mapa.
        </p>

        <a
          href="https://www.google.com/maps?q=-20.193616859143418,-40.25542379513"
          className="btn mt-4 d-flex align-items-center justify-content-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: colorAzul,
            color: colorBranco,
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={e => (e.target.style.backgroundColor = '#1b4c99')}
          onMouseOut={e => (e.target.style.backgroundColor = colorAzul)}
        >
          <FaMapMarkedAlt size={20} />
          Ver no Mapa
        </a>
      </div>
    </div>
  );
};

export default ComoChegar;
