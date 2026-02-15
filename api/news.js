
export default async function handler(req, res) {

  // Vercel-safe limited RSS list (fast + reliable)
  const rssFeeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://www.hindustantimes.com/feeds/rss/topnews/rssfeed.xml",
    "https://indianexpress.com/section/india/feed/",
    "https://www.thehindu.com/news/national/feeder/default.rss",
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://www.moneycontrol.com/rss/business.xml",
    "https://cointelegraph.com/rss",
    "https://www.espn.com/espn/rss/news",
    "https://www.aljazeera.com/xml/rss/all.xml"
  ];

  try {
    res.setHeader("Cache-Control", "no-store");

    // Fetch feeds in parallel (Vercel optimized)
    const feedResponses = await Promise.all(
      rssFeeds.map(feed =>
        fetch(feed)
          .then(res => res.text())
          .catch(() => null)
      )
    );

    let combined = [];

    feedResponses.forEach(xml => {
      if (!xml) return;

      const items = xml.split("<item>").slice(1, 100);

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
    });

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
