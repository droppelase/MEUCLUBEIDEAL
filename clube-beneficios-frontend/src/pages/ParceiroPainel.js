import React, { useState, useEffect, useRef, useLayoutEffect, useContext } from 'react';
import api from '../services/api';
import jsQR from 'jsqr';
import './ParceiroPainel.css';
import { ParceiroContext } from './ParceiroContext';

function ParceiroPanel() {
  const [codigo, setCodigo] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [videoRendered, setVideoRendered] = useState(false);
  const { parceiro } = useContext(ParceiroContext);

  useLayoutEffect(() => {
    if (videoRef.current) {
      setVideoRendered(true);
    }
  }, []);

  useEffect(() => {
    let intervalId;

    const inicializarCamera = async () => {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          videoRef.current.srcObject = stream;
          setCameraAtiva(true);
        } catch (err) {
          console.error("Erro ao acessar a câmera:", err);
          setMensagemErro("Erro ao acessar a câmera.");
        }
      } else {
        console.error("Elemento de vídeo não encontrado.");
        setMensagemErro("Elemento de vídeo não encontrado.");
      }
    };

    if (cameraAtiva && videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const tick = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            setCodigo(code.data);
            setCameraAtiva(false);
            clearInterval(intervalId);
          }
        }
      };
      intervalId = setInterval(tick, 100);
    } else if (!cameraAtiva && videoRendered) {
      inicializarCamera();
    }

    return () => clearInterval(intervalId);
  }, [cameraAtiva, videoRendered]);

  const handleAbrirCamera = () => {
    if (!cameraAtiva) {
      setCameraAtiva(true);
    }
  };

  const handleValidar = async () => {
    try {
      if (!parceiro || !parceiro.nome) {
        setMensagemErro("Nome do parceiro não encontrado.");
        return;
      }
      await api.post('/parceiro/validar', { 
        codigo,
        parceiro: parceiro.nome 
      });
      setMensagemErro('');
    } catch (err) {
      setMensagemErro(err.response?.data?.erro || 'Erro ao validar voucher.');
    }
  };

  return (
    <div className="parceiro-panel">
      <h2>Validação de Voucher</h2>

      {!cameraAtiva && (
        <button onClick={handleAbrirCamera}>
          Abrir Câmera
        </button>
      )}

      {cameraAtiva && (
        <div className="video-container">
          <video ref={videoRef} autoPlay playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      <p>ou</p>

      <input
        type="text"
        placeholder="Digite o código manualmente"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      <button onClick={handleValidar} className="validar-button">
        Validar Voucher
      </button>

      {mensagemErro && <p className="mensagem-erro">{mensagemErro}</p>}
    </div>
  );
}

export default ParceiroPanel;
