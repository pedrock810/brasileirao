import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddJogo() {
  const [times, setTimes] = useState([]);
  const [novoJogo, setNovoJogo] = useState({
    mandante_id: '',
    visitante_id: '',
    data: '',
    hora: '',
    placar_mandante: '',
    placar_visitante: '',
    rodada: ''
  });

  useEffect(() => {
    fetchTimes();
  }, []);

  const fetchTimes = () => {
    axios.get('http://localhost:3001/api/times')
      .then(response => {
        const sortedTimes = response.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setTimes(sortedTimes);
      })
      .catch(error => {
        console.error('Erro ao buscar dados dos times:', error);
        toast.error('Erro ao buscar dados dos times');
      });
  };

  const handleAddJogo = () => {
    if (novoJogo.mandante_id === novoJogo.visitante_id) {
      toast.error('O mandante e o visitante não podem ser o mesmo time');
      return;
    }

    axios.post('http://localhost:3001/api/checkRodada', {
      mandante_id: novoJogo.mandante_id,
      visitante_id: novoJogo.visitante_id,
      rodada: novoJogo.rodada
    })
    .then(response => {
      if (response.data.count > 0) {
        toast.error('Um time não pode jogar mais de uma vez na mesma rodada');
        return;
      }

      axios.post('http://localhost:3001/api/jogos', novoJogo)
        .then(() => {
          setNovoJogo({
            mandante_id: '',
            visitante_id: '',
            data: '',
            hora: '',
            placar_mandante: '',
            placar_visitante: '',
            rodada: ''
          });
          toast.success('Jogo adicionado com sucesso');
        })
        .catch(error => {
          console.error('Erro ao adicionar jogo:', error);
          toast.error('Erro ao adicionar jogo');
        });
    })
    .catch(error => {
      console.error('Erro ao verificar jogos na rodada:', error);
      toast.error('Erro ao verificar jogos na rodada');
    });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Adicionar Jogo</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select
          value={novoJogo.mandante_id}
          onChange={e => setNovoJogo({ ...novoJogo, mandante_id: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Selecione o mandante</option>
          {times.map(time => (
            <option key={time.id} value={time.id}>{time.nome}</option>
          ))}
        </select>
        <select
          value={novoJogo.visitante_id}
          onChange={e => setNovoJogo({ ...novoJogo, visitante_id: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Selecione o visitante</option>
          {times.map(time => (
            <option key={time.id} value={time.id}>{time.nome}</option>
          ))}
        </select>
        <input
          type="date"
          value={novoJogo.data}
          onChange={e => setNovoJogo({ ...novoJogo, data: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="time"
          value={novoJogo.hora}
          onChange={e => setNovoJogo({ ...novoJogo, hora: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="Placar Mandante"
          value={novoJogo.placar_mandante}
          onChange={e => setNovoJogo({ ...novoJogo, placar_mandante: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="Placar Visitante"
          value={novoJogo.placar_visitante}
          onChange={e => setNovoJogo({ ...novoJogo, placar_visitante: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select
          value={novoJogo.rodada}
          onChange={e => setNovoJogo({ ...novoJogo, rodada: e.target.value })}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Selecione a rodada</option>
          {[...Array(38)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <button
          onClick={handleAddJogo}
          style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer' }}
        >
          Adicionar Jogo
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
        style={{ textAlign: 'center' }}
      />
    </div>
  );
}

export default AddJogo;
