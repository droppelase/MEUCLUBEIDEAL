import React from 'react';

function VoucherCard({ voucher, onResgatar }) {
  return (
    <div
      style={{
        width: '250px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '15px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {voucher.imagem && (
        <img
          src={`http://localhost:5000/${voucher.imagem}`}
          alt={voucher.parceiro}
          style={{
            maxHeight: '100px',
            marginBottom: '12px',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      )}

      <strong style={{ fontSize: '16px', textAlign: 'center' }}>{voucher.parceiro}</strong>
      <p style={{ fontSize: '14px', textAlign: 'center', margin: '10px 0' }}>{voucher.descricao}</p>

      <small style={{ fontSize: '12px', color: '#666' }}>
        Validade: {voucher.validade}<br />
        Código: <b>{voucher.codigo}</b>
      </small>

      <button
        onClick={() => onResgatar(voucher.id)}
        style={{
          marginTop: '12px',
          padding: '8px 12px',
          border: 'none',
          backgroundColor: '#28a745',
          color: '#fff',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Resgatar
      </button>
    </div>
  );
}

export default VoucherCard;
