import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:8080/AllVideos', {
          method: 'GET',
          credentials: 'include',
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

  const getThumbnail = (video) => {
    if (video.thumbnail) return video.thumbnail;
    if (video.url.includes('youtube.com')) {
      try {
        const videoId = new URLSearchParams(new URL(video.url).search).get('v');
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      } catch {
        return ''; // fallback miniatura
      }
    }
    return video.url;
  };

  return (
    <div className="landing-container">
      <h2 className="landing-title">Filmy</h2>
      <div className="video-grid">
        {videos.map(video => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => navigate(`/video/${video.id}`)}
          >
            <img
              className="video-thumbnail"
              src={getThumbnail(video)}
              alt={video.title}
            />
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-meta">Autor | 1234 wyświetlenia</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
