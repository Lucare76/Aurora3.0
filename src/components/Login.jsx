// src/components/Login.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrore('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      setErrore('Email o password non corretti');
    }
  };

  const handleGoogleLogin = async () => {
    setErrore('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      setErrore('Errore durante l’accesso con Google');
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>🔐 Login</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {errore && <p style={{ color: 'red' }}>{errore}</p>}
      <button type="submit">Accedi</button>
      <hr />
      <button type="button" onClick={handleGoogleLogin} style={{ backgroundColor: '#4285F4', color: 'white' }}>
        Accedi con Google
      </button>
    </form>
  );
};

export default Login;
