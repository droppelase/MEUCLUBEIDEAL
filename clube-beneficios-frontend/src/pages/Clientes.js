import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaClipboardList, FaArrowLeft, FaEdit, FaSave } from 'react-icons/fa';
import './Clientes.css'; 

function Clientes({ onVoltar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [editandoTipo, setEditandoTipo] = useState(null);
  const [novoTipo, setNovoTipo] = useState('');

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const buscarUsuarios = () => {
    api.get('/admin/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error('Erro ao buscar usuários:', err));
  };

  const formatarData = (isoString) => {
    const data = new Date(isoString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };

  const handleEditar = (emailAtual, tipoAtual) => {
    setEditandoTipo(emailAtual);
    setNovoTipo(tipoAtual);
  };

  const handleSalvar = async (email) => {
    try {
      await api.put('/admin/usuarios/tipo', {
        email,
        tipo: novoTipo
      });
      setEditandoTipo(null);
      buscarUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar tipo de usuário:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '15px' }}>
        <FaClipboardList style={{ marginRight: '8px' }} />
        Lista de Clientes Cadastrados
      </h3>

      <button onClick={onVoltar} style={{ marginBottom: '15px' }}>
        <FaArrowLeft style={{ marginRight: '5px' }} />
        Voltar
      </button>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Email</th>
            <th style={th}>Data de Cadastro</th>
            <th style={th}>Tipo</th>
            <th style={th}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user, index) => (
            <tr key={index}>
              <td style={td}>{user.email}</td>
              <td style={td}>{user.data_cadastro ? formatarData(user.data_cadastro) : 'Não disponível'}</td>
              <td style={td}>
                {editandoTipo === user.email ? (
                  <select value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)}>
                    <option value="cliente">cliente</option>
                    <option value="admin">admin</option>
                    <option value="parceiro">parceiro</option>
                  </select>
                ) : (
                  user.tipo || 'cliente'
                )}
              </td>
              <td style={td}>
                {editandoTipo === user.email ? (
                  <button onClick={() => handleSalvar(user.email)}>
                    <FaSave /> Salvar
                  </button>
                ) : (
                  <button onClick={() => handleEditar(user.email, user.tipo || 'cliente')}>
                    <FaEdit /> Editar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  borderBottom: '2px solid #ccc',
  textAlign: 'left',
  padding: '10px'
};

const td = {
  borderBottom: '1px solid #eee',
  padding: '10px'
};

export default Clientes;
