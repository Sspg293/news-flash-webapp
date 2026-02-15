
import { useEffect, useState, useRef } from "react";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => setNews(data.articles || []))
      .catch(err => console.log(err));
  }, []);

  const next = () => {
    if (index < news.length - 1) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  if (news.length === 0) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  const article = news[index];

  return (
    <div
      onClick={next}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
        fontFamily: "system-ui, -apple-system"
      }}
    >
      <div
        style={{
          padding: "14px",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "18px",
          backgroundColor: "white",
          borderBottom: "1px solid #eee"
        }}
      >
        ⚡ FlashBrief
      </div>

      <div
        style={{
          height: "45%",
          backgroundColor: "#ddd",
          backgroundImage: article.image
            ? `url(${article.image})`
            : "url('https://via.placeholder.com/800x400?text=FlashBrief')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          padding: "22px",
          borderTopLeftRadius: "25px",
          borderTopRightRadius: "25px",
          marginTop: "-25px",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.08)"
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            marginBottom: "15px",
            fontWeight: "700",
            lineHeight: "1.3"
          }}
        >
          {article.title}
        </h2>

        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333" }}>
          {article.description}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "inline-block",
            marginTop: "12px",
            color: "#ff3b30",
            fontWeight: "600",
            textDecoration: "none"
          }}
        >
          Read Full Article →
        </a>

        <div
          style={{
            marginTop: "15px",
            fontSize: "13px",
            color: "gray"
          }}
        >
          {new Date(article.publishedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
