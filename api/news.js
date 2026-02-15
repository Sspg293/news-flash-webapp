
export default async function handler(req, res) {
  const GNEWS_API_KEY = "4a142ac699050dd6b595b88cb90da432";

  const queries = [
    "india",
    "technology",
    "business",
    "sports",
    "world",
    "finance",
    "crypto",
    "ai",
    "startups",
    "politics"
  ];

  try {
    let allArticles = [];

    // Fetch top headlines
    const topRes = await fetch(
      `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=50&apikey=${GNEWS_API_KEY}`
    );
    const topData = await topRes.json();

    if (topData.articles) {
      allArticles.push(...topData.articles);
    }

    // Fetch multiple search queries
    for (const query of queries) {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=50&apikey=${GNEWS_API_KEY}`
      );

      const data = await response.json();

      if (data.articles) {
        allArticles.push(...data.articles);
      }
    }

    // Remove duplicates by title
    const unique = Array.from(
      new Map(allArticles.map(a => [a.title, a])).values()
    );

    // Shuffle articles
    unique.sort(() => Math.random() - 0.5);

    // Format for frontend
    const formatted = unique.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt
    }));

    res.status(200).json({ articles: formatted });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Large feed fetch failed" });
  }
}
