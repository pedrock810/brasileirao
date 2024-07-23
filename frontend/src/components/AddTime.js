import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const estadosBrasil = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 
  'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 
  'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
];

function AddTime() {
  const [novoTime, setNovoTime] = useState({ nome: '', escudo: '', estado: '' });

  const handleAddTime = () => {
    axios.post('http://localhost:3001/api/times', novoTime)
      .then(() => {
        setNovoTime({ nome: '', escudo: '', estado: '' });
        toast.success('Time adicionado com sucesso');
      })
      .catch(error => {
        console.error('Erro ao adicionar time:', error);
        toast.error('Erro ao adicionar time');
      });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Adicionar Time</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nome do time"
          value={novoTime.nome}
          onChange={e => setNovoTime({ ...novoTime, nome: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="URL do escudo"
          value={novoTime.escudo}
          onChange={e => setNovoTime({ ...novoTime, escudo: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select
          value={novoTime.estado}
          onChange={e => setNovoTime({ ...novoTime, estado: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Selecione o estado</option>
          {estadosBrasil.map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
        <button
          onClick={handleAddTime}
          style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer' }}
        >
          Adicionar Time
        </button>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ textAlign: 'center' }} // Adicionei este estilo para centralizar o texto dos toasts
      />
    </div>
  );
}

export default AddTime;
