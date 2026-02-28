
import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("general");

  const startX = useRef(0);
  const startTime = useRef(0);

  const categories = [
    "general",
    "business",
    "technology",
    "sports",
    "health",
    "science",
    "entertainment"
  ];

  useEffect(() => {
    fetch(`/api/news?category=${category}&nocache=` + Date.now())
      .then(res => res.json())
      .then(data => {
        setNews(data.articles || []);
        setIndex(0);
      })
      .catch(err => console.error(err));
  }, [category]);

  const summarize50 = (text) => {
    if (!text) return "";
    const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const words = clean.split(" ");
    if (words.length <= 50) return clean;
    return words.slice(0, 50).join(" ") + "...";
  };

  const next = () => {
    if (index < news.length - 1) setIndex(prev => prev + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(prev => prev - 1);
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
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  const article = news[index];

  return (
    <div style={{ fontFamily: "Arial", minHeight: "100vh", background: "#f5f5f5" }}>
      
      {/* Sidebar */}
      <div style={{
        position: "fixed",
        top: 0,
        left: menuOpen ? 0 : "-250px",
        width: "250px",
        height: "100%",
        background: "#fff",
        boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
        transition: "left 0.3s",
        paddingTop: "60px",
        zIndex: 1000
      }}>
        {categories.map(cat => (
          <div
            key={cat}
            onClick={() => {
              setCategory(cat);
              setMenuOpen(false);
            }}
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              textTransform: "capitalize"
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "15px",
        background: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}>
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ fontSize: 22, cursor: "pointer", marginRight: 15 }}
        >
          ☰
        </div>
        <div style={{ fontWeight: "bold", fontSize: 20 }}>
          ⚡ FlashBrief
        </div>
      </div>

      {/* Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={article.image}
          alt={article.title}
          style={{ width: "100%", height: 300, objectFit: "cover" }}
        />

        <div style={{
          background: "#fff",
          marginTop: -20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20
        }}>
          <h2>{article.title}</h2>
          <p>{summarize50(article.description || article.title)}</p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#e53935", fontWeight: "bold" }}
          >
            Read Full Article →
          </a>
        </div>
      </div>
    </div>
  );
}
