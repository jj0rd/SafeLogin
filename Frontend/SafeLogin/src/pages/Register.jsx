import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import axios from 'axios';

const { Paragraph } = Typography;

const Register = () => {
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:8080/register', values);
      message.success(response.data.message);
      
      // Zapisz kod QR (upewniamy się, że nie ma zduplikowanego prefixu)
      if (response.data.qrCode) {
        // Usuwamy prefix jeśli istnieje w odpowiedzi
        const qrCodeData = response.data.qrCode.replace(/^data:image\/png;base64,/, '');
        setQrCode(qrCodeData);
      }
      
      // Jeśli backend zwraca sekret, zapisz go
      if (response.data.secret) {
        setSecret(response.data.secret);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(error.response.data);
      } else {
        message.error('Błąd połączenia z serwerem.');
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Rejestracja</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Nick"
          name="nick"
          rules={[{ required: true, message: 'Podaj swój nick!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Imię"
          name="name"
          rules={[{ required: true, message: 'Podaj swoje imię!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nazwisko"
          name="surname"
          rules={[{ required: true, message: 'Podaj swoje nazwisko!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Podaj adres email!' },
            { type: 'email', message: 'Niepoprawny adres email!' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hasło"
          name="password"
          rules={[
            { required: true, message: 'Podaj hasło!' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
              message: 'Hasło musi mieć min. 8 znaków, małą i dużą literę, cyfrę i znak specjalny.'
            }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Zarejestruj się
          </Button>
        </Form.Item>
      </Form>

      {qrCode && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Paragraph>
            Zeskanuj ten kod QR za pomocą aplikacji uwierzytelniającej (np. Google Authenticator):
          </Paragraph>
          <img 
            src={`data:image/png;base64,${qrCode}`} 
            alt="QR Code" 
            style={{ maxWidth: '100%', marginTop: 10, marginBottom: 10 }}
          />
          {secret && (
            <Paragraph>
              Lub wprowadź ręcznie ten sekret: <strong>{secret}</strong>
            </Paragraph>
          )}
        </div>
      )}
    </div>
  );
};

export default Register;