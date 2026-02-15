
import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);

  const startX = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setNews(data.articles);
        }
      });
  }, []);

  const next = () => {
    if (index < news.length - 1) {
      setIndex(prev => prev + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startTime.current = Date.now();
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const distance = startX.current - endX;
    const timeTaken = Date.now() - startTime.current;

    // Strict swipe detection
    if (Math.abs(distance) > 80 && timeTaken < 800) {
      if (distance > 0) next();   // Swipe Left
      else prev();                // Swipe Right
    }
  };

  if (!news.length) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Loading News...
      </div>
    );
  }

  const article = news[index];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => e.stopPropagation()}  // Hard block tap
      style={{
        fontFamily: "Arial",
        background: "#f5f5f5",
        minHeight: "100vh"
      }}
    >
      {/* Header */}
      <div style={{
        textAlign: "center",
        padding: "15px",
        fontWeight: "bold",
        fontSize: "22px",
        background: "#fff"
      }}>
        ⚡ FlashBrief
      </div>

      {/* Image */}
      <img
        src={article.image}
        alt={article.title}
        draggable="false"
        style={{
          width: "100%",
          height: "300px",
          objectFit: "cover",
          userSelect: "none"
        }}
      />

      {/* Content */}
      <div style={{
        background: "#fff",
        marginTop: "-20px",
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px",
        padding: "20px"
      }}>
        <h2>{article.title}</h2>

        <p style={{ lineHeight: "1.6" }}>
          {article.description}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#e53935",
            fontWeight: "bold",
            textDecoration: "none"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          Read Full Article →
        </a>
      </div>
    </div>
  );
}
