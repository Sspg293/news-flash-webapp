
import { useEffect, useState, useRef } from "react";

function smartSummarize(article) {
  if (!article) return "";

  const text = (article.title + ". " + (article.description || "")).trim();
  let sentences = text.split(/(?<=[.!?])\s+/);
  sentences = sentences.filter(s => s.split(" ").length > 5);
  sentences = [...new Set(sentences)];

  let summary = "";
  let wordCount = 0;

  for (let sentence of sentences) {
    const words = sentence.split(" ");
    if (wordCount + words.length <= 100) {
      summary += sentence + " ";
      wordCount += words.length;
    } else {
      break;
    }
  }

  return summary.trim();
}

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
    const endY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - endY;

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
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
          backgroundColor: "white",
          borderBottom: "1px solid #eee"
        }}
      >
        ⚡ FlashBrief
      </div>

      {/* Image */}
      <div
        style={{
          height: "40%",
          backgroundImage: `url(${article.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "white",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          marginTop: "-20px"
        }}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "15px", fontWeight: "700" }}>
          {article.title}
        </h2>

        <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#333" }}>
          {smartSummarize(article)}
        </p>

        {/* Read Full Article Link */}
        {article.url && (
          <div style={{ marginTop: "15px" }}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#ff3b30",
                fontWeight: "600",
                textDecoration: "none"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Read Full Article →
            </a>
          </div>
        )}

        <div
          style={{
            marginTop: "15px",
            fontSize: "13px",
            color: "gray"
          }}
        >
          {article.source?.name || "Source"} •{" "}
          {new Date(article.publishedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
