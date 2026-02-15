import { useEffect, useState } from "react";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => setNews(data.articles || []))
      .catch(err => console.log(err));
  }, []);

  const next = () => {
    if (index < news.length - 1) setIndex(index + 1);
  };

  if (news.length === 0) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  const article = news[index];

  return (
    <div onClick={next} style={{ height: "100vh", padding: "30px", fontFamily: "system-ui" }}>
      <h2>{article.title}</h2>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{ color: "#ff3b30", fontWeight: "600" }}
      >
        Read Full Article →
      </a>

      <div style={{ marginTop: "20px", fontSize: "13px", color: "gray" }}>
        {new Date(article.publishedAt).toLocaleString()}
      </div>
    </div>
  );
}