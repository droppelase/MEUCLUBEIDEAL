import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ emailUsuario, onLogout }) {
  const navigate = useNavigate();

  // Aqui estamos verificando o tipo de usuário (cliente ou admin)
  const tipoUsuario = localStorage.getItem('userRole');

  return (
    <header style={{
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #ccc',
      marginBottom: '20px'
    }}>
      <h1 style={{ margin: 0 }}>Meu Clube Ideal</h1>

      <div>
        {emailUsuario ? (
          <>
            {tipoUsuario === 'admin' ? (
              // Este botão só aparece para administradores
              <button onClick={() => navigate('/admin')} style={{ marginRight: '10px' }}>
                Admin
              </button>
            ) : (
              // Este botão aparece para clientes
              <button onClick={() => navigate('/perfil')} style={{ marginRight: '10px' }}>
                Perfil
              </button>
            )}
            <button onClick={onLogout}>Sair</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')}>Login</button>
        )}
      </div>
    </header>
  );
}

export default Header;
