
// VERSION 3 - CLEAN BUILD FILE
// If you still see old error, Vercel is building wrong branch/repo

import { useEffect, useState } from "react";

const API_KEY = "4a142ac699050dd6b595b88cb90da432";

export default function App() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("https://gnews.io/api/v4/top-headlines?country=in&apikey=" + API_KEY)
      .then(res => res.json())
      .then(data => {
        if (data.articles) setNews(data.articles);
      })
      .catch(err => console.log(err));
  }, []);

  if (news.length === 0) {
    return <div>VERSION 3 LOADING...</div>;
  }

  const article = news[index];

  return (
    <div>
      <h2>{article.title}</h2>
      <p>{article.description}</p>

      <button onClick={() => index > 0 && setIndex(index - 1)}>
        Prev
      </button>

      <button onClick={() => index < news.length - 1 && setIndex(index + 1)}>
        Next
      </button>
    </div>
  );
}
