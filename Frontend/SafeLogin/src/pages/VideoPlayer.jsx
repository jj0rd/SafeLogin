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
    } catch (error) {
      console.error('Błąd podczas pobierania danych wideo:', error);
    }
  };

  fetchData();
}, [id]);

  if (!video) return <div>Ładowanie...</div>;

  return (
    <div className="video-page">
      <h1 className="app-title">Nazwa aplikacji</h1>
      <div className="video-container">
        <div className="video-section">
          <video controls width="100%" src={video.url}></video>
          <h2>{video.title}</h2>
          <p>liczba wyśw - 1922</p>

          <div className="comments">
            <h3>Komentarze</h3>
            <textarea placeholder="Napisz komentarz...." />
            <div className="comment-list">
              <p><b>Nick</b>: Komentarz ...........................................</p>
              <p><b>Nick</b>: Komentarz ...........................................</p>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="chat">
            <h3>czat <button>Schowaj</button></h3>
            <div className="chat-box">[tu będzie czat]</div>
            <button>Wyślij</button>
          </div>

          <div className="recommended">
            <h3>Polecane filmy</h3>
            {recommended.map(v => (
              <div key={v.id} className="recommended-item" onClick={() => window.location.href = `/video/${v.id}`}>
                <img src={v.url} alt="thumb" />
                <div>
                  <p>{v.title}</p>
                  <small>Autor, wyświetlenia</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
