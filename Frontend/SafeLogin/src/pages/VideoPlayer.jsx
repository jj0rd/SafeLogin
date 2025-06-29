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
  message,
  Row,
  Col,
  Badge,
  Tag,
  Tooltip,
  Skeleton
} from 'antd';
import {
  UserOutlined,
  SendOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  CommentOutlined,
  HeartOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
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
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/getVideo/${id}`, { withCredentials: true });
        setVideo(res.data);

        const allVideos = await axios.get('http://localhost:8080/AllVideos', { withCredentials: true });
        setRecommended(allVideos.data.filter(v => v.id !== parseInt(id)));

        const commentRes = await axios.get(`http://localhost:8080/getVideoComments/${id}`, { withCredentials: true });
        setComments(commentRes.data);

        const userRes = await axios.get('http://localhost:8080/check-auth', { withCredentials: true });
        setCurrentUser(userRes.data);
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
        message.error('Błąd podczas ładowania danych');
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id]);

      useEffect(() => {
      if (currentUser) {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
          webSocketFactory: () => socket,
          onConnect: () => {
            client.subscribe('/topic/messages', message => {
              const body = JSON.parse(message.body);
              setChatMessages(prev => [...prev, body]);
            });

            client.subscribe(`/user/${currentUser.userNick}/queue/private`, message => {
              const body = JSON.parse(message.body);
              setChatMessages(prev => [...prev, { ...body, content: `(Prywatnie) ${body.content}` }]);
            });
          },
          onStompError: console.error,
        });

        client.activate();
        setStompClient(client);

        return () => {
          client.deactivate();
        };
      }
    }, [currentUser]);

    const sendChatMessage = () => {
    if (stompClient && chatInput.trim()) {
      const messageObj = {
        content: chatInput,
        sender: { nick: currentUser.userNick },
        receiver: null, // lub ustaw User receiver jeśli prywatna wiadomość
      };
      stompClient.publish({ destination: '/app/chat', body: JSON.stringify(messageObj) });
      setChatInput('');
      }
    };

  useEffect(() => {
    const checkSubscription = async () => {
      if (currentUser && video?.ownerId) {
        try {
          const subRes = await axios.get(`http://localhost:8080/getSubscriptions/${currentUser.id}`, {
            withCredentials: true
          });
          const isSub = subRes.data.some(u => u.username === video.ownerNick);
          setIsSubscribed(isSub);
        } catch (err) {
          console.error('Błąd sprawdzania subskrypcji:', err);
        }
      }
    };
    checkSubscription();
  }, [currentUser, video]);

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
      const csrfRes = await axios.get('http://localhost:8080/csrf-token', { withCredentials: true });
      await axios.post('http://localhost:8080/addComment', {
        userId: currentUser.id,
        videoId: parseInt(id),
        content: newComment,
      }, {
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': csrfRes.data.csrfToken }
      });
      setNewComment('');
      const newComm = await axios.get(`http://localhost:8080/getVideoComments/${id}`, { withCredentials: true });
      setComments(newComm.data);
      message.success('Komentarz został dodany!');
    } catch (error) {
      console.error('Błąd dodawania komentarza:', error);
      message.error(error.response?.status === 403 ? 'Brak autoryzacji lub niepoprawny CSRF token.' : 'Błąd podczas dodawania komentarza.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
  try {
    const csrfRes = await axios.get('http://localhost:8080/csrf-token', { withCredentials: true });
    await axios.post(
      `http://localhost:8080/subscriber/${currentUser.id}/subscribeTarget/${video.ownerId}`,
      {},
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': csrfRes.data.csrfToken
        }
      }
    );
    setIsSubscribed(true);
    message.success('Zasubskrybowano użytkownika!');
  } catch (err) {
    console.error(err);
    message.error('Nie udało się zasubskrybować.');
  }
};

const handleUnsubscribe = async () => {
  try {
    const csrfRes = await axios.get('http://localhost:8080/csrf-token', { withCredentials: true });
    await axios.post(
      `http://localhost:8080/subscriber/${currentUser.id}/unsubscribe/${video.ownerId}`,
      {},
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': csrfRes.data.csrfToken
        }
      }
    );
    setIsSubscribed(false);
    message.success('Anulowano subskrypcję.');
  } catch (err) {
    console.error(err);
    message.error('Nie udało się anulować subskrypcji.');
  }
};

  const isYouTubeLink = video?.url.includes('youtube.com');
  const getYouTubeEmbedUrl = url => {
    try {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return null;
    }
  };
  const getYouTubeThumbnail = url => {
    try {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    } catch {
      return null;
    }
  };

  if (pageLoading) {
    return (
      <div className="video-player-container">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="video-section-card">
              <Skeleton.Image className="video-skeleton" active />
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
            <Card className="comments-section-card" style={{ marginTop: 24 }}>
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (!video) return <div>Błąd ładowania wideo</div>;

  return (
    <div className="video-player-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="video-section-card" bordered={false}>
            <div className="video-wrapper">
              {isYouTubeLink ? (
                <iframe
                  className="video-element"
                  src={getYouTubeEmbedUrl(video.url)}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls className="video-element">
                  <source src={video.url} type="video/mp4" />
                  Twoja przeglądarka nie wspiera odtwarzacza wideo.
                </video>
              )}
            </div>
            <div className="video-info">
              <Title level={2} className="video-title">{video.title}</Title>
              <div className="video-meta">
                <Space size="large">
                  <Space><EyeOutlined /><Text>1,234 wyświetleń</Text></Space>
                  <Space><CommentOutlined /><Text>{comments.length} komentarzy</Text></Space>
                </Space>
                <Space className="video-actions">
                  <Tooltip title="Polub">
                    <Button icon={<HeartOutlined />} size="large">Polub</Button>
                  </Tooltip>
                  <Tooltip title={isSubscribed ? "Anuluj subskrypcję" : "Subskrybuj kanał"}>
                    <Button
                      type={isSubscribed ? "default" : "primary"}
                      danger={isSubscribed}
                      size="large"
                      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                      disabled={!currentUser}
                    >
                      {isSubscribed ? "Anuluj subskrypcję" : "Subskrybuj"}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Udostępnij">
                    <Button icon={<ShareAltOutlined />} size="large">Udostępnij</Button>
                  </Tooltip>
                </Space>
              </div>
              <Divider />
              <Paragraph className="video-description">{video.description}</Paragraph>
            </div>
          </Card>

          <Card
            className="comments-section-card"
            title={(
              <Space>
                <MessageOutlined />
                <Title level={4} style={{ margin: 0 }}>Komentarze</Title>
                <Badge count={comments.length} showZero />
              </Space>
            )}
            bordered={false}
          >
            <Card size="small" className="add-comment-card">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Space align="start" style={{ width: '100%' }}>
                  <Avatar icon={<UserOutlined />} src={currentUser?.avatar} size="large" />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ color: '#1890ff' }}>
                      {currentUser?.userNick || 'Zaloguj się, aby komentować'}
                    </Text>
                    {currentUser && (
                      <Tag color="blue" size="small" style={{ marginLeft: 8 }}>Online</Tag>
                    )}
                  </div>
                </Space>
                <TextArea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Podziel się swoimi przemyśleniami..."
                  rows={4} maxLength={500} showCount
                  disabled={!currentUser}
                />
                <div style={{ textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => setNewComment('')} disabled={!newComment.trim()}>
                      Wyczyść
                    </Button>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleAddComment}
                      loading={loading}
                      disabled={!newComment.trim() || !currentUser}
                      className="submit-comment-btn"
                    >
                      Opublikuj komentarz
                    </Button>
                  </Space>
                </div>
              </Space>
            </Card>
            <Divider />
            {comments.length === 0 ? (
              <Empty
                description="Brak komentarzy"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary">Bądź pierwszy, który skomentuje to wideo!</Text>
              </Empty>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {comments.map((comment, i) => (
                  <Card key={i} size="small" className="comment-card" hoverable>
                    <Space align="start" style={{ width: '100%' }}>
                      <Avatar icon={<UserOutlined />} src={comment.userAvatar} size="large" />
                      <div style={{ flex: 1 }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Space wrap>
                            <Text strong className="comment-author">{comment.userNick}</Text>
                            <Text type="secondary" className="comment-time">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleString('pl-PL') : 'Teraz'}
                            </Text>
                          </Space>
                          <Paragraph className="comment-content" style={{ margin: 0 }}>
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
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card
              title={(
                <Space>
                  <MessageOutlined />
                  <Text>Czat na żywo</Text>
                  <Badge status="processing" text="Połączono" />
                </Space>
              )}
              className="chat-section-card"
              bordered={false}
            >
              <div
                style={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  padding: 8,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 4,
                  marginBottom: 12
                }}
              >
                {chatMessages.length === 0 ? (
                  <Empty
                    description="Brak wiadomości"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '16px 0' }}
                  />
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: msg.sender?.nick === currentUser?.userNick ? '#e6f7ff' : '#fff',
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                          padding: 8
                        }}
                      >
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Space>
                            <Avatar size="small" icon={<UserOutlined />} />
                            <Text strong>{msg.sender?.nick}</Text>
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                            </Text>
                          </Space>
                          <Text>{msg.content}</Text>
                        </Space>
                      </div>
                    ))}
                  </Space>
                )}
               </div>

                <Input.TextArea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder="Wpisz wiadomość i naciśnij Enter, aby wysłać"
                  rows={2}
                  style={{ resize: 'none' }}
                />
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim()}
                  >
                    Wyślij
                  </Button>
                </div>
              </Card>


            <Card
              title={(
                <Space>
                  <PlayCircleOutlined />
                  <Text>Polecane filmy</Text>
                </Space>
              )}
              className="recommended-section-card"
              bordered={false}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {recommended.map(v => (
                  <Card
                    key={v.id}
                    size="small"
                    className="recommended-video-card"
                    hoverable
                    onClick={() => navigate(`/video/${v.id}`)}
                    cover={(
                      <div className="recommended-thumbnail-wrapper">
                        <img
                          src={v.thumbnail || getYouTubeThumbnail(v.url) || v.url}
                          alt={v.title}
                          className="recommended-thumbnail"
                        />
                        <div className="play-overlay">
                          <PlayCircleOutlined />
                        </div>
                      </div>
                    )}
                  >
                    <Card.Meta
                      title={<Text className="recommended-title" ellipsis={{ tooltip: v.title }}>{v.title}</Text>}
                      description={(
                        <Space>
                          <Text type="secondary" className="recommended-meta">1,234 wyświetleń</Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">2 dni temu</Text>
                        </Space>
                      )}
                    />
                  </Card>
                ))}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default VideoPlayer;
