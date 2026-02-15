
import { useEffect, useState } from "react";

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

  if (news.length === 0) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  const article = news[index];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f5f5f5" }}>
      <div style={{ height: "40%", backgroundImage: `url(${article.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ flex: 1, padding: "20px", backgroundColor: "white", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", marginTop: "-20px" }}>
        <h2 style={{ marginBottom: "15px" }}>{article.title}</h2>
        <p style={{ lineHeight: "1.6" }}>{smartSummarize(article)}</p>
        <div style={{ marginTop: "15px", fontSize: "13px", color: "gray" }}>
          {article.source?.name || "Source"} • {new Date(article.publishedAt).toLocaleDateString()}
        </div>
        <div style={{ marginTop: "20px" }}>
          <button onClick={prev}>⬆ Prev</button>
          <button onClick={next} style={{ marginLeft: "10px" }}>⬇ Next</button>
        </div>
      </div>
    </div>
  );
}
