
import { useEffect, useState } from "react";

export default function App() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => setNews(data.articles || []));
  }, []);

  if (!news.length) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading News...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial", maxWidth: "600px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>FlashBrief</h2>

      {news.map((article, index) => (
        <div key={index} style={{ marginBottom: "30px" }}>
          <img
            src={article.image}
            alt=""
            style={{ width: "100%", borderRadius: "8px" }}
          />

          <h3>{article.title}</h3>

          <p style={{ color: "gray", fontSize: "14px" }}>
            {article.timeAgo}
          </p>

          <p>{article.description?.slice(0, 150)}...</p>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "blue" }}
          >
            Read Full Article
          </a>
        </div>
      ))}
    </div>
  );
}
