import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Card, Typography, Avatar, Divider, message, Collapse } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css'
const { Title, Text } = Typography;
const { Meta } = Card;
const { Panel } = Collapse;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/check-auth', { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => message.error('Nie udało się pobrać danych użytkownika'));

    axios.get('http://localhost:8080/AllVideos', { withCredentials: true })
      .then(res => setVideos(res.data.slice(0, 4)))
      .catch(() => message.error('Nie udało się pobrać filmów'));
  }, []);

  return (
    <div className="profile-container">
      <Row gutter={24}>
        {/* Lewa sekcja - dane użytkownika + menu */}
        <Col xs={24} md={8}>
          <Card>
            <div className="profile-info">
              <Avatar size={64}>{user?.nick?.charAt(0)?.toUpperCase()}</Avatar>
              <Title level={3} style={{ marginTop: '10px' }}>{user?.nick}</Title>
              <Divider />
              <Text><strong>Email:</strong> {user?.email}</Text><br />
              <Text><strong>Imię:</strong> {user?.name || '-'}</Text><br />
              <Text><strong>Nazwisko:</strong> {user?.surname || '-'}</Text>
            </div>
            <Divider />
            <Collapse ghost defaultActiveKey={[]}>
              <Panel header="Konto" key="1">
                <Text><strong>Dane konta</strong></Text>
                <p>Szczegółowe dane konta</p>
              </Panel>
              <Panel header="Rekomendacje" key="2">
                <Link to="/recommendation" className="menu-link">
                  <strong>Lista rekomendacji</strong>
                </Link>
                <p>Preferencje na podstawie oglądanych treści</p>
              </Panel>
              <Panel header="Subskrypcja" key="3">
                <Text><strong>Twoje subskrypcje</strong></Text>
                <p>Lista Subskrypcji</p>
              </Panel>
            </Collapse>
          </Card>
        </Col>

        {/* Prawa sekcja - filmy */}
        <Col xs={24} md={16}>
          <Card title="Twoje filmy">
            <Row gutter={[16, 16]}>
              {videos.map(video => (
                <Col xs={24} sm={12} md={12} key={video.id}>
                  <Card
                    hoverable
                    cover={<img alt="thumbnail" src={video.url} style={{ height: 150, objectFit: 'cover' }} />}
                    onClick={() => navigate(`/video/${video.id}`)}
                  >
                    <Meta title={video.title} description="Autor, liczba wyświetleń" />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
