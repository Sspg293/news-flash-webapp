
import React, { useEffect, useState } from "react";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);

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
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
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
    <div style={{
      fontFamily: "Arial, sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh"
    }}>
      
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

      {/* Content Card */}
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

        {/* Navigation */}
        <div style={{
          marginTop: "25px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <button onClick={prev}>⬆ Prev</button>
          <button onClick={next}>⬇ Next</button>
        </div>
      </div>
    </div>
  );
}
