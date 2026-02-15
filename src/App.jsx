
import { useEffect, useState, useRef } from "react";

const API_KEY = "4a142ac699050dd6b595b88cb90da432";

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
    const url =
      "https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=20&apikey=" +
      API_KEY;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setNews(data.articles || []);
      })
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          height: "40%",
          backgroundImage: `url(${article.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "white",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          marginTop: "-20px",
          boxShadow: "0 -5px 15px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "15px" }}>
          {article.title}
        </h2>

        <p style={{ fontSize: "15px", lineHeight: "1.6" }}>
          {smartSummarize(article)}
        </p>

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
