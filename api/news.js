
export default async function handler(req, res) {
  const PEXELS_API_KEY = "7ihjMEtOYkwa04X5bNK5MPInZixwcBnNXIW4oFdvaR4ZUDsxAxDvxwHt";

  const feeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://techcrunch.com/feed/",
    "https://feeds.feedburner.com/ndtvnews-top-stories"
  ];

  try {
    const responses = await Promise.all(
      feeds.map(url => fetch(url).then(r => r.text()))
    );

    let articles = [];

    for (const xml of responses) {
      const items = xml.split("<item>").slice(1, 12);

      for (const item of items) {
        const title = item.split("<title>")[1]?.split("</title>")[0];
        const link = item.split("<link>")[1]?.split("</link>")[0];
        const pubDate = item.split("<pubDate>")[1]?.split("</pubDate>")[0];
        const descriptionRaw =
          item.split("<description>")[1]?.split("</description>")[0];

        if (!title || !link) continue;

        const cleanTitle = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");
        const keyword = cleanTitle.split(" ").slice(0, 2).join(" ");

        let image = null;

        try {
          const imgRes = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`,
            {
              headers: {
                Authorization: PEXELS_API_KEY
              }
            }
          );

          const imgData = await imgRes.json();
          image = imgData.photos?.[0]?.src?.landscape || null;
        } catch (err) {
          image = null;
        }

        if (!image) {
          image = `https://picsum.photos/800/400?random=${Math.floor(
            Math.random() * 10000
          )}`;
        }

        const cleanDescription = descriptionRaw
          ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
          ?.replace(/<[^>]*>/g, "");

        articles.push({
          title: cleanTitle,
          url: link,
          description: cleanDescription,
          image,
          publishedAt: pubDate || new Date().toISOString()
        });
      }
    }

    res.status(200).json({ articles });

  } catch (error) {
    res.status(500).json({ error: "RSS + Image fetch failed" });
  }
}
