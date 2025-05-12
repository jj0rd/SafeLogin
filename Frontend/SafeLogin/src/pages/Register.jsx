import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import axios from 'axios';

const { Paragraph, Link } = Typography;

const Register = () => {
  const [qrLink, setQrLink] = useState(null);

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:8080/register', values);
      message.success(response.data.message);
      setQrLink(response.data.otpAuthURL);
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

      {qrLink && (
        <Paragraph style={{ marginTop: 20 }}>
          Zeskanuj ten kod QR za pomocą aplikacji uwierzytelniającej:
          <br />
          <Link href={qrLink} target="_blank">
            {qrLink}
          </Link>
        </Paragraph>
      )}
    </div>
  );
};

export default Register;
