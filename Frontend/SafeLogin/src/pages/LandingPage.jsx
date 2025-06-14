import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
const { Meta } = Card;

const LandingPage = () => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:8080/AllVideos', {
          method: 'GET',
          credentials: 'include', // <- to powoduje wysłanie ciastek
        });

        if (!response.ok) {
          throw new Error('Nie udało się pobrać filmów');
        }

        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error(error);
        message.error('Błąd podczas pobierania filmów');
      }
    };

    fetchVideos();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ textAlign: 'center' }}>Polecane Filmy</h2>
      <Row gutter={[16, 16]}>
        {videos.map(video => (
          <Col xs={24} sm={12} md={8} lg={6} key={video.id}>
            <Card
              hoverable
              cover={<img alt="thumbnail" src={video.url} style={{ height: 150, objectFit: 'cover' }} />}
              onClick={() => navigate(`/video/${video.id}`)}
            >
              <Meta
                title={video.title}
                description="Autor liczba, wyświetleń"
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default LandingPage;
