const PORT = process.env.PORT || 8000;
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const cors = require("cors");

const baseURL = "https://iosmirror.cc/";

const corsOptions = {
  //   origin: "https://iosmirror.cc/", // Replace with the origin(s) you want to allow
  credentials: true, // Allow sending cookies and other credentials
  allowedHeaders: [
    "Origin",
    "Content-Type",
    "X-Amz-Date",
    "Authorization",
    "X-Api-Key",
    "X-Amz-Security-Token",
    "locale",
  ],
  methods: "POST, OPTIONS, GET", // Specify the allowed HTTP methods
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  let info = {
    popular: `http://localhost:${PORT}/api/popular/page=:page`,
    movies: `http://localhost:${PORT}/api/movies/page=:page`,
    recentlyAdded: `http://localhost:${PORT}/api/recently-added/drama/page=:page`,
    kshow: `http://localhost:${PORT}/api/kshow/page=:page`,
    search: `http://localhost:${PORT}/api/search/:word/:page`,
    episode_link: `http://localhost:${PORT}/api/watching/:id`,
    recently_added: `http://localhost:${PORT}/api/recentlyadded/:page`,
  };
  res.send(info);
});

app.get("/:type", async (req, res) => {
  const allCouponURL = `${baseURL}${req.params.type}`;

  try {
    const { data: html } = await axios.get(allCouponURL);
    const $ = cheerio.load(html);

    const trayContainers = [];
    const top10Elements = [];

    // Process tray containers
    $(".tray-container").each((index, element) => {
      const categoryTitle = $(element)
        .find(
          ".tray-wrapper > .tray-carousel > .mobile-tray-title > .col-container > .tray-title > .tray-link"
        )
        .text()
        .trim();
      const movies = [];

      $(element)
        .find(
          ".tray-wrapper > .tray-carousel > .container > .middle-mob-tray-container > .inner-mob-tray-container > article"
        )
        .each((i, movie) => {
          const movieTitle = $(movie)
            .find("a > div > div img")
            .attr("data-src");
          const postID = $(movie).find("a").attr("data-post");
          const dataTime = $("body").attr("data-time");
          movies.push({ movieTitle, postID, dataTime });
        });

      trayContainers.push({ categoryTitle, movies });
    });

    // Process top10 elements
    $(".top10").each((index, element) => {
      const categoryTitle = $(element).find("span").text().trim();
      const movies = [];

      $(element)
        .find(".top10-posts > .top10-post")
        .each((i, movie) => {
          const movieTitle = $(movie).find(".top10-img > img").attr("data-src");
          const postID = $(movie).attr("data-post");
          const dataTime = $("body").attr("data-time");
          movies.push({ movieTitle, postID, dataTime });
        });

      top10Elements.push({ categoryTitle, movies });
    });

    // Return the extracted data
    res.json({
      trayContainers,
      top10Elements,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Internal Server Error");
  }
});

async function fetchData(apiUrl) {
  try {
    // Fetch the data from the API
    const response = await axios.get(apiUrl);

    // Return the data as JSON
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
app.get("/postData", async (req, res) => {
  const { postID, timeData } = req.query;
  if (!postID || !timeData) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  const apiUrl = `https://iosmirror.cc/post.php?id=${postID}&t=${timeData}`;

  try {
    const data = await fetchData(apiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/episodes", async (req, res) => {
  const { postID, timeData, seriesID } = req.query;
  if (!postID || !timeData) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  let apiUrl = `https://iosmirror.cc/post.php?id=${postID}&t=${timeData}`;
  if (seriesID) {
    apiUrl += `&s=${seriesID}`;
  }

  try {
    const data = await fetchData(apiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
app.get("/playlist", async (req, res) => {
  const { postID, timeData, episodeName } = req.query;
  if (!postID || !timeData) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  let apiUrl = `https://iosmirror.cc/post.php?id=${postID}&t=${episodeName}&tm=${timeData}`;

  try {
    const data = await fetchData(apiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
