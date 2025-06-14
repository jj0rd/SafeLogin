import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';


const Profile = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
      <h2>Witaj na stronie profile</h2>
     
    </div>
  );
};

export default Profile;
