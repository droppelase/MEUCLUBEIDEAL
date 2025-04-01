import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const ParceiroContext = createContext();

export const ParceiroProvider = ({ children }) => {
  const [parceiro, setParceiro] = useState(null);

  useEffect(() => {
    api.get('/parceiro/meus-dados') // Rota para buscar os dados do parceiro logado
      .then(res => setParceiro(res.data))
      .catch(err => console.error('Erro ao buscar dados do parceiro:', err));
  }, []);

  return (
    <ParceiroContext.Provider value={{ parceiro }}>
      {children}
    </ParceiroContext.Provider>
  );
};
