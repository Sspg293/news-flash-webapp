
import { useEffect, useState } from "react";

const API_KEY = "4a142ac699050dd6b595b88cb90da432";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const url =
      "https://gnews.io/api/v4/top-headlines?country=in&apikey=" + API_KEY;

    fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url))
      .then((res) => res.json())
      .then((data) => {
        const parsed = JSON.parse(data.contents);
        setNews(parsed.articles || []);
      })
      .catch((err) => console.log(err));
  }, []);

  const next = () => {
    if (index < news.length - 1) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  if (news.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading News...
      </div>
    );
  }

  const article = news[index];

  return (
    <div
      onClick={next}
      style={{
        height: "100vh",
        backgroundImage: `url(${article.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "20px",
        color: "white",
        backgroundColor: "black"
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.6)",
          padding: "15px",
          borderRadius: "10px"
        }}
      >
        <h2>{article.title}</h2>
        <p>{article.description?.slice(0, 180)}...</p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px"
          }}
        >
          <button onClick={(e) => { e.stopPropagation(); prev(); }}>
            ⬆ Prev
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }}>
            ⬇ Next
          </button>
        </div>
      </div>
    </div>
  );
}
