import React from 'react';
import { Form, Input, Button } from 'antd';

const Login = () => {
  const onFinish = (values) => {
    console.log('Zalogowano z danymi:', values);
    // tutaj możesz wysłać dane do API
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Logowanie</h2>
      <Form
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Nick lub Email"
          name="identifier"
          rules={[{ required: true, message: 'Podaj nick lub email!' }]}
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
    </div>
  );
};

export default Login;
