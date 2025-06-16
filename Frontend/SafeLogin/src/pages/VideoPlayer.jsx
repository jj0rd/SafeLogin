import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

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
      }
    };

    fetchData();
  }, [id]);

  const handleAddComment = async () => {
    if (!currentUser) {
      alert('Musisz być zalogowany, aby dodać komentarz.');
      return;
    }

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
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
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

        <div className="comments-section">
          <h3>Komentarze</h3>
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <p className="comment-author">{comment.userNick}</p>
              <p className="comment-text">{comment.content}</p>
            </div>
          ))}
          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Dodaj komentarz..."
            />
            <button onClick={handleAddComment}>Dodaj</button>
          </div>
        </div>
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
