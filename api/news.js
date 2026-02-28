
// Backend Shuffle Version (Order changes every refresh)

let cache = {};
const CACHE_TIME = 5 * 60 * 1000;

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
  return (
    item.match(/<media:thumbnail.*?url="(.*?)"/i)?.[1] ||
    item.match(/<media:content.*?url="(.*?)"/i)?.[1] ||
    item.match(/<enclosure.*?url="(.*?)"/i)?.[1] ||
    description.match(/<img.*?src="(.*?)"/i)?.[1] ||
    ""
  );
}

export default async function handler(req, res) {

  const rssFeed = "https://feeds.bbci.co.uk/hindi/rss.xml";

  try {
    const response = await fetch(rssFeed);
    const xml = await response.text();
    const items = xml.split("<item>").slice(1, 30);

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

    // 🔥 Shuffle BEFORE sending response
    const shuffled = shuffleArray(articles);

    return res.status(200).json({ articles: shuffled });

  } catch (error) {
    return res.status(500).json({ error: "समाचार लोड नहीं हो पाए" });
  }
}
