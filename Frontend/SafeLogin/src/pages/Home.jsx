import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/logout');
      message.success('Wylogowano pomyślnie');
      navigate('/');
    } catch (error) {
      message.error('Wystąpił błąd podczas wylogowania');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
      <h2>Witaj na stronie głównej</h2>
      <Button type="primary" danger onClick={handleLogout}>
        Wyloguj się
      </Button>
    </div>
  );
};

export default Home;
