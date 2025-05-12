import React from 'react';
import { Form, Input, Button } from 'antd';

const Home = () => {
  const onFinish = (values) => {
    console.log('Zarejestrowano z danymi:', values);
    // tutaj możesz wysłać dane do API
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Rejestracja</h2>
     
    </div>
  );
};

export default Home;
