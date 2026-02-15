
export default async function handler(req, res) {

  const NEWS_API_KEY = "0c97b4f80fe94b3bb717a53f282b3091";
  const GNEWS_API_KEY = "4a142ac699050dd6b595b88cb90da432";

  const rssFeeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://techcrunch.com/feed/",
    "https://feeds.feedburner.com/ndtvnews-top-stories",
    "https://rss.cnn.com/rss/edition.rss"
  ];

  const APP_LOGO =
    "https://dummyimage.com/800x400/111/ffffff&text=FlashBrief";

  try {
    let combined = [];

    // 1. NewsAPI
    try {
      const newsRes = await fetch(
        `https://newsapi.org/v2/top-headlines?country=in&pageSize=100&apiKey=${NEWS_API_KEY}`
      );
      const newsData = await newsRes.json();

      if (newsData.status === "ok" && newsData.articles) {
        combined.push(
          ...newsData.articles.map(a => ({
            title: a.title,
            description: a.description,
            url: a.url,
            image: a.urlToImage,
            publishedAt: a.publishedAt
          }))
        );
      }
    } catch (err) {
      console.log("NewsAPI failed");
    }

    // 2. GNews
    try {
      const gnewsRes = await fetch(
        `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=100&apikey=${GNEWS_API_KEY}`
      );
      const gnewsData = await gnewsRes.json();

      if (gnewsData.articles) {
        combined.push(
          ...gnewsData.articles.map(a => ({
            title: a.title,
            description: a.description,
            url: a.url,
            image: a.image,
            publishedAt: a.publishedAt
          }))
        );
      }
    } catch (err) {
      console.log("GNews failed");
    }

    // 3. RSS
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

        combined.push({
          title: cleanTitle,
          description: cleanDescription,
          url: link,
          image: APP_LOGO,
          publishedAt: pubDate || new Date().toISOString()
        });
      });
    });

    const unique = Array.from(
      new Map(combined.map(a => [a.url, a])).values()
    );

    unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    return res.status(200).json({ articles: unique });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Aggregator failed" });
  }
}
