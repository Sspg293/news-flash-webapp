export default async function handler(req, res) {
  const feeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "http://rss.cnn.com/rss/edition.rss",
    "https://techcrunch.com/feed/",
    "https://feeds.feedburner.com/ndtvnews-top-stories"
  ];

  try {
    const responses = await Promise.all(
      feeds.map(url => fetch(url).then(r => r.text()))
    );

    let articles = [];

    responses.forEach(xml => {
      const items = xml.split("<item>").slice(1);
      items.forEach(item => {
        const title = item.split("<title>")[1]?.split("</title>")[0];
        const link = item.split("<link>")[1]?.split("</link>")[0];
        const pubDate = item.split("<pubDate>")[1]?.split("</pubDate>")[0];

        if (title && link) {
          articles.push({
            title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1"),
            url: link,
            publishedAt: pubDate || new Date().toISOString()
          });
        }
      });
    });

    const unique = Array.from(new Map(articles.map(a => [a.title, a])).values());
    unique.sort(() => Math.random() - 0.5);

    res.status(200).json({ articles: unique });
  } catch (error) {
    res.status(500).json({ error: "RSS fetch failed" });
  }
}