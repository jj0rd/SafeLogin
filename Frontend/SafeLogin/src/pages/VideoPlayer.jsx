import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:8080/getVideo/${id}`, {
        withCredentials: true,
      });
      setVideo(res.data);

      const allVideos = await axios.get('http://localhost:8080/AllVideos', {
        withCredentials: true,
      });
      const filtered = allVideos.data.filter(v => v.id !== parseInt(id));
      setRecommended(filtered);
    };

    fetchData();
  }, [id]);

  if (!video) return <div>Ładowanie...</div>;

  return (
    <div className="video-player-container">
      <div className="video-main">
        <div className="video-section">
          <video controls className="video-element">
            <source src={video.url} type="video/mp4" />
            Twoja przeglądarka nie wspiera odtwarzacza wideo.
          </video>
          <h2 className="video-title">{video.title}</h2>
          <p className="video-description">{video.description}</p>
        </div>

        <div className="comments-section">
          <h3>Komentarze</h3>
          {/* Przykładowy komentarz */}
          <div className="comment">
            <p className="comment-author">Użytkownik123</p>
            <p className="comment-text">Super film!</p>
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
              onClick={() => (window.location.href = `/video/${v.id}`)}
            >
              <img src={v.url} alt={v.title} className="recommended-thumbnail" />
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
