
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
        setNews(data.articles || []);
      })
      .catch(err => console.error(err));
  }, []);

  // Decode HTML entities
  const decodeHTML = (text) => {
    if (!text) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  };

  // 100-word summarizer (safe + clean)
  const summarizeTo100Words = (text) => {
    if (!text) return "";

    const decoded = decodeHTML(text);

    const clean = decoded
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const words = clean.split(" ");

    if (words.length <= 100) return clean;

    return words.slice(0, 100).join(" ") + "...";
  };

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

    if (Math.abs(distance) > 80 && timeTaken < 800) {
      if (distance > 0) next();
      else prev();
    }
  };

  if (!news.length) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial"
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
        background: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}>
        ⚡ FlashBrief
      </div>

      {/* Image */}
      <img
        src={article.image}
        alt={decodeHTML(article.title)}
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
        padding: "20px",
        minHeight: "40vh"
      }}>
        <h2 style={{ marginBottom: "10px" }}>
          {decodeHTML(article.title)}
        </h2>

        <p style={{ lineHeight: "1.6", color: "#444" }}>
          {summarizeTo100Words(article.description)}
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
