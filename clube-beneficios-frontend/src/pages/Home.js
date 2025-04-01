import React from 'react';

function Home({ onEntrar }) {
  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(to right, #4CAF50, #8BC34A)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1>Clube de Benefícios</h1>
      <p>Economize com os melhores parceiros da sua cidade!</p>
      <button
        onClick={onEntrar}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#ffffff',
          color: '#4CAF50',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Entrar
      </button>
    </div>
  );
}

export default Home;
