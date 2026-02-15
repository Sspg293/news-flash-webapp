
export default async function handler(req, res) {

  const rssFeeds = [
    // India
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://www.hindustantimes.com/feeds/rss/topnews/rssfeed.xml",
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://indianexpress.com/section/india/feed/",
    "https://www.thehindu.com/news/national/feeder/default.rss",
    "https://feeds.feedburner.com/ndtvnews-top-stories",

    // World
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.theguardian.com/world/rss",
    "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",

    // Tech
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://www.wired.com/feed/rss",
    "https://feeds.arstechnica.com/arstechnica/index",
    "https://www.cnet.com/rss/news/",

    // Business
    "https://www.moneycontrol.com/rss/business.xml",
    "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
    "https://www.forbes.com/business/feed/",
    "https://feeds.marketwatch.com/marketwatch/topstories/",

    // Crypto
    "https://cointelegraph.com/rss",
    "https://bitcoinmagazine.com/.rss/full/",
    "https://cryptoslate.com/feed/",

    // Sports
    "https://www.espn.com/espn/rss/news",
    "https://sports.ndtv.com/rss/all",
    "https://www.skysports.com/rss/12040"
  ];

  try {
    let combined = [];

    res.setHeader("Cache-Control", "no-store");

    for (const feed of rssFeeds) {
      try {
        const response = await fetch(feed);
        const xml = await response.text();

        const items = xml.split("<item>").slice(1, 300);

        items.forEach(item => {
          const rawTitle = item.split("<title>")[1]?.split("</title>")[0];
          let rawLink = item.split("<link>")[1]?.split("</link>")[0];
          const descriptionRaw =
            item.split("<description>")[1]?.split("</description>")[0];

          if (!rawTitle || !rawLink) return;

          const title = rawTitle.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");

          rawLink = rawLink.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");
          rawLink = rawLink.replace(/&amp;/g, "&").trim();

          if (!rawLink.startsWith("http")) return;

          const mediaMatch = item.match(/<media:content.*?url="(.*?)"/);
          const enclosureMatch = item.match(/<enclosure.*?url="(.*?)"/);
          const imgMatch = descriptionRaw?.match(/<img.*?src="(.*?)"/);

          const extractedImage =
            mediaMatch?.[1] ||
            enclosureMatch?.[1] ||
            imgMatch?.[1];

          if (!extractedImage) return;

          const cleanDescription = descriptionRaw
            ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
            ?.replace(/<[^>]*>/g, "");

          combined.push({
            title,
            description: cleanDescription,
            url: rawLink,
            image: extractedImage
          });
        });

      } catch (err) {
        console.log("RSS failed:", feed);
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

    return res.status(200).json({ articles: unique });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "RSS Aggregator failed" });
  }
}
