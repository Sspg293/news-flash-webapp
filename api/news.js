
export default async function handler(req, res) {
  const API_KEY = "4a142ac699050dd6b595b88cb90da432";

  const url =
    "https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=20&apikey=" +
    API_KEY;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
