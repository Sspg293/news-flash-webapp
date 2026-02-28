
import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [articles, setArticles] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [category, setCategory] = useState("general");
  const [language, setLanguage] = useState("hi");
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const startX = useRef(0);

  useEffect(() => {
    fetchNews();
  }, [category]);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?category=${category}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setIndex(0);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

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

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const current = articles[index];

  return (
    <div
      style={{
        background: dark ? "#111" : "#f2f2f2",
        color: dark ? "#fff" : "#000",
        minHeight: "100vh",
        fontFamily: "sans-serif"
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        fontSize: 22,
        fontWeight: "bold"
      }}>
        ⚡ FlashBrief PRO
        <div>
          <button onClick={() => setDark(!dark)}>🌙</button>
          <button onClick={() => setLanguage(language === "hi" ? "en" : "hi")}>🌐</button>
        </div>
      </div>

      {/* Category Menu */}
      <div style={{ display: "flex", overflowX: "auto", padding: 10 }}>
        {["general", "business", "technology", "sports", "science"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              marginRight: 10,
              padding: "6px 12px",
              background: category === cat ? "#e63946" : "#ccc",
              border: "none",
              borderRadius: 20,
              color: "#fff"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loader */}
      {loading && (
        <div style={{ padding: 30 }}>
          <div style={{ height: 200, background: "#ddd", borderRadius: 10 }} />
          <div style={{ height: 20, background: "#ccc", marginTop: 20 }} />
          <div style={{ height: 20, background: "#ccc", marginTop: 10, width: "80%" }} />
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
            {language === "hi" ? "पूरा लेख पढ़ें →" : "Read Full Article →"}
          </a>

          <p style={{ marginTop: 20, fontSize: 12 }}>
            👁 Viewed: {index + 1} / {articles.length}
          </p>
        </div>
      )}

      {/* Install Button */}
      {deferredPrompt && (
        <button
          onClick={installApp}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: "10px 15px",
            background: "#e63946",
            color: "#fff",
            border: "none",
            borderRadius: 20
          }}
        >
          Install App
        </button>
      )}
    </div>
  );
}
