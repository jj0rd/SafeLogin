import React, { useState } from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Login = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, login, csrfToken, setIsAuthenticated, setUser } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" />;
  }

  const onFinish = async (values) => {
    if (!csrfToken) {
      message.error('Token CSRF nie jest dostępny, odśwież stronę');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (response.ok) {
        if (data.require2FA) {
          message.info(data.message || 'Wymagana weryfikacja 2FA');
          setIsModalVisible(true);
        } else {
          message.success(data.message || 'Zalogowano');
          login(data.user || {});
          navigate('/home');
        }
      } else {
        message.error(data.message || data || 'Błąd logowania');
      }
    } catch (err) {
      console.error('Błąd połączenia:', err);
      message.error('Błąd połączenia z serwerem');
    }
  };

  const handleTotpSubmit = async () => {
  if (!csrfToken) {
    message.error('Token CSRF nie jest dostępny, odśwież stronę');
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/2fa/verify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ code: parseInt(totpCode, 10) }),
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (response.ok) {
      message.success(data.message || 'Weryfikacja zakończona');
      setIsModalVisible(false);

      // Po prostu oznacz jako zalogowanego
      setIsAuthenticated(true);

      // Pobierz dane użytkownika, tak jak robi to useEffect
      const userResponse = await fetch('http://localhost:8080/current-user', {
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else {
        setUser(null);
      }

      navigate('/home');
    } else {
      message.error(data.message || data || 'Błąd 2FA');
    }
  } catch (err) {
    console.error('Błąd weryfikacji TOTP:', err);
    message.error('Błąd połączenia przy weryfikacji TOTP');
  }
};


  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Logowanie</h2>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Podaj email!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hasło"
          name="password"
          rules={[{ required: true, message: 'Podaj hasło!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Zaloguj się
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Weryfikacja dwuskładnikowa"
        open={isModalVisible}
        onOk={handleTotpSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="Potwierdź"
        cancelText="Anuluj"
      >
        <Input
          placeholder="Wpisz kod TOTP"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
          maxLength={20}
        />
      </Modal>
    </div>
  );
};

export default Login;
