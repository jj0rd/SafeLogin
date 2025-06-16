import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Space, 
  Divider,
  Empty,
  message 
} from 'antd';
import { 
  UserOutlined, 
  SendOutlined, 
  MessageOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import './VideoPlayer.css';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/getVideo/${id}`, {
          withCredentials: true,
        });
        setVideo(res.data);

        const allVideos = await axios.get('http://localhost:8080/AllVideos', {
          withCredentials: true,
        });
        const filtered = allVideos.data.filter(v => v.id !== parseInt(id));
        setRecommended(filtered);

        const commentRes = await axios.get(`http://localhost:8080/getVideoComments/${id}`, {
          withCredentials: true,
        });
        setComments(commentRes.data);

        const userRes = await axios.get('http://localhost:8080/check-auth', {
          withCredentials: true,
        });
        setCurrentUser(userRes.data);
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        message.error('Błąd podczas ładowania danych');
      }
    };

    fetchData();
  }, [id]);

  const handleAddComment = async () => {
    if (!currentUser) {
      message.warning('Musisz być zalogowany, aby dodać komentarz.');
      return;
    }

    if (!newComment.trim()) {
      message.warning('Komentarz nie może być pusty.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/addComment', {
        userId: currentUser.id,
        videoId: parseInt(id),
        content: newComment
      }, {
        withCredentials: true,
      });

      setNewComment('');
      const commentRes = await axios.get(`http://localhost:8080/getVideoComments/${id}`, {
        withCredentials: true,
      });
      setComments(commentRes.data);
      message.success('Komentarz został dodany!');
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
      message.error('Błąd podczas dodawania komentarza');
    } finally {
      setLoading(false);
    }
  };

  if (!video) return <div>Ładowanie...</div>;

  const isYouTubeLink = video.url.includes('youtube.com');
  const getYouTubeEmbedUrl = (url) => {
    try {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return null;
    }
  };

  const getYouTubeThumbnail = (url) => {
    try {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    } catch {
      return null;
    }
  };

  return (
    <div className="video-player-container">
      <div className="video-main">
        <div className="video-section">
          {isYouTubeLink ? (
            <iframe
              className="video-element iframe-element"
              src={getYouTubeEmbedUrl(video.url)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video controls className="video-element">
              <source src={video.url} type="video/mp4" />
              Twoja przeglądarka nie wspiera odtwarzacza wideo.
            </video>
          )}
          <h2 className="video-title">{video.title}</h2>
          <p className="video-description">{video.description}</p>
        </div>

        {/* Improved Comments Section with Ant Design */}
        <Card 
          className="comments-section-card"
          title={
            <Space>
              <MessageOutlined />
              <Title level={4} style={{ margin: 0 }}>
                Komentarze ({comments.length})
              </Title>
            </Space>
          }
        >
          {/* Add Comment Form */}
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Space align="start">
                <Avatar 
                  icon={<UserOutlined />} 
                  src={currentUser?.avatar}
                />
                <div style={{ flex: 1, width: '100%' }}>
                  <Text strong>
                    {currentUser?.userNick || 'Gość'}
                  </Text>
                </div>
              </Space>
              
              <TextArea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Dodaj komentarz..."
                rows={3}
                maxLength={500}
                showCount
                style={{ resize: 'none' }}
              />
              
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button 
                    onClick={() => setNewComment('')}
                    disabled={!newComment.trim()}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={handleAddComment}
                    loading={loading}
                    disabled={!newComment.trim() || !currentUser}
                  >
                    Dodaj komentarz
                  </Button>
                </Space>
              </div>
            </Space>
          </Card>

          <Divider />

          {/* Comments List */}
          {comments.length === 0 ? (
            <Empty 
              description="Brak komentarzy" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {comments.map((comment, index) => (
                <Card 
                  key={index} 
                  size="small"
                  style={{ 
                    backgroundColor: '#fdfdfd',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <Space align="start" style={{ width: '100%' }}>
                    <Avatar 
                      icon={<UserOutlined />}
                      src={comment.userAvatar}
                      size="default"
                    />
                    <div style={{ flex: 1 }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space>
                          <Text strong style={{ color: '#1890ff' }}>
                            {comment.userNick}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString('pl-PL') : 'Teraz'}
                          </Text>
                        </Space>
                        <Paragraph 
                          style={{ 
                            margin: 0, 
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {comment.content}
                        </Paragraph>
                      </Space>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          )}
        </Card>
      </div>

      <div className="sidebar">
        <div className="chat-section">
          <h3>Czat</h3>
          <div className="chat-placeholder">Tutaj pojawi się czat na żywo</div>
        </div>

        <div className="recommended-section">
          <h3>Polecane</h3>
          {recommended.map(v => (
            <div
              key={v.id}
              className="recommended-video"
              onClick={() => navigate(`/video/${v.id}`)}
            >
              <img
                src={v.thumbnail || getYouTubeThumbnail(v.url) || v.url}
                alt={v.title}
                className="recommended-thumbnail"
              />
              <div className="recommended-info">
                <p className="recommended-title">{v.title}</p>
                <p className="recommended-meta">1234 wyświetleń</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;