import React from 'react';
import { Form, Input, Button } from 'antd';

const Register = () => {
  const onFinish = (values) => {
    console.log('Zarejestrowano z danymi:', values);
    // tutaj możesz wysłać dane do API
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Rejestracja</h2>
      <Form
        layout="vertical"
        onFinish={onFinish}
      >
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
          rules={[{ required: true, message: 'Podaj hasło!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Zarejestruj się
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
