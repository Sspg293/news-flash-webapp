
import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [articles, setArticles] = useState([]);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => setArticles(data.articles || []));
  }, []);

  const nextArticle = () => {
    if (index < articles.length - 1) {
      setIndex(index + 1);
    }
  };

  const prevArticle = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (diff > 50) nextArticle();
    if (diff < -50) prevArticle();

    touchStartX.current = null;
  };

  if (!articles.length) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        Loading...
      </div>
    );
  }

  const article = articles[index];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        fontFamily: "sans-serif",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          fontWeight: "bold",
          fontSize: "22px",
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        ⚡ FlashBrief
      </div>

      {/* Image */}
      {article.image && (
        <img
          src={article.image}
          alt="news"
          style={{
            width: "100%",
            height: "250px",
            objectFit: "cover",
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          background: "#fff",
          marginTop: "-20px",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          padding: "20px",
          minHeight: "50vh",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>
          {article.title}
        </h2>

        <p style={{ color: "#555", marginTop: "10px" }}>
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
            textDecoration: "none",
          }}
        >
          पूरा लेख पढ़ें →
        </a>
      </div>
    </div>
  );
}
