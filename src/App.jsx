
import { useEffect, useState, useRef } from "react";

const API_KEY = "4a142ac699050dd6b595b88cb90da432";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const url =
      "https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=50&apikey=" +
      API_KEY;

    fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url))
      .then((res) => res.json())
      .then((data) => {
        const parsed = JSON.parse(data.contents);
        setNews(parsed.articles || []);
      });
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
    const endY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - endY;

    if (diff > 50) next();
    if (diff < -50) prev();
  };

  if (news.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );
  }

  const article = news[index];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        height: "100vh",
        backgroundImage: `url(${article.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        color: "white",
        position: "relative",
        transition: "0.4s ease"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2))"
        }}
      />

      <div
        style={{
          position: "relative",
          padding: "20px",
          maxWidth: "600px",
          width: "100%"
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>
          {article.title}
        </h2>

        <p style={{ marginTop: "10px", fontSize: "16px" }}>
          {article.description?.slice(0, 160)}...
        </p>

        <div
          style={{
            marginTop: "15px",
            fontSize: "13px",
            opacity: 0.8
          }}
        >
          {article.source?.name || "Source"} •{" "}
          {new Date(article.publishedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
