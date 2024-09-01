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

app.get("/home", async (req, res) => {
  const allCouponURL = `${baseURL}movies`;

  try {
    const { data: html } = await axios.get(allCouponURL);
    const $ = cheerio.load(html);

    const trayContainers = [];
    const top10Elements = [];

    // Process tray containers
    $('.tray-container').each((index, element) => {
      const categoryTitle = $(element).find('.tray-wrapper > .tray-carousel > .mobile-tray-title > .col-container > .tray-title > .tray-link').text().trim();
      const movies = [];

      $(element).find('.tray-wrapper > .tray-carousel > .container > .middle-mob-tray-container > .inner-mob-tray-container > article').each((i, movie) => {
        const movieTitle = $(movie).find('a > div > div img').attr('data-src');
        const postID = $(movie).find('a').attr('data-post');
        const dataTime = $('body').attr('data-time');
        movies.push({ movieTitle, postID, dataTime });
      });

      trayContainers.push({ categoryTitle, movies });
    });

    // Process top10 elements
    $('.top10').each((index, element) => {
      const categoryTitle = $(element).find('span').text().trim();
      const movies = [];

      $(element).find('.top10-posts > .top10-post').each((i, movie) => {
        const movieTitle = $(movie).find('.top10-img > img').attr('data-src');
        const postID = $(movie).attr('data-post');
        const dataTime = $('body').attr('data-time');
        movies.push({ movieTitle, postID, dataTime });
      });

      top10Elements.push({ categoryTitle, movies });
    });

    // Return the extracted data
    res.json({
      trayContainers,
      top10Elements
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Internal Server Error');
  }
});
// Function to perform scraping


// Define the endpoint
// app.get('/details/:postID', async (req, res) => {
//     const url = `${baseURL}watch/${req.params.postID}`; // Get the URL from the query parameters
//     const { data: html } = await axios.get(url);
//     const $ = cheerio.load(html);
//     const result =[];
//     if (!url) {
//         $('#exampleModalScrollable > .modal-dialog modal-dialog-scrollable > .modal-content').each((index, element) => {
//             const image = $(element).find('.modal-header > .modal-img > .modal-img-poster').attr('src');
//             const title = $(element).find('.modal-body modal-body-d > .model-title ').text;
//             const watch = $(element).find('.modal-body modal-body-d > .model-info > .model-match').text;
//             const year = $(element).find('.modal-body modal-body-d > .model-info > .model-year').text;
//             const ua = $(element).find('.modal-body modal-body-d > .model-info > .model-ua').text;
//             const runtime = $(element).find('.modal-body modal-body-d > .model-info > .model-runtime').text;
//             const hdsd = $(element).find('.modal-body modal-body-d > .model-info > .model-hdsd').text;
          
      
           
//             result.push({ categoryTitle, movies });
//           });
//         }
//         res.json(result);
// });

async function fetchData(apiUrl) {
    try {
        // Fetch the data from the API
        const response = await axios.get(apiUrl);

        // Return the data as JSON
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
app.get('/postData/:postID/:timeData', async (req, res) => {
    const apiUrl = `https://iosmirror.cc/post.php?id=${req.params.postID}&t=${req.params.timeData}`; // The API URL

    try {
        const data = await fetchData(apiUrl);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
