import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import VoucherCard from '../components/VoucherCard';

function Vouchers({ emailUsuario }) {
  const [vouchers, setVouchers] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [codigoResgatado, setCodigoResgatado] = useState({ codigo: '', valido_ate: '' });

  useEffect(() => {
    api.get('/vouchers')
      .then(res => setVouchers(res.data))
      .catch(err => console.error('Erro ao buscar vouchers:', err));
  }, []);

  const handleResgatar = (voucher_id) => {
    if (!emailUsuario) {
      setMensagemErro('Usuário não identificado.');
      return;
    }
  
    api.post('/resgatar', {
      email: emailUsuario,
      voucher_id: voucher_id
    })
      .then((res) => {
        setCodigoResgatado({
          codigo: res.data.codigo,
          valido_ate: res.data.valido_ate // Recebe do backend
        });
        setTimeout(() => setCodigoResgatado({ codigo: '', valido_ate: '' }), 60000);
      })
      .catch(err => {
        setMensagemErro('Erro ao resgatar voucher.');
        setTimeout(() => setMensagemErro(''), 3000);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Vouchers Disponíveis</h2>

      {mensagemErro && (
        <div style={{ marginBottom: '20px', color: 'red', fontWeight: 'bold' }}>
          {mensagemErro}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {vouchers.length === 0 ? (
          <p style={{ textAlign: 'center', width: '100%' }}>Nenhum voucher disponível</p>
        ) : (
          vouchers.map(voucher => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              onResgatar={handleResgatar}
            />
          ))
        )}
      </div>

      {codigoResgatado.codigo && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <QRCodeSVG 
            value={JSON.stringify(codigoResgatado)} // Codifica ambos os valores
            size={128}
            level="H"
            includeMargin
            style={{ margin: '0 auto' }}
          />
          <div style={{ 
            fontSize: '14px', 
            marginTop: '15px',
            wordBreak: 'break-all'
          }}>
            Código: <b>{codigoResgatado.codigo}</b>
            <br />
            Válido até: {new Date(codigoResgatado.valido_ate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Vouchers;
