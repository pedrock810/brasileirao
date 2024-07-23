import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import AddTime from './components/AddTime';
import AddJogo from './components/AddJogo';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-time" element={<AddTime />} />
        <Route path="/add-jogo" element={<AddJogo />} />
      </Routes>
    </div>
  );
}

function Header() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/add-time">Adicionar Time</Link></li>
        <li><Link to="/add-jogo">Adicionar Jogo</Link></li>
      </ul>
    </nav>
  );
}

export default App;
