import React from 'react';
import './App.css';
import { Layout, Menu, theme, Breadcrumb } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider } from './auth/AuthContext'
import PrivateRoute from './auth/PrivateRoute';

const { Header, Content, Footer } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <AuthProvider>
      <Router>
        <Layout className="app-layout">
          <Header className="app-header">
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']}>
              <Menu.Item key="home"><Link to="/">Home</Link></Menu.Item>
              <Menu.Item key="login"><Link to="/login">Login</Link></Menu.Item>
              <Menu.Item key="register"><Link to="/register">Register</Link></Menu.Item>
            </Menu>
          </Header>

          <div className="app-content-wrapper">
            <Breadcrumb className="app-breadcrumb">
              <Breadcrumb.Item>Strona</Breadcrumb.Item>
              <Breadcrumb.Item>Główna</Breadcrumb.Item>
            </Breadcrumb>

            <Layout
              className="app-inner-layout"
              style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
            >
              <Content className="app-content">
                <Routes>
                  <Route path="/" element={
                    <div>
                      <h1>Witamy na głównej stronie</h1>
                      <p>Jeśli posiadasz konto, <Link to="/login">zaloguj się</Link>.</p>
                      <p>W przeciwnym wypadku, <Link to="/register">zarejestruj się</Link>.</p>
                    </div>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/home"
                    element={
                      <PrivateRoute>
                        <Home />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Content>
            </Layout>
          </div>

          <Footer className="app-footer">©{new Date().getFullYear()}</Footer>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
