const catTypeInput = document.getElementById("cat-type");
const originInput = document.getElementById("origin"); 

const textContent = document.getElementById("text-content");
const imgRow = document.getElementById("img-row");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

window.addEventListener("DOMContentLoaded", () => {
  fetchCat("bengal");
  renderFavorites();
});

searchBtn.addEventListener("click", () => {
  fetchCat(searchInput.value.trim().toLowerCase());
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchCat(searchInput.value.trim().toLowerCase());
  }
});

async function fetchCat(query) {
  if (!query) return;

  try {
    const res = await fetch("https://api.thecatapi.com/v1/breeds");
    const breeds = await res.json();

    const cat = breeds.find(b =>
      b.name.toLowerCase().includes(query)
    );

    if (!cat) {
      textContent.innerHTML = "<p>No breed found.</p>";
      imgRow.innerHTML = "";
      return;
    }

    currentCat = cat

    catTypeInput.value = cat.name;
    originInput.value = cat.origin;

    textContent.innerHTML = `
      <p><strong>Description:</strong> ${cat.description || "No description available"}</p>
      <p><strong>Temperament:</strong> ${cat.temperament || "N/A"}</p>
      <p><strong>Life Span:</strong> ${cat.life_span || "N/A"} years</p>
    `;

    const imgRes = await fetch(
      `https://api.thecatapi.com/v1/images/search?limit=3&breed_ids=${cat.id}`
    );

    const imgs = await imgRes.json();

    imgRow.innerHTML = imgs.length
      ? imgs.slice(0, 3).map(img => `<img src="${img.url}">`).join("")
      : "<p>No images available</p>";

  } catch (err) {
    console.error(err);
    textContent.innerHTML = "<p>Error loading data</p>";
    imgRow.innerHTML = "";
  }
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, get, child } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://cat-api-d08f2-default-rtdb.firebaseio.com/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const favoritesRef = ref(database, "favorites");

let currentCat = null; // To store the result of the latest search

const favBtn = document.getElementById("fav-btn");

favBtn.addEventListener("click", function () {
  if (!currentCat) return alert("Search for a cat first!");

  const catData = {
    name: currentCat.name,
    origin: currentCat.origin,
    savedAt: Date.now()
  };

  push(favoritesRef, catData);

  let localFavs = JSON.parse(localStorage.getItem("favCats")) || [];
  localFavs.push(catData);
  localStorage.setItem("favCats", JSON.stringify(localFavs));

  alert("Saved!");
});

async function renderFavorites() {
  const listDiv = document.getElementById("favorites-list");
  listDiv.innerHTML = "<h3>My Favorites:</h3>";

  try {
    const snapshot = await get(child(ref(database), "favorites"));

    if (snapshot.exists()) {
      const data = snapshot.val();

      Object.values(data).forEach(cat => {
        listDiv.innerHTML += `<p>🐾 ${cat.name} (${cat.origin})</p>`;
      });
    } else {
      listDiv.innerHTML += "<p>No favorites yet.</p>";
    }
  } catch (e) {
    console.error(e);

    const localFavs = JSON.parse(localStorage.getItem("favCats")) || [];
    localFavs.forEach(cat => {
      listDiv.innerHTML += `<p>🏠 ${cat.name} (Local)</p>`;
    });
  }
}
