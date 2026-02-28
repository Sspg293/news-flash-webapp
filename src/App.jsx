
import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [articles, setArticles] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("general");

  const startX = useRef(0);

  // ✅ CATEGORY FIX (Cache Bust + Proper Refetch)
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/news?category=${category}&t=${Date.now()}`
        );
        const data = await res.json();
        setArticles(data.articles || []);
        setIndex(0);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    loadNews();
  }, [category]);

  const next = () => {
    if (index < articles.length - 1) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  const current = articles[index];

  return (
    <div
      style={{
        background: "#f2f2f2",
        minHeight: "100vh",
        fontFamily: "sans-serif"
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px 20px",
          fontSize: 22,
          fontWeight: "bold"
        }}
      >
        ⚡ FlashBrief PRO
      </div>

      {/* Category Buttons */}
      <div style={{ display: "flex", overflowX: "auto", padding: 10 }}>
        {["general", "business", "technology", "sports", "science"].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                marginRight: 10,
                padding: "6px 14px",
                background: category === cat ? "#e63946" : "#ccc",
                border: "none",
                borderRadius: 20,
                color: "#fff"
              }}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Loader */}
      {loading && (
        <div style={{ padding: 30 }}>
          <div style={{ height: 200, background: "#ddd", borderRadius: 10 }} />
        </div>
      )}

      {/* Article */}
      {!loading && current && (
        <div style={{ padding: 20 }}>
          {current.image && (
            <img
              src={current.image}
              alt="news"
              style={{ width: "100%", borderRadius: 12 }}
            />
          )}

          <h2 style={{ marginTop: 20 }}>{current.title}</h2>
          <p style={{ opacity: 0.8 }}>{current.description}</p>

          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#e63946", fontWeight: "bold" }}
          >
            पूरा लेख पढ़ें →
          </a>

          <p style={{ marginTop: 20, fontSize: 12 }}>
            👁 Viewed: {index + 1} / {articles.length}
          </p>
        </div>
      )}
    </div>
  );
}
