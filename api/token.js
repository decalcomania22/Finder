export default async function handler(req, res) {
  const auth = Buffer.from(
    import.meta.env.VITE_CLIENT_ID + ":" + import.meta.env.VITE_CLIENT_SECRET
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();
  res.status(200).json(data);
}
