const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'campeonato_brasileiro'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados.');
});

const calcularClassificacao = () => {
  // Atualiza a classificação de todos os times com base nos jogos
  db.query(`
    SELECT 
      t.id, 
      t.nome, 
      COALESCE(SUM(CASE 
        WHEN j.placar_mandante > j.placar_visitante AND j.mandante_id = t.id THEN 3
        WHEN j.placar_mandante < j.placar_visitante AND j.visitante_id = t.id THEN 3
        WHEN j.placar_mandante = j.placar_visitante THEN 1
        ELSE 0 
      END), 0) AS pontos,
      COALESCE(SUM(CASE 
        WHEN j.placar_mandante > j.placar_visitante AND j.mandante_id = t.id THEN 1
        WHEN j.placar_mandante < j.placar_visitante AND j.visitante_id = t.id THEN 1
        ELSE 0 
      END), 0) AS vitorias,
      COALESCE(SUM(CASE 
        WHEN j.placar_mandante = j.placar_visitante THEN 1
        ELSE 0 
      END), 0) AS empates,
      COALESCE(SUM(CASE 
        WHEN j.placar_mandante > j.placar_visitante AND j.visitante_id = t.id THEN 1
        WHEN j.placar_mandante < j.placar_visitante AND j.mandante_id = t.id THEN 1
        ELSE 0 
      END), 0) AS derrotas,
      COALESCE(SUM(CASE 
        WHEN j.mandante_id = t.id THEN j.placar_mandante
        WHEN j.visitante_id = t.id THEN j.placar_visitante
        ELSE 0 
      END), 0) AS gols_pro,
      COALESCE(SUM(CASE 
        WHEN j.mandante_id = t.id THEN j.placar_visitante
        WHEN j.visitante_id = t.id THEN j.placar_mandante
        ELSE 0 
      END), 0) AS gols_contra
    FROM times t
    LEFT JOIN jogos j ON j.mandante_id = t.id OR j.visitante_id = t.id
    GROUP BY t.id
  `, (err, results) => {
    if (err) {
      console.error('Erro ao calcular classificação:', err);
      return;
    }

    results.forEach(time => {
      const saldoGols = time.gols_pro - time.gols_contra;

      db.query(`
        UPDATE times
        SET 
          pontos = ?,
          vitorias = ?,
          empates = ?,
          derrotas = ?,
          gols_pro = ?,
          gols_contra = ?,
          saldo_gols = ?
        WHERE id = ?
      `, [time.pontos, time.vitorias, time.empates, time.derrotas, time.gols_pro, time.gols_contra, saldoGols, time.id], (updateErr) => {
        if (updateErr) {
          console.error('Erro ao atualizar time:', updateErr);
        }
      });
    });
  });
};

app.get('/api/times', (req, res) => {
  const query = 'SELECT * FROM times';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados:', err);
      res.status(500).send('Erro ao buscar dados');
      return;
    }
    res.json(results);
  });
});

app.post('/api/times', (req, res) => {
  const { nome, escudo, estado } = req.body;
  const query = 'INSERT INTO times (nome, pontos, vitorias, empates, derrotas, gols_pro, gols_contra, saldo_gols, escudo, estado) VALUES (?, 0, 0, 0, 0, 0, 0, 0, ?, ?)';
  db.query(query, [nome, escudo, estado], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar time:', err);
      res.status(500).send('Erro ao adicionar time');
      return;
    }
    res.json({ id: result.insertId });
  });
});

app.get('/api/jogos', (req, res) => {
  const query = `
    SELECT 
      j.id, 
      t1.nome AS mandante, 
      t1.escudo AS escudo_mandante, 
      t2.nome AS visitante, 
      t2.escudo AS escudo_visitante, 
      j.data, 
      j.hora,
      j.placar_mandante, 
      j.placar_visitante, 
      j.rodada 
    FROM jogos j 
    JOIN times t1 ON j.mandante_id = t1.id 
    JOIN times t2 ON j.visitante_id = t2.id
    ORDER BY j.data ASC, j.hora
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar jogos:', err);
      res.status(500).send('Erro ao buscar jogos');
      return;
    }
    res.json(results);
  });
});

app.post('/api/checkRodada', (req, res) => {
  const { mandante_id, visitante_id, rodada } = req.body;
  const query = `
    SELECT COUNT(*) AS count FROM jogos 
    WHERE (mandante_id = ? OR visitante_id = ? OR mandante_id = ? OR visitante_id = ?) 
    AND rodada = ?
  `;
  db.query(query, [mandante_id, mandante_id, visitante_id, visitante_id, rodada], (err, results) => {
    if (err) {
      console.error('Erro ao verificar jogos na rodada:', err);
      res.status(500).send('Erro ao verificar jogos na rodada');
      return;
    }
    res.json({ count: results[0].count });
  });
});

app.post('/api/jogos', (req, res) => {
  const { mandante_id, visitante_id, data, hora, placar_mandante, placar_visitante, rodada } = req.body;
  const query = 'INSERT INTO jogos (mandante_id, visitante_id, data, hora, placar_mandante, placar_visitante, rodada) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [mandante_id, visitante_id, data, hora, placar_mandante, placar_visitante, rodada];

  db.query(query, values, (error) => {
    if (error) {
      return res.status(500).json({ error: 'Erro ao adicionar jogo' });
    }
    calcularClassificacao();
    res.status(201).json({ message: 'Jogo adicionado com sucesso' });
  });
});

app.put('/api/jogos/:id', (req, res) => {
  const { id } = req.params;
  const { placar_mandante, placar_visitante } = req.body;
  const query = 'UPDATE jogos SET placar_mandante = ?, placar_visitante = ? WHERE id = ?';
  db.query(query, [placar_mandante, placar_visitante, id], (err) => {
    if (err) {
      console.error('Erro ao atualizar jogo:', err);
      res.status(500).send('Erro ao atualizar jogo');
      return;
    }
    calcularClassificacao();
    res.json({ message: 'Jogo atualizado com sucesso' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
