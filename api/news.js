
export default async function handler(req, res) {
  const GNEWS_API_KEY = "4a142ac699050dd6b595b88cb90da432";

  const rssFeeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://techcrunch.com/feed/",
    "https://feeds.feedburner.com/ndtvnews-top-stories",
    "https://rss.cnn.com/rss/edition.rss"
  ];

  try {
    let combinedArticles = [];

    // 🔥 1. Fetch GNews
    const gnewsRes = await fetch(
      `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=50&apikey=${GNEWS_API_KEY}`
    );

    const gnewsData = await gnewsRes.json();

    if (gnewsData.articles) {
      combinedArticles.push(
        ...gnewsData.articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt
        }))
      );
    }

    // 🔥 2. Fetch RSS Feeds
    const rssResponses = await Promise.all(
      rssFeeds.map(url => fetch(url).then(r => r.text()))
    );

    rssResponses.forEach(xml => {
      const items = xml.split("<item>").slice(1);

      items.forEach(item => {
        const title = item.split("<title>")[1]?.split("</title>")[0];
        const link = item.split("<link>")[1]?.split("</link>")[0];
        const pubDate = item.split("<pubDate>")[1]?.split("</pubDate>")[0];
        const descriptionRaw =
          item.split("<description>")[1]?.split("</description>")[0];

        if (!title || !link) return;

        const cleanTitle = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");
        const cleanDescription = descriptionRaw
          ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
          ?.replace(/<[^>]*>/g, "");

        combinedArticles.push({
          title: cleanTitle,
          description: cleanDescription,
          url: link,
          image: null, // RSS often lacks clean images
          publishedAt: pubDate || new Date().toISOString()
        });
      });
    });

    // 🔥 3. Remove duplicates by URL
    const unique = Array.from(
      new Map(combinedArticles.map(a => [a.url, a])).values()
    );

    // 🔥 4. Sort by newest first
    unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.status(200).json({ articles: unique });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hybrid fetch failed" });
  }
}
