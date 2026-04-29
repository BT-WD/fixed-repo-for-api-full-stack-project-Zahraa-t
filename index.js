const catTypeInput = document.getElementById("cat-type");
const originInput = document.getElementById("origin");

const textContent = document.getElementById("text-content");
const imgRow = document.getElementById("img-row");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

// default cat so page is NOT empty
window.addEventListener("DOMContentLoaded", () => {
  fetchCat("bengal");
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

    // inputs
    catTypeInput.value = cat.name;
    originInput.value = cat.origin;

    // text always shows
    textContent.innerHTML = `
      <p><strong>Description:</strong> ${cat.description || "No description available"}</p>
      <p><strong>Temperament:</strong> ${cat.temperament || "N/A"}</p>
      <p><strong>Life Span:</strong> ${cat.life_span || "N/A"} years</p>
    `;

    // images (safe fetch)
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
