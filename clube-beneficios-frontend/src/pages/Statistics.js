import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Statistics() {
  const [estatisticas, setEstatisticas] = useState({ total: 0, por_voucher: [] });

  useEffect(() => {
    api.get('/admin/estatisticas')
      .then(res => {
        const data = res.data;
        setEstatisticas({
          total: data.total || 0,
          por_voucher: Array.isArray(data.por_voucher) ? data.por_voucher : []
        });
      })
      .catch(err => {
        console.error('Erro ao carregar estatísticas:', err);
        setEstatisticas({ total: 0, por_voucher: [] });
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>📊 Estatísticas de Resgates</h2>

      <div style={{
        backgroundColor: '#e8f5e9',
        padding: '15px',
        marginBottom: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 0 6px rgba(0, 0, 0, 0.1)'
      }}>
        <strong style={{ fontSize: '20px' }}>Total de resgates:</strong>
        <p style={{ fontSize: '26px', margin: 0, color: '#2e7d32' }}>🎟️ {estatisticas.total}</p>
      </div>

      <h3 style={{ marginBottom: '15px' }}>📌 Resgates por Voucher</h3>

      {estatisticas.por_voucher.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: '#777' }}>
          Nenhum resgate registrado ainda.
        </p>
      ) : (
        estatisticas.por_voucher.map((v, index) => (
          <div key={index} style={{
            backgroundColor: '#fff',
            padding: '12px 18px',
            marginBottom: '12px',
            borderLeft: '6px solid #2196f3',
            borderRadius: '6px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)'
          }}>
            <strong style={{ fontSize: '16px' }}>{v.parceiro}</strong><br />
            <span>Resgates: <strong>{v.resgates}</strong></span>
          </div>
        ))
      )}
    </div>
  );
}

export default Statistics;
