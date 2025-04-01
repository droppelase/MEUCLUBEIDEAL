import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Cadastro.css';

function Cadastro() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [repetirSenha, setRepetirSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async () => {
    // Validação simples para garantir que todos os campos obrigatórios sejam preenchidos
    if (!email || !nome || !sobrenome || !dataNascimento || !telefone || !cpf || !senha || !repetirSenha) {
      setMensagem('Todos os campos são obrigatórios.');
      return;
    }

    // Validando se as senhas coincidem
    if (senha !== repetirSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }

    // Garantir que a data esteja no formato correto (yyyy-MM-dd)
    const dataFormatada = new Date(dataNascimento).toISOString().split('T')[0]; // Formato yyyy-MM-dd

    const novoUsuario = {
      email,
      nome,
      sobrenome,
      data_nascimento: dataFormatada,
      telefone,
      cpf,
      senha, // Adicionar
      repetirSenha // Adicionar
    };

    try {
      await api.post('/register', novoUsuario);  // Certifique-se de que a URL esteja correta
      setMensagem('Cadastro realizado com sucesso!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      setMensagem('Erro ao cadastrar usuário.');
    }
  };

  return (
    <div className="form-container">
      <div className="form-form"> {/* Formulário com estilo */}
        <h2>Cadastro</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          placeholder="Sobrenome"
          value={sobrenome}
          onChange={(e) => setSobrenome(e.target.value)}
        />
        <input
          type="date"
          placeholder="Data de Nascimento"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />
        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <input
          type="password"
          placeholder="Repetir Senha"
          value={repetirSenha}
          onChange={(e) => setRepetirSenha(e.target.value)}
        />
      </div>

      <button onClick={handleCadastro} className="btn-cadastrar">Cadastrar</button>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <p>
        Já tem conta? <a href="/login">Entrar</a>
      </p>
    </div>
  );
}

export default Cadastro;
