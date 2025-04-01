import React, { useState, useEffect } from 'react';
import { BuilderComponent, builder } from '@builder.io/react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Vouchers from './pages/Vouchers';
import AdminPanel from './pages/AdminPanel';
import ParceiroPainel from './pages/ParceiroPainel';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { ParceiroProvider } from './pages/ParceiroContext';  // Importe o contexto

builder.init('2aa876888b274dd7857c499b5ca4bc05');

function AppWrapper() {
  const navigate = useNavigate();
  const [emailUsuario, setEmailUsuario] = useState(localStorage.getItem('emailUsuario') || '');
  const logado = !!emailUsuario;
  const [builderContent, setBuilderContent] = useState(null);

  useEffect(() => {
    builder.get('page', { url: '/home' }).toPromise().then(setBuilderContent);
  }, []);

  const handleLogin = (email) => {
    localStorage.setItem('emailUsuario', email);
    setEmailUsuario(email);
    navigate('/vouchers');
  };

  const handleLogout = () => {
    localStorage.removeItem('emailUsuario');
    setEmailUsuario('');
    navigate('/');
  };

  return (
    <>
      {logado && <Header emailUsuario={emailUsuario} onLogout={handleLogout} />}

      <Routes>
        <Route
          path="/"
          element={
            builderContent ? (
              <BuilderComponent model="page" content={builderContent} />
            ) : (
              <Home onEntrar={() => navigate('/login')} />
            )
          }
        />
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={handleLogin}
              onIrParaCadastro={() => navigate('/cadastro')}
            />
          }
        />
        <Route
          path="/cadastro"
          element={<Cadastro onVoltar={() => navigate('/login')} />}
        />
        <Route
          path="/vouchers"
          element={
            <ProtectedRoute>
              <Vouchers emailUsuario={emailUsuario} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil email={emailUsuario} onVoltar={() => navigate('/vouchers')} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel onVoltar={() => navigate('/')} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parceiro"
          element={
            <ParceiroProvider>
                <ParceiroPainel />
            </ParceiroProvider>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
