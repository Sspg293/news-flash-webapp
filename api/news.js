
export default async function handler(req, res) {

  const NEWS_API_KEY = "0c97b4f80fe94b3bb717a53f282b3091";
  const GNEWS_API_KEY = "4a142ac699050dd6b595b88cb90da432";

  const rssFeeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://techcrunch.com/feed/",
    "https://feeds.feedburner.com/ndtvnews-top-stories"
  ];

  res.setHeader("Cache-Control", "no-store");

  function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return `${diff} sec ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hrs ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return past.toLocaleDateString();
  }

  try {
    let combined = [];

    // NewsAPI
    try {
      const newsRes = await fetch(
        `https://newsapi.org/v2/top-headlines?country=in&pageSize=100&apiKey=${NEWS_API_KEY}`
      );
      const newsData = await newsRes.json();

      if (newsData.status === "ok") {
        combined.push(
          ...newsData.articles
            .filter(a => a.url && a.urlToImage)
            .map(a => {
              const iso = new Date(a.publishedAt).toISOString();
              return {
                title: a.title,
                description: a.description,
                url: a.url,
                image: a.urlToImage,
                publishedAt: iso,
                timeAgo: getTimeAgo(iso)
              };
            })
        );
      }
    } catch {}

    // GNews
    try {
      const gnewsRes = await fetch(
        `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=100&apikey=${GNEWS_API_KEY}`
      );
      const gnewsData = await gnewsRes.json();

      if (gnewsData.articles) {
        combined.push(
          ...gnewsData.articles
            .filter(a => a.url && a.image)
            .map(a => {
              const iso = new Date(a.publishedAt).toISOString();
              return {
                title: a.title,
                description: a.description,
                url: a.url,
                image: a.image,
                publishedAt: iso,
                timeAgo: getTimeAgo(iso)
              };
            })
        );
      }
    } catch {}

    // RSS
    for (const feed of rssFeeds) {
      try {
        const response = await fetch(feed);
        const xml = await response.text();
        const items = xml.split("<item>").slice(1, 60);

        items.forEach(item => {
          const title = item.split("<title>")[1]?.split("</title>")[0];
          let link = item.split("<link>")[1]?.split("</link>")[0];
          const pubDate = item.split("<pubDate>")[1]?.split("</pubDate>")[0];
          const descriptionRaw =
            item.split("<description>")[1]?.split("</description>")[0];

          if (!title || !link) return;

          link = link.replace(/&amp;/g, "&").trim();
          if (!link.startsWith("http")) return;

          const mediaMatch = item.match(/<media:content.*?url="(.*?)"/);
          const enclosureMatch = item.match(/<enclosure.*?url="(.*?)"/);
          const imgMatch = descriptionRaw?.match(/<img.*?src="(.*?)"/);

          const image =
            mediaMatch?.[1] ||
            enclosureMatch?.[1] ||
            imgMatch?.[1];

          if (!image) return;

          const parsedDate = new Date(pubDate);
          const iso = isNaN(parsedDate) ? new Date().toISOString() : parsedDate.toISOString();

          combined.push({
            title,
            description: descriptionRaw?.replace(/<[^>]*>/g, ""),
            url: link,
            image,
            publishedAt: iso,
            timeAgo: getTimeAgo(iso)
          });
        });

      } catch {}
    }

    const unique = Array.from(
      new Map(combined.map(a => [a.url, a])).values()
    );

    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }

    return res.status(200).json({ articles: unique });

  } catch {
    return res.status(500).json({ error: "Failed" });
  }
}
