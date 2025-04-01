import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Perfil({ email }) {
  const [resgates, setResgates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        if (!email) return;
        const res = await api.get(`/usuario/resgates?email=${email}`);
        setResgates(res.data);
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      }
    };

    carregarDados();
  }, [email]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Meu Perfil</h2>
      <p><strong>Usuário:</strong> {email || 'Não identificado'}</p>

      <button onClick={() => navigate(-1)}>Voltar</button>

      <h3 style={{ marginTop: '20px' }}>
        📝 Vouchers Resgatados
      </h3>

      {resgates.length === 0 ? (
        <p>Você ainda não resgatou nenhum voucher.</p>
      ) : (
        resgates.map((v, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
            <strong>{v.parceiro}</strong><br />
            {v.descricao}<br />
            Validade: {v.validade} <br />
            Código: {v.codigo}<br />
            <small>Resgatado em: {new Date(v.data_resgate).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default Perfil;
