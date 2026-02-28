
// BBC Hindi RSS Backend - Correct Image Extraction

let cache = {};
const CACHE_TIME = 5 * 60 * 1000;

function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarize50(text) {
  const clean = cleanText(text);
  if (!clean) return "";
  const words = clean.split(" ");
  if (words.length <= 50) return clean;
  return words.slice(0, 50).join(" ") + "...";
}

function extractImageFromItem(item, description) {

  // 1️⃣ BBC uses media:thumbnail
  let thumbnail = item.match(/<media:thumbnail.*?url="(.*?)"/i)?.[1];
  if (thumbnail) return thumbnail;

  // 2️⃣ media:content
  let media = item.match(/<media:content.*?url="(.*?)"/i)?.[1];
  if (media) return media;

  // 3️⃣ enclosure
  let enclosure = item.match(/<enclosure.*?url="(.*?)"/i)?.[1];
  if (enclosure) return enclosure;

  // 4️⃣ img inside description
  let img = description.match(/<img.*?src="(.*?)"/i)?.[1];
  if (img) return img;

  return "";
}

export default async function handler(req, res) {

  const category = req.query.category || "general";

  const feeds = {
    general: "https://feeds.bbci.co.uk/hindi/rss.xml",
    business: "https://feeds.bbci.co.uk/hindi/business/rss.xml",
    technology: "https://feeds.bbci.co.uk/hindi/science/rss.xml",
    sports: "https://feeds.bbci.co.uk/hindi/sport/rss.xml",
    health: "https://feeds.bbci.co.uk/hindi/rss.xml",
    science: "https://feeds.bbci.co.uk/hindi/science/rss.xml",
    entertainment: "https://feeds.bbci.co.uk/hindi/rss.xml"
  };

  const rssFeed = feeds[category] || feeds.general;
  const now = Date.now();

  if (cache[category] && now - cache[category].time < CACHE_TIME) {
    return res.status(200).json({ articles: cache[category].data });
  }

  try {

    const response = await fetch(rssFeed);
    const xml = await response.text();
    const items = xml.split("<item>").slice(1, 21);

    let articles = [];

    for (let item of items) {

      let rawTitle = item.split("<title>")[1]?.split("</title>")[0] || "";
      let rawDescription = item.split("<description>")[1]?.split("</description>")[0] || "";
      let link = item.split("<link>")[1]?.split("</link>")[0];

      const title = cleanText(rawTitle);
      const description = summarize50(rawDescription);

      const image = extractImageFromItem(item, rawDescription);

      if (!title || !link) continue;

      articles.push({
        title,
        description,
        url: link.trim(),
        image
      });
    }

    cache[category] = { data: articles, time: now };

    return res.status(200).json({ articles });

  } catch (error) {
    return res.status(500).json({ error: "समाचार लोड नहीं हो पाए" });
  }
}
