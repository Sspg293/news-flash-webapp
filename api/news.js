
// FlashBrief - Breaking News Only (BBC Hindi Top Stories)

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

function extractImage(item, description) {
  return (
    item.match(/<media:thumbnail.*?url="(.*?)"/i)?.[1] ||
    item.match(/<media:content.*?url="(.*?)"/i)?.[1] ||
    item.match(/<enclosure.*?url="(.*?)"/i)?.[1] ||
    description.match(/<img.*?src="(.*?)"/i)?.[1] ||
    ""
  );
}

export default async function handler(req, res) {

  // BBC Hindi Main Feed (Top Stories = Breaking Style)
  const rssFeed = "https://feeds.bbci.co.uk/hindi/rss.xml";

  try {
    const response = await fetch(rssFeed);
    const xml = await response.text();
    const items = xml.split("<item>").slice(1, 16);

    let articles = [];

    for (let item of items) {
      let rawTitle = item.split("<title>")[1]?.split("</title>")[0] || "";
      let rawDescription = item.split("<description>")[1]?.split("</description>")[0] || "";
      let link = item.split("<link>")[1]?.split("</link>")[0];

      const title = cleanText(rawTitle);
      const description = summarize50(rawDescription);
      const image = extractImage(item, rawDescription);

      if (!title || !link) continue;

      articles.push({
        title,
        description,
        url: link.trim(),
        image
      });
    }

    return res.status(200).json({ articles });

  } catch (error) {
    return res.status(500).json({ error: "ब्रेकिंग न्यूज़ लोड नहीं हो पाई" });
  }
}
