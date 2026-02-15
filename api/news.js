
let cache = {
  data: null,
  time: 0
};

export default async function handler(req, res) {
  const now = Date.now();

  // Serve cached data for 5 minutes
  if (cache.data && now - cache.time < 5 * 60 * 1000) {
    return res.status(200).json({ articles: cache.data });
  }

  const rssFeeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://www.hindustantimes.com/feeds/rss/topnews/rssfeed.xml",
    "https://indianexpress.com/section/india/feed/",
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml"
  ];

  try {
    let combined = [];

    for (const feed of rssFeeds) {
      try {
        const response = await fetch(feed);
        const xml = await response.text();

        const items = xml.split("<item>").slice(1, 50);

        items.forEach(item => {
          const title = item.split("<title>")[1]?.split("</title>")[0];
          const link = item.split("<link>")[1]?.split("</link>")[0];
          const mediaMatch = item.match(/<media:content.*?url="(.*?)"/);
          const enclosureMatch = item.match(/<enclosure.*?url="(.*?)"/);

          const image = mediaMatch?.[1] || enclosureMatch?.[1];

          if (title && link && image) {
            combined.push({
              title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1"),
              description: "",
              url: link.trim(),
              image
            });
          }
        });
      } catch (err) {
        console.log("Feed failed:", feed);
      }
    }

    // Remove duplicates
    const unique = Array.from(
      new Map(combined.map(a => [a.url, a])).values()
    );

    // Shuffle
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }

    // Save cache
    cache = { data: unique, time: now };

    return res.status(200).json({ articles: unique });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "RSS Aggregator failed" });
  }
}
