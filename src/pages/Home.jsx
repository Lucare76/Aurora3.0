// src/pages/Home.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      navigate(user ? '/dashboard' : '/login');
    });

    return () => unsubscribe();
  }, [navigate]);

  return null;
};

export default Home;
