import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Parceiros.css';  // Importando o arquivo CSS

function Parceiros() {
  const [parceiros, setParceiros] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoCnpj, setNovoCnpj] = useState('');
  const [novoNomeResponsavel, setNovoNomeResponsavel] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [editarId, setEditarId] = useState(null);

  const buscarParceiros = () => {
    api.get('/admin/parceiros')
      .then(res => setParceiros(res.data))
      .catch(err => console.error('Erro ao buscar parceiros:', err));
  };

  useEffect(() => {
    buscarParceiros();
  }, []);

  const handleAdicionar = () => {
    if (!novoNome.trim() || !novoEmail.trim() || !novoCnpj.trim() || !novoNomeResponsavel.trim() || !novoTelefone.trim()) {
      setMensagem('Todos os campos são obrigatórios!');
      return;
    }

    const novoParceiro = {
      nome: novoNome,
      email: novoEmail,
      cnpj: novoCnpj,
      nome_responsavel: novoNomeResponsavel,
      telefone: novoTelefone
    };

    api.post('/admin/parceiros', novoParceiro)
      .then(() => {
        setMensagem('Parceiro adicionado com sucesso!');
        setNovoNome('');
        setNovoEmail('');
        setNovoCnpj('');
        setNovoNomeResponsavel('');
        setNovoTelefone('');
        buscarParceiros();
        setTimeout(() => setMensagem(''), 3000);
      })
      .catch(err => {
        console.error('Erro ao adicionar parceiro:', err);
        setMensagem('Erro ao adicionar parceiro');
      });
  };

  const handleEditar = (parceiro) => {
    setEditarId(parceiro.id);
    setNovoNome(parceiro.nome);
    setNovoEmail(parceiro.email);
    setNovoCnpj(parceiro.cnpj);
    setNovoNomeResponsavel(parceiro.nome_responsavel);
    setNovoTelefone(parceiro.telefone);
  };

  const handleAtualizar = () => {
    if (!novoNome.trim() || !novoEmail.trim() || !novoCnpj.trim() || !novoNomeResponsavel.trim() || !novoTelefone.trim()) {
      setMensagem('Todos os campos são obrigatórios!');
      return;
    }

    const parceiroAtualizado = {
      nome: novoNome,
      email: novoEmail,
      cnpj: novoCnpj,
      nome_responsavel: novoNomeResponsavel,
      telefone: novoTelefone
    };

    api.put(`/admin/parceiros/${editarId}`, parceiroAtualizado)
      .then(() => {
        setMensagem('Parceiro atualizado com sucesso!');
        setNovoNome('');
        setNovoEmail('');
        setNovoCnpj('');
        setNovoNomeResponsavel('');
        setNovoTelefone('');
        buscarParceiros();
        setEditarId(null);
        setTimeout(() => setMensagem(''), 3000);
      })
      .catch(err => {
        console.error('Erro ao atualizar parceiro:', err);
        setMensagem('Erro ao atualizar parceiro');
      });
  };

  const handleExcluir = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este parceiro?')) {
      api.delete(`/admin/parceiros/${id}`)
        .then(() => {
          setMensagem('Parceiro excluído com sucesso!');
          buscarParceiros();
          setTimeout(() => setMensagem(''), 3000);
        })
        .catch(err => {
          console.error('Erro ao excluir parceiro:', err);
          setMensagem('Erro ao excluir parceiro');
        });
    }
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h3>Parceiros</h3>

      <div className="add-parceiro-card">
        <h4>Adicionar Novo Parceiro</h4>
        <input
          type="text"
          placeholder="Nome do parceiro"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="CNPJ"
          value={novoCnpj}
          onChange={(e) => setNovoCnpj(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nome do Responsável"
          value={novoNomeResponsavel}
          onChange={(e) => setNovoNomeResponsavel(e.target.value)}
        />
        <input
          type="text"
          placeholder="Telefone"
          value={novoTelefone}
          onChange={(e) => setNovoTelefone(e.target.value)}
        />
        <button onClick={editarId ? handleAtualizar : handleAdicionar}>
          {editarId ? 'Atualizar Parceiro' : 'Adicionar Parceiro'}
        </button>
      </div>

      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}

      <table className="table-parceiros">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>CNPJ</th>
            <th>Nome do Responsável</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {parceiros.map(p => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.email}</td>
              <td>{p.cnpj}</td>
              <td>{p.nome_responsavel}</td>
              <td>{p.telefone}</td>
              <td>
                <button className="button" onClick={() => handleEditar(p)}>
                  Editar
                </button>
                <button className="button button-danger" onClick={() => handleExcluir(p.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Parceiros;
