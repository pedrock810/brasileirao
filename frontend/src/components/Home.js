import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function Home() {
  const [times, setTimes] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [rodadaSelecionada, setRodadaSelecionada] = useState(1);

  const fetchTimes = () => {
    axios.get('http://localhost:3001/api/times')
      .then(response => {
        setTimes(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar dados dos times:', error);
      });
  };

  const fetchJogos = () => {
    axios.get('http://localhost:3001/api/jogos')
      .then(response => {
        setJogos(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar dados dos jogos:', error);
      });
  };

  useEffect(() => {
    fetchTimes();
    fetchJogos();
  }, []);

  const jogosRodada = jogos.filter(jogo => jogo.rodada === rodadaSelecionada);

  const timesFiltrados = filtroEstado ? times.filter(time => time.estado === filtroEstado) : times;

  const sortTimes = (times) => {
    return times.sort((a, b) => {
      if (a.pontos !== b.pontos) return b.pontos - a.pontos;
      if (a.saldo_gols !== b.saldo_gols) return b.saldo_gols - a.saldo_gols;
      if (a.vitorias !== b.vitorias) return b.vitorias - a.vitorias;
      return a.nome.localeCompare(b.nome);
    });
  };

  const sortedTimes = sortTimes(timesFiltrados);

  const formatarData = (data) => {
    const dataObj = new Date(data);
    return `${dataObj.getDate()}/${dataObj.getMonth() + 1}/${dataObj.getFullYear()}`;
  };

  const formatarHora = (hora) => {
    const [h, m, s] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  };

  const estadosOrdenados = [...new Set(times.map(time => time.estado))].sort();

  const shouldShowLegenda = !filtroEstado;

  return (
    <div>
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        Campeonato Brasileiro Série A - 2024
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Filtrar por Estado</h2>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos os Estados</option>
          {estadosOrdenados.map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      > 
        Tabela

      </motion.h2>
      <motion.table
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <thead>
          <tr>
            <th>Colocação</th>
            <th></th>
            <th>Time</th>
            <th>Pontos</th>
            <th>Vitórias</th>
            <th>Empates</th>
            <th>Derrotas</th>
            <th>Gols Pró</th>
            <th>Gols Contra</th>
            <th>Saldo de Gols</th>
          </tr>
        </thead>
        <motion.tbody>
          {sortedTimes.map((time, index) => (
            <motion.tr
              key={time.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <td className={
                !filtroEstado ? (
                  index < 4 ? 'libertadores' :
                  index < 6 ? 'pre-libertadores' :
                  index >= 6 && index <= 11 ? 'sul-americana' :
                  index >= sortedTimes.length - 4 ? 'relegation-zone' : ''
                ) : ''
              }>
                {index + 1}
              </td>
              <td><img src={time.escudo} alt={time.nome} className="escudo" /></td>
              <td>{time.nome}</td>
              <td>{time.pontos}</td>
              <td>{time.vitorias}</td>
              <td>{time.empates}</td>
              <td>{time.derrotas}</td>
              <td>{time.gols_pro}</td>
              <td>{time.gols_contra}</td>
              <td>{time.saldo_gols}</td>
            </motion.tr>
          ))}
        </motion.tbody>
      </motion.table>

      {shouldShowLegenda && (
        <motion.div
          className="legenda"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h3>Legenda:</h3>
          <p><span className="legenda-item libertadores"></span> Libertadores</p>
          <p><span className="legenda-item pre-libertadores"></span> Pré-Libertadores</p>
          <p><span className="legenda-item sul-americana"></span> Sul-Americana</p>
          <p><span className="legenda-item relegation-zone"></span> Rebaixados</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Calendário de Jogos</h2>
        <label>Selecione a Rodada:</label>
        <select value={rodadaSelecionada} onChange={e => setRodadaSelecionada(parseInt(e.target.value))}>
          {[...Array(38)].map((_, i) => (
            <option key={i + 1} value={i + 1}>Rodada {i + 1}</option>
          ))}
        </select>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        Rodada {rodadaSelecionada}
      </motion.h3>
      <motion.table
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <thead>
          <tr>
            <th>Mandante</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>Visitante</th>
            <th>Data</th>
            <th>Hora</th>
          </tr>
        </thead>
        <motion.tbody>
          {jogosRodada.map((jogo, index) => (
            <motion.tr
              key={jogo.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <td><img src={jogo.escudo_mandante} alt={jogo.mandante} className="escudo" /></td>
              <td>{jogo.mandante}</td>
              <td>{jogo.placar_mandante !== null ? jogo.placar_mandante : '-'}</td>
              <td>X</td>
              <td>{jogo.placar_visitante !== null ? jogo.placar_visitante : '-'}</td>
              <td>{jogo.visitante}</td>
              <td><img src={jogo.escudo_visitante} alt={jogo.visitante} className="escudo" /></td>
              <td>{formatarData(jogo.data)}</td>
              <td>{formatarHora(jogo.hora)}</td>
            </motion.tr>
          ))}
        </motion.tbody>
      </motion.table>
    </div>
  );
}

export default Home;