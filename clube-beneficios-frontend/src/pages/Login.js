import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { email, senha });
      setMensagem(response.data.mensagem);
  
      // Armazenando o email do usuário e o tipo de usuário (admin, cliente, parceiro)
      localStorage.setItem('emailUsuario', email);
      localStorage.setItem('userRole', response.data.userRole);  // Armazenando o tipo (admin, cliente, parceiro)
  
      // Verificando o tipo de usuário para redirecionar para a página correta
      const tipoUsuario = response.data.userRole;
      onLoginSuccess(email);
      
      if (tipoUsuario === 'parceiro') {
        // Redirecionar para a página do parceiro
        navigate('/parceiro');
      } else {
        // Caso não seja parceiro, redirecionar para vouchers ou a página padrão
        navigate('/vouchers');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMensagemErro(error.response.data.erro);
      } else {
        setMensagemErro('Erro de conexão com o servidor');
      }
    }
  };

  return (
    <div className="login-container"> {/* Contêiner centralizado */}
      <div className="login-form"> {/* Formulário com estilo */}
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />
        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        /><br /><br />
        <button onClick={handleLogin}>Entrar</button>
        {mensagem && <p className="mensagem">{mensagem}</p>}
        {mensagemErro && <p className="mensagemErro">{mensagemErro}</p>}
        <p style={{ marginTop: '10px' }}>
          Ainda não tem conta?{' '}
          <a href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
