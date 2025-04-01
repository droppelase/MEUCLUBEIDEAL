import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Statistics from './Statistics';
import Clientes from './Clientes';
import Parceiros from './Parceiros';
import api from '../services/api';
import { FaArrowLeft, FaChartBar, FaUsers } from 'react-icons/fa';
import './AdminPainel.css'; // Importação do CSS

function AdminPanel() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    parceiro: '',
    descricao: '',
    validade: '',
    codigo: '',
    imagem: ''
  });
  const [imagemFile, setImagemFile] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [exibirEstatisticas, setExibirEstatisticas] = useState(false);
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [mostrarParceiros, setMostrarParceiros] = useState(false);

  const buscarVouchers = () => {
    api.get('/admin/vouchers')
      .then(res => setVouchers(res.data))
      .catch(err => console.error('Erro ao buscar vouchers:', err));
  };

  useEffect(() => {
    buscarVouchers();
  }, []);

  const [parceiros, setParceiros] = useState([]);

  useEffect(() => {
    api.get('/admin/parceiros')
      .then(res => setParceiros(res.data))
      .catch(err => console.error('Erro ao buscar parceiros:', err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImagemUpload = async () => {
    if (!imagemFile) return form.imagem || '';
    const formData = new FormData();
    formData.append('imagem', imagemFile);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.caminho;
  };

  const handleAdicionarOuEditar = async () => {
    try {
      const imagemPath = await handleImagemUpload();
      const dadosComImagem = { ...form, imagem: imagemPath };

      const url = form.id
        ? `/admin/vouchers/${form.id}`
        : '/admin/vouchers';
      const metodo = form.id ? 'put' : 'post';

      await api({ method: metodo, url, data: dadosComImagem });

      setMensagem(form.id ? 'Voucher atualizado com sucesso!' : 'Voucher adicionado com sucesso!');
      setForm({ id: null, parceiro: '', descricao: '', validade: '', codigo: '', imagem: '' });
      setImagemFile(null);
      buscarVouchers();
    } catch (err) {
      console.error('Erro ao salvar voucher:', err);
      setMensagem('Erro ao salvar voucher');
    }
  };

  const handleEditar = (voucher) => {
    setForm(voucher);
    setImagemFile(null);
    setMensagem('');
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este voucher?')) {
      try {
        await api.delete(`/admin/vouchers/${id}`);
        setMensagem('Voucher excluído com sucesso!');
        buscarVouchers();
      } catch (err) {
        console.error('Erro ao excluir voucher:', err);
        setMensagem('Erro ao excluir voucher');
      }
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Painel do Administrador</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => navigate(-1)}>
          <FaArrowLeft style={{ marginRight: '5px' }} /> Voltar
        </button>
        <button onClick={() => {
          setExibirEstatisticas(!exibirEstatisticas);
          setMostrarClientes(false);
        }}>
          <FaChartBar style={{ marginRight: '5px' }} />
          {exibirEstatisticas ? 'Voltar ao Painel' : 'Ver Estatísticas'}
        </button>
        <button onClick={() => {
          setMostrarClientes(!mostrarClientes);
          setExibirEstatisticas(false);
        }}>
          <FaUsers style={{ marginRight: '5px' }} />
          {mostrarClientes ? 'Voltar ao Painel' : 'Ver Clientes'}
        </button>
        <button onClick={() => {
          setMostrarParceiros(!mostrarParceiros);
          setMostrarClientes(false);
          setExibirEstatisticas(false);
        }}>
          <FaUsers style={{ marginRight: '5px' }} />
          {mostrarParceiros ? 'Voltar ao Painel' : 'Ver Parceiros'}
        </button>
      </div>

      {exibirEstatisticas ? (
        <Statistics />
      ) : mostrarClientes ? (
        <Clientes onVoltar={() => setMostrarClientes(false)} />
      ) : mostrarParceiros ? (
        <Parceiros onVoltar={() => setMostrarParceiros(false)} />
      ) : (
              <>
          <div style={{
            marginBottom: '40px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fafafa'
          }}>
            <h3 style={{ marginBottom: '20px' }}>{form.id ? 'Editar Voucher' : 'Adicionar Novo Voucher'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <select name="parceiro" value={form.parceiro} onChange={handleChange} style={inputStyle}>
                <option value="">Selecione o parceiro</option>
                {parceiros.map((p, index) => (
                  <option key={index} value={p.nome}>{p.nome}</option>
                ))}
              </select>
              <input name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} style={inputStyle} />
              <input type="date" name="validade" value={form.validade} onChange={handleChange} style={inputStyle} />
              <input name="codigo" placeholder="Código" value={form.codigo} onChange={handleChange} style={inputStyle} />
              <input type="file" accept="image/*" onChange={(e) => setImagemFile(e.target.files[0])} style={inputStyle} />
              <button onClick={handleAdicionarOuEditar} style={buttonStyle}>
                 {form.id ? 'Salvar Alterações' : 'Cadastrar Voucher'}
              </button>
              {mensagem && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensagem}</p>}
            </div>
          </div>

          <hr style={{ margin: '40px 0' }} />

          <h3>Vouchers Existentes</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {vouchers.map(v => (
              <div key={v.id} style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '15px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                backgroundColor: '#fff'
              }}>
                {v.imagem && (
                  <img
                    src={`http://localhost:5000/${v.imagem}`}
                    alt={v.parceiro}
                    style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '10px' }}
                  />
                )}
                <strong>{v.parceiro}</strong><br />
                <span>{v.descricao}</span><br />
                <small>Validade: {v.validade} | Código: {v.codigo}</small><br />
    
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => handleEditar(v)}>Editar</button>
                  <button
                    onClick={() => handleExcluir(v.id)}
                    style={{
                      padding: '5px 10px',
                      border: 'none',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}

          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '10px 0px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  width: '100%'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default AdminPanel;
