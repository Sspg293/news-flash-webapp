
export default async function handler(req, res) {

  const NEWS_API_KEY = "0c97b4f80fe94b3bb717a53f282b3091";
  const GNEWS_API_KEY = "4a142ac699050dd6b595b88cb90da432";

  const rssFeeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://techcrunch.com/feed/",
    "https://feeds.feedburner.com/ndtvnews-top-stories"
  ];

  try {
    let combined = [];

    // Disable cache so shuffle works every refresh
    res.setHeader("Cache-Control", "no-store");

    // ==============================
    // 1️⃣ NEWS API
    // ==============================
    try {
      const newsRes = await fetch(
        `https://newsapi.org/v2/top-headlines?country=in&pageSize=100&apiKey=${NEWS_API_KEY}`
      );

      const newsData = await newsRes.json();

      if (newsData.status === "ok" && newsData.articles) {
        combined.push(
          ...newsData.articles
            .filter(a => a.title && a.url && a.urlToImage && a.url.startsWith("http"))
            .map(a => ({
              title: a.title,
              description: a.description,
              url: a.url.trim(),
              image: a.urlToImage
            }))
        );
      }
    } catch (err) {
      console.log("NewsAPI failed");
    }

    // ==============================
    // 2️⃣ GNEWS
    // ==============================
    try {
      const gnewsRes = await fetch(
        `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=100&apikey=${GNEWS_API_KEY}`
      );

      const gnewsData = await gnewsRes.json();

      if (gnewsData.articles) {
        combined.push(
          ...gnewsData.articles
            .filter(a => a.title && a.url && a.image && a.url.startsWith("http"))
            .map(a => ({
              title: a.title,
              description: a.description,
              url: a.url.trim(),
              image: a.image
            }))
        );
      }
    } catch (err) {
      console.log("GNews failed");
    }

    // ==============================
    // 3️⃣ RSS WITH IMAGE EXTRACTION
    // ==============================
    for (const feed of rssFeeds) {
      try {
        const response = await fetch(feed);
        const xml = await response.text();

        const items = xml.split("<item>").slice(1, 80);

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
        console.log("RSS failed for:", feed);
      }
    }

    // Remove duplicates
    const unique = Array.from(
      new Map(combined.map(a => [a.url, a])).values()
    );

    // Shuffle (Fisher-Yates)
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }

    return res.status(200).json({ articles: unique });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Aggregator failed" });
  }
}
