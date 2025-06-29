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
import Cookies from 'js-cookie';
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
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Rozłączono');

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

     

    const sendChatMessage = () => {
          if (!currentUser) {
            message.warning('Musisz być zalogowany, aby wysyłać wiadomości.');
            return;
          }
          
          if (!stompClient || !isConnected) {
            message.warning('Brak połączenia z czatem. Spróbuj ponownie za chwilę.');
            return;
          }
          
          if (!chatInput.trim()) {
            message.warning('Wiadomość nie może być pusta.');
            return;
          }

          const messageObj = {
            content: chatInput.trim(),
            sender: { 
              id: currentUser.id,
              nick: currentUser.userNick || currentUser.nick || currentUser.username // sprawdź różne możliwe nazwy
            },
            receiver: null,
            type: 'PUBLIC'
          };
          
          console.log('Wysyłanie wiadomości:', messageObj);
          console.log('Stan połączenia:', isConnected);
          console.log('STOMP Client:', stompClient);
          
          try {
            stompClient.publish({ 
              destination: '/app/chat', 
              body: JSON.stringify(messageObj) 
            });
            setChatInput('');
          } catch (error) {
            console.error('Błąd wysyłania wiadomości:', error);
            message.error('Nie udało się wysłać wiadomości');
          }
        };

    // Funkcja do wysyłania prywatnych wiadomości
    const sendPrivateMessage = (receiverNick, content) => {
      if (stompClient && content.trim() && currentUser) {
        const messageObj = {
          content: content.trim(),
          sender: { 
            id: currentUser.id,
            nick: currentUser.nick 
          },
          receiver: { 
            nick: receiverNick 
          },
          type: 'PRIVATE'
        };
        
        console.log('Wysyłanie prywatnej wiadomości:', messageObj);
        stompClient.publish({ 
          destination: '/app/private', 
          body: JSON.stringify(messageObj) 
        });
      }
    };
  const handleChatKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
    }
  };
      useEffect(() => {
  if (!currentUser) {
    console.log('❌ Brak currentUser - nie inicjalizuję WebSocket');
    setConnectionStatus('Nie zalogowano');
    return;
  }

  console.log('🔍 Dane użytkownika:', currentUser);
  console.log('🚀 Rozpoczynam inicjalizację WebSocket...');
  setConnectionStatus('Łączenie...');
  
  const userNick = currentUser.userNick || currentUser.nick || currentUser.username;
  if (!userNick) {
    console.error('❌ Brak nick użytkownika:', currentUser);
    message.error('Błąd: brak nazwy użytkownika');
    return;
  }

  console.log('👤 Używam nicka:', userNick);

  let publicSub, privateSub;
  let isCleanedUp = false;

  const client = new Client({
    webSocketFactory: () => {
      console.log('🔌 Tworzę połączenie SockJS do: http://localhost:8080/ws');
      const sock = new SockJS('http://localhost:8080/ws');
      
      // Dodaj event listenery dla SockJS
      sock.onopen = () => {
        console.log('🟢 SockJS: onopen - połączenie otwarte');
      };
      
      sock.onclose = (e) => {
        console.log('🔴 SockJS: onclose - połączenie zamknięte', e);
      };
      
      sock.onerror = (e) => {
        console.error('🔴 SockJS: onerror - błąd połączenia', e);
      };
      
      return sock;
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    onConnect: (frame) => {
      if (isCleanedUp) {
        console.log('⚠️ Połączenie nawiązane, ale komponent już został oczyszczony');
        return;
      }
      
      console.log('✅ STOMP: Połączono z WebSocket!', frame);
      console.log('🔍 Frame headers:', frame.headers);
      setIsConnected(true);
      setConnectionStatus('Połączono');

      try {
        // Subskrypcja na publiczne wiadomości
        console.log('📡 Tworzę subskrypcję publiczną: /topic/messages');
        publicSub = client.subscribe('/topic/messages', message => {
          if (isCleanedUp) return;
          console.log('📨 Otrzymano publiczną wiadomość:', message.body);
          try {
            const body = JSON.parse(message.body);
            setChatMessages(prev => [...prev, body]);
          } catch (error) {
            console.error('❌ Błąd parsowania wiadomości:', error);
          }
        });

        // Subskrypcja na prywatne wiadomości
        const privateDestination = `/user/${userNick}/queue/private`;
        console.log('🔒 Tworzę subskrypcję prywatną:', privateDestination);
        privateSub = client.subscribe(privateDestination, message => {
          if (isCleanedUp) return;
          console.log('🔒 Otrzymano prywatną wiadomość:', message.body);
          try {
            const body = JSON.parse(message.body);
            setChatMessages(prev => [...prev, { 
              ...body, 
              content: `🔒 ${body.content}`,
              isPrivate: true 
            }]);
          } catch (error) {
            console.error('❌ Błąd parsowania prywatnej wiadomości:', error);
          }
        });

        console.log('✅ Wszystkie subskrypcje utworzone pomyślnie');
        loadRecentMessages();
      } catch (error) {
        console.error('❌ Błąd tworzenia subskrypcji:', error);
      }
    },

    onDisconnect: (frame) => {
      console.log('❌ STOMP: Rozłączono z WebSocket', frame);
      if (!isCleanedUp) {
        setIsConnected(false);
        setConnectionStatus('Rozłączono');
      }
    },

    onStompError: (error) => {
      console.error('❌ STOMP: Błąd protokołu STOMP:', error);
      console.error('🔍 Error details:', {
        command: error.command,
        headers: error.headers,
        body: error.body
      });
      if (!isCleanedUp) {
        setIsConnected(false);
        setConnectionStatus('Błąd STOMP');
        message.error(`Błąd STOMP: ${error.headers?.message || error.command}`);
      }
    },

    onWebSocketError: (error) => {
      console.error('❌ WebSocket: Błąd połączenia WebSocket:', error);
      if (!isCleanedUp) {
        setIsConnected(false);
        setConnectionStatus('Błąd WebSocket');
      }
    },

    onWebSocketClose: (event) => {
      console.log('🔴 WebSocket: Połączenie zamknięte', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
    },

    debug: (str) => {
      console.log('🔧 STOMP Debug:', str);
    }
  });

  try {
    console.log('⚡ Aktywuję klienta STOMP...');
    client.activate();
    setStompClient(client);
    console.log('✅ Klient STOMP aktywowany');
  } catch (error) {
    console.error('❌ Błąd aktywacji klienta STOMP:', error);
    setConnectionStatus('Błąd aktywacji');
  }

  // Cleanup function
  return () => {
    console.log('🧹 Rozpoczynam cleanup WebSocket...');
    isCleanedUp = true;
    
    if (publicSub) {
      try {
        console.log('🗑️ Anulowanie subskrypcji publicznej...');
        publicSub.unsubscribe();
      } catch (error) {
        console.warn('⚠️ Błąd anulowania publicznej subskrypcji:', error);
      }
    }
    
    if (privateSub) {
      try {
        console.log('🗑️ Anulowanie subskrypcji prywatnej...');
        privateSub.unsubscribe();
      } catch (error) {
        console.warn('⚠️ Błąd anulowania prywatnej subskrypcji:', error);
      }
    }
    
    if (client && client.active) {
      try {
        console.log('🔌 Dezaktywacja klienta STOMP...');
        client.deactivate();
      } catch (error) {
        console.warn('⚠️ Błąd dezaktywacji klienta:', error);
      }
    }
    
    setIsConnected(false);
    setConnectionStatus('Rozłączono');
    setStompClient(null);
    console.log('✅ Cleanup WebSocket zakończony');
  };
}, [currentUser?.id]); // ✅ Używaj tylko stabilnego ID zamiast całego obiektu

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
                      {currentUser?.nick || 'Zaloguj się, aby komentować'}
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
                            <Text strong className="comment-author">{comment.nick}</Text>
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
                  <Badge 
                    status={isConnected ? "processing" : "error"} 
                    text={connectionStatus} 
                  />
                  {currentUser && (
                    <Tag color="blue" size="small">
                      {currentUser.userNick || currentUser.nick || currentUser.username}
                    </Tag>
                  )}
                </Space>
              )}
              className="chat-section-card"
              bordered={false}
              extra={
                <Button 
                  size="small" 
                  onClick={() => {
                    console.log('🔄 Wymuszenie ponownego połączenia...');
                    if (stompClient) {
                      stompClient.deactivate();
                    }
                    // Wymusi ponowne połączenie przez zmianę currentUser
                    setCurrentUser({...currentUser});
                  }}
                  disabled={isConnected}
                >
                  Połącz ponownie
                </Button>
              }
            >
              {/* Wskaźnik stanu połączenia */}
              {!isConnected && (
                <div style={{ 
                  padding: 8, 
                  backgroundColor: '#fff7e6', 
                  border: '1px solid #ffd591',
                  borderRadius: 4,
                  marginBottom: 12,
                  textAlign: 'center'
                }}>
                  <Text type="warning">
                    {connectionStatus === 'Łączenie...' ? '🔄 Łączenie z czatem...' : '⚠️ Brak połączenia z czatem'}
                  </Text>
                </div>
              )}

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
                          backgroundColor: msg.sender?.nick === (currentUser?.userNick || currentUser?.nick || currentUser?.username)
                            ? '#e6f7ff' 
                            : msg.isPrivate 
                              ? '#fff7e6' 
                              : '#fff',
                          border: `1px solid ${msg.isPrivate ? '#ffd591' : '#f0f0f0'}`,
                          borderRadius: 8,
                          padding: 8
                        }}
                      >
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Space>
                            <Avatar size="small" icon={<UserOutlined />} />
                            <Text strong style={{ 
                              color: msg.sender?.nick === (currentUser?.userNick || currentUser?.nick || currentUser?.username) ? '#1890ff' : '#000' 
                            }}>
                              {msg.sender?.nick || 'Nieznany'}
                            </Text>
                            {msg.isPrivate && <Tag color="orange" size="small">Prywatne</Tag>}
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              {msg.timestamp 
                                ? new Date(msg.timestamp).toLocaleTimeString('pl-PL') 
                                : new Date().toLocaleTimeString('pl-PL')
                              }
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
                placeholder={currentUser 
                  ? isConnected
                    ? "Wpisz wiadomość i naciśnij Enter, aby wysłać (Shift+Enter dla nowej linii)" 
                    : "Łączenie z czatem..."
                  : "Zaloguj się, aby pisać na czacie"
                }
                rows={2}
                style={{ resize: 'none' }}
                disabled={!currentUser || !isConnected}
                maxLength={500}
                showCount
              />
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Space>
                  <Button
                    onClick={() => setChatInput('')}
                    disabled={!chatInput.trim()}
                    size="small"
                  >
                    Wyczyść
                  </Button>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || !currentUser || !isConnected}
                    loading={connectionStatus === 'Łączenie...'}
                  >
                    Wyślij
                  </Button>
                </Space>
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
