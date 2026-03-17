const express = require("express");
const app = express();

// 🌍 Store latest GPS location
let currentLocation = {
  lat: 19.0,
  lon: 72.0
};

// 🔥 DEBUG START
console.log("✅ UPDATED SERVER RUNNING");

// 📥 Receive GPS data from ESP32
app.get("/update", (req, res) => {
  const { lat, lon } = req.query;

  console.log("📥 Incoming request:", req.query);

  if (lat && lon) {
    currentLocation = {
      lat: parseFloat(lat),
      lon: parseFloat(lon)
    };

    console.log("📍 Updated Location:", currentLocation);
    res.send("OK");
  } else {
    console.log("❌ Invalid data received");
    res.status(400).send("Invalid Data");
  }
});

// 📡 Send location to frontend (map)
app.get("/location", (req, res) => {
  console.log("📡 Sending location:", currentLocation);
  res.json(currentLocation);
});

// 🧪 TEST ROUTE (IMPORTANT)
app.get("/test", (req, res) => {
  res.send("Server is working ✅");
});

// 🌍 MAP UI
app.get("/", (req, res) => {
  console.log("🌍 Map page opened");

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Live GPS Tracker</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>

    <style>
      body { margin: 0; }
      #map { height: 100vh; }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

    <script>
      const map = L.map('map').setView([19, 72], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      let marker = L.marker([19,72]).addTo(map);

      async function updateLocation() {
        try {
          const res = await fetch('/location');
          const data = await res.json();

          console.log("📡 Data from server:", data);

          const lat = parseFloat(data.lat);
          const lon = parseFloat(data.lon);

          if (!isNaN(lat) && !isNaN(lon)) {
            marker.setLatLng([lat, lon]);
            map.setView([lat, lon], 17);
          }

        } catch (err) {
          console.log("❌ Error fetching location", err);
        }
      }

      // update every 3 sec
      setInterval(updateLocation, 3000);
    </script>

  </body>
  </html>
  `);
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});