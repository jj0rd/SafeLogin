import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Avatar, 
  Divider, 
  message, 
  Button,
  Space,
  Tag,
  Statistic,
  List,
  Empty,
  Skeleton,
  Badge
} from 'antd';
import { 
  UserOutlined,
  VideoOutlined,
  EyeOutlined,
  HeartOutlined,
  SettingOutlined,
  StarOutlined,
  PlayCircleOutlined,
  MailOutlined,
  EditOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    subscriptions: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const userRes = await axios.get('http://localhost:8080/check-auth', { 
          withCredentials: true 
        });
        setUser(userRes.data);

        // Fetch videos
        const videosRes = await axios.get('http://localhost:8080/AllVideos', { 
          withCredentials: true 
        });
        setVideos(videosRes.data.slice(0, 6));

        // Calculate stats (mock data - replace with real API calls)
        setStats({
          totalVideos: videosRes.data.length,
          totalViews: videosRes.data.length * 1234, // Mock calculation
          totalLikes: videosRes.data.length * 89,   // Mock calculation
          subscriptions: 15 // Mock data
        });

      } catch (error) {
        message.error('Nie udało się pobrać danych profilu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getThumbnail = (video) => {
    if (video.thumbnail) return video.thumbnail;
    if (video.url.includes('youtube.com')) {
      try {
        const videoId = new URLSearchParams(new URL(video.url).search).get('v');
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      } catch {
        return 'https://via.placeholder.com/320x180?text=Video';
      }
    }
    return video.url;
  };

  const menuItems = [
    {
      key: 'account',
      icon: <SettingOutlined />,
      title: 'Ustawienia konta',
      description: 'Zarządzaj swoimi danymi osobowymi',
      action: () => navigate('/settings')
    },
    {
      key: 'recommendations',
      icon: <StarOutlined />,
      title: 'Rekomendacje',
      description: 'Personalizowane sugestie filmów',
      action: () => navigate('/recommendation')
    },
    {
      key: 'subscriptions',
      icon: <HeartOutlined />,
      title: 'Subskrypcje',
      description: 'Twoi ulubieni twórcy',
      count: stats.subscriptions
    },
    {
      key: 'analytics',
      icon: <TrophyOutlined />,
      title: 'Statystyki',
      description: 'Analiza Twoich filmów'
    }
  ];

  if (loading) {
    return (
      <div className="profile-container">
        <Row gutter={24}>
          <Col xs={24} lg={8}>
            <Card>
              <Skeleton avatar active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Row gutter={[24, 24]}>
        {/* Profile Header - Full Width */}
        <Col span={24}>
          <Card className="profile-header-card">
            <div className="profile-header">
              <div className="profile-basic-info">
                <Badge 
                  count={<div className="online-badge">Online</div>} 
                  offset={[-10, 10]}
                >
                  <Avatar 
                    size={120} 
                    className="profile-avatar"
                    icon={<UserOutlined />}
                    src={user?.avatar}
                  >
                    {user?.nick?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Badge>
                
                <div className="profile-details">
                  <Space direction="vertical" size="small">
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                      {user?.nick}
                      <Tag color="gold" style={{ marginLeft: 8 }}>
                        Creator
                      </Tag>
                    </Title>
                    
                    <Space wrap>
                      <Text type="secondary">
                        <MailOutlined /> {user?.email}
                      </Text>
                      {user?.name && (
                        <Text type="secondary">
                          <UserOutlined /> {user.name} {user.surname}
                        </Text>
                      )}
                    </Space>
                    
                    <Paragraph type="secondary" style={{ margin: '8px 0' }}>
                      Twórca treści video • Dołączył: {new Date().getFullYear() - 1} • Warszawa, PL
                    </Paragraph>
                    
                    <Space>
                      <Button type="primary" icon={<EditOutlined />}>
                        Edytuj profil
                      </Button>
                      <Button icon={<SettingOutlined />}>
                        Ustawienia
                      </Button>
                    </Space>
                  </Space>
                </div>
              </div>

              {/* Statistics */}
              <div className="profile-stats">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Filmy"
                      value={stats.totalVideos}
                      prefix={<VideoOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Wyświetlenia"
                      value={stats.totalViews}
                      prefix={<EyeOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Polubienia"
                      value={stats.totalLikes}
                      prefix={<HeartOutlined />}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Subskrypcje"
                      value={stats.subscriptions}
                      prefix={<StarOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>

        {/* Left Sidebar - Menu */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <SettingOutlined />
                <span>Panel zarządzania</span>
              </Space>
            }
            className="menu-card"
          >
            <List
              itemLayout="horizontal"
              dataSource={menuItems}
              renderItem={item => (
                <List.Item
                  className="menu-item"
                  onClick={item.action}
                  style={{ cursor: item.action ? 'pointer' : 'default' }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ backgroundColor: '#f6ffed', color: '#52c41a' }}
                        icon={item.icon}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{item.title}</Text>
                        {item.count && (
                          <Badge count={item.count} size="small" />
                        )}
                      </Space>
                    }
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Quick Actions */}
          <Card 
            title="Szybkie akcje" 
            style={{ marginTop: 16 }}
            className="quick-actions-card"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                icon={<PlayCircleOutlined />}
                size="large"
                onClick={() => navigate('/upload')}
              >
                Dodaj nowy film
              </Button>
              <Button 
                block 
                icon={<EyeOutlined />}
                onClick={() => navigate('/analytics')}
              >
                Zobacz statystyki
              </Button>
              <Button 
                block 
                icon={<HeartOutlined />}
                onClick={() => navigate('/liked')}
              >
                Polubione filmy
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Right Content - Videos */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <VideoOutlined />
                <span>Twoje filmy ({videos.length})</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/my-videos')}>
                Zobacz wszystkie
              </Button>
            }
            className="videos-card"
          >
            {videos.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nie masz jeszcze żadnych filmów"
                style={{ padding: '40px 0' }}
              >
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={() => navigate('/upload')}
                >
                  Dodaj pierwszy film
                </Button>
              </Empty>
            ) : (
              <Row gutter={[16, 16]}>
                {videos.map(video => (
                  <Col xs={24} sm={12} lg={12} xl={8} key={video.id}>
                    <Card
                      hoverable
                      className="video-card"
                      cover={
                        <div className="video-thumbnail">
                          <img
                            alt="thumbnail"
                            src={getThumbnail(video)}
                            style={{ 
                              height: 160, 
                              width: '100%',
                              objectFit: 'cover' 
                            }}
                          />
                          <div className="video-overlay">
                            <PlayCircleOutlined style={{ fontSize: 24, color: 'white' }} />
                          </div>
                        </div>
                      }
                      onClick={() => navigate(`/video/${video.id}`)}
                      actions={[
                        <EyeOutlined key="views" />,
                        <HeartOutlined key="likes" />,
                        <EditOutlined key="edit" />
                      ]}
                    >
                      <Meta 
                        title={
                          <Text ellipsis style={{ fontWeight: 600 }}>
                            {video.title}
                          </Text>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              1.2K wyświetleń • 2 dni temu
                            </Text>
                            <Space>
                              <Tag color="processing">HD</Tag>
                              <Tag color="success">Publiczny</Tag>
                            </Space>
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;