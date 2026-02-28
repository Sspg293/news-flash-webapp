
// FlashBrief Polished Hindi UI
import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState("general");

  const startX = useRef(0);

  useEffect(() => {
    fetch(`/api/news?category=${category}&t=` + Date.now())
      .then(res => res.json())
      .then(data => {
        setNews(data.articles || []);
        setIndex(0);
      });
  }, [category]);

  const next = () => index < news.length - 1 && setIndex(index + 1);
  const prev = () => index > 0 && setIndex(index - 1);

  const handleTouchStart = e => startX.current = e.touches[0].clientX;

  const handleTouchEnd = e => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 80) next();
    if (diff < -80) prev();
  };

  if (!news.length) return <div style={{ padding: 20 }}>समाचार लोड हो रहे हैं...</div>;

  const article = news[index];

  return (
    <div style={{
      fontFamily: "system-ui",
      background: "#f4f4f4",
      minHeight: "100vh"
    }}>

      {/* Header */}
      <div style={{
        padding: "16px",
        fontWeight: "bold",
        fontSize: "22px",
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
      }}>
        ⚡ फ्लैशब्रीफ
      </div>

      {/* Swipe Area */}
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {/* Image */}
        <img
          src={article.image}
          alt=""
          style={{
            width: "100%",
            height: "260px",
            objectFit: "cover"
          }}
        />

        {/* Card */}
        <div style={{
          background: "#fff",
          marginTop: "-20px",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          padding: "20px"
        }}>
          <h2 style={{ lineHeight: "1.4" }}>
            {article.title}
          </h2>

          <p style={{
            marginTop: "12px",
            lineHeight: "1.6",
            fontSize: "16px",
            color: "#444"
          }}>
            {article.description}
          </p>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "15px",
              color: "#e53935",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            पूरा लेख पढ़ें →
          </a>
        </div>

      </div>
    </div>
  );
}
