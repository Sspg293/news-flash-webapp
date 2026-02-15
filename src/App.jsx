
import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setNews(data.articles);
        }
      })
      .catch(err => console.error("Fetch error:", err));
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

  // Handle Swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) {
      next(); // Swipe Left → Next
    }

    if (distance < -50) {
      prev(); // Swipe Right → Prev
    }
  };

  if (!news.length) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px"
      }}>
        Loading News...
      </div>
    );
  }

  const article = news[index];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        fontFamily: "Arial, sans-serif",
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
        background: "#ffffff"
      }}>
        ⚡ FlashBrief
      </div>

      {/* Image */}
      <img
        src={article.image}
        alt={article.title}
        style={{
          width: "100%",
          height: "300px",
          objectFit: "cover"
        }}
      />

      {/* Content */}
      <div style={{
        background: "#ffffff",
        marginTop: "-20px",
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px",
        padding: "20px"
      }}>
        <h2 style={{ marginBottom: "15px" }}>
          {article.title}
        </h2>

        <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
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
        >
          Read Full Article →
        </a>
      </div>
    </div>
  );
}
