/**
 * ==============================================================================
 * MovieMatch - Main JavaScript (Vanilla JS)
 * File: js/script.js
 * Description: Clean, beginner-friendly client-side logic for navigation,
 *              movie filtering/search, trailer modal, and watchlist storage.
 * ==============================================================================
 */

// Sample Default Watchlist Data (used if localStorage is initially empty)
const DEFAULT_WATCHLIST = [
  {
    id: "interstellar",
    title: "Interstellar",
    year: "2014",
    rating: "8.7",
    genre: "Sci-Fi • Adventure",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
  },
  {
    id: "inception",
    title: "Inception",
    year: "2010",
    rating: "8.8",
    genre: "Action • Sci-Fi",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
  },
  {
    id: "dune",
    title: "Dune",
    year: "2021",
    rating: "8.0",
    genre: "Sci-Fi • Adventure",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"
  }
];

// Trailer Video IDs for modal playback (YouTube Embed)
const TRAILER_URLS = {
  interstellar: "https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1",
  inception: "https://www.youtube.com/embed/YoHD9XEInc0?autoplay=1",
  "the-dark-knight": "https://www.youtube.com/embed/EXeTwQWrcwY?autoplay=1",
  dune: "https://www.youtube.com/embed/n9xhJrPXop4?autoplay=1",
  oppenheimer: "https://www.youtube.com/embed/uYPbbksJxIg?autoplay=1",
  default: "https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1"
};

/* ==============================================================================
   1. DOM Content Loaded - Initialization
   ============================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initWatchlistCounter();
  initTrailerModal();
  initMoviesPageFilters();
  initWatchlistPage();
  initWatchlistButtons();
  handleUrlParameters();
});

/* ==============================================================================
   2. Responsive Mobile Navigation Toggle
   ============================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    const isOpen = navMenu.classList.contains("open");
    toggleBtn.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
    toggleBtn.setAttribute("aria-expanded", isOpen);
  });

  // Close nav when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (
      navMenu.classList.contains("open") &&
      !navMenu.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      navMenu.classList.remove("open");
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });
}

/* ==============================================================================
   3. Watchlist Management (localStorage)
   ============================================================================== */
function getWatchlist() {
  const stored = localStorage.getItem("moviematch_watchlist");
  if (!stored) {
    // Initialize with default sample movies
    localStorage.setItem("moviematch_watchlist", JSON.stringify(DEFAULT_WATCHLIST));
    return DEFAULT_WATCHLIST;
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error("Error parsing watchlist:", err);
    return [];
  }
}

function saveWatchlist(list) {
  localStorage.setItem("moviematch_watchlist", JSON.stringify(list));
  updateWatchlistBadge();
}

function isInWatchlist(movieId) {
  const list = getWatchlist();
  return list.some((item) => item.id === movieId);
}

function toggleWatchlistMovie(movieData) {
  let list = getWatchlist();
  const index = list.findIndex((item) => item.id === movieData.id);

  if (index >= 0) {
    // Remove from watchlist
    list.splice(index, 1);
    saveWatchlist(list);
    showToast(`Removed "${movieData.title}" from your watchlist.`);
    return false;
  } else {
    // Add to watchlist
    list.push(movieData);
    saveWatchlist(list);
    showToast(`Added "${movieData.title}" to your watchlist!`);
    return true;
  }
}

function initWatchlistCounter() {
  updateWatchlistBadge();
}

function updateWatchlistBadge() {
  const badgeElements = document.querySelectorAll(".watchlist-badge");
  const count = getWatchlist().length;
  badgeElements.forEach((badge) => {
    badge.textContent = count;
  });
}

/**
 * Attaches click handlers to "Add to Watchlist" buttons across pages
 */
function initWatchlistButtons() {
  const buttons = document.querySelectorAll(".btn-toggle-watchlist");

  buttons.forEach((btn) => {
    const movieId = btn.dataset.id;
    if (!movieId) return;

    // Set initial button state
    updateWatchlistButtonState(btn, isInWatchlist(movieId));

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const movieData = {
        id: btn.dataset.id,
        title: btn.dataset.title || "Movie",
        year: btn.dataset.year || "2024",
        rating: btn.dataset.rating || "8.0",
        genre: btn.dataset.genre || "Action",
        poster: btn.dataset.poster || "assets/images/placeholder.svg"
      };

      const added = toggleWatchlistMovie(movieData);
      updateWatchlistButtonState(btn, added);

      // If we are currently on watchlist.html, refresh the list
      if (document.getElementById("watchlistContainer")) {
        renderWatchlistItems();
      }
    });
  });
}

function updateWatchlistButtonState(btn, isInList) {
  if (btn.classList.contains("overlay-btn-watchlist")) {
    if (isInList) {
      btn.classList.add("in-watchlist");
      btn.innerHTML = '<i class="fa-solid fa-check"></i> In Watchlist';
    } else {
      btn.classList.remove("in-watchlist");
      btn.innerHTML = '<i class="fa-solid fa-plus"></i> Watchlist';
    }
  } else {
    // Regular buttons (Hero or Details page)
    if (isInList) {
      btn.classList.add("btn-secondary");
      btn.innerHTML = '<i class="fa-solid fa-check"></i> In Watchlist';
    } else {
      btn.classList.remove("btn-secondary");
      btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Watchlist';
    }
  }
}

/* ==============================================================================
   4. Watchlist Page Handler (watchlist.html)
   ============================================================================== */
function initWatchlistPage() {
  const container = document.getElementById("watchlistContainer");
  if (!container) return;

  renderWatchlistItems();

  // Clear All button handler
  const clearBtn = document.getElementById("clearWatchlistBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your entire watchlist?")) {
        saveWatchlist([]);
        renderWatchlistItems();
        showToast("Your watchlist has been cleared.");
      }
    });
  }
}

function renderWatchlistItems() {
  const container = document.getElementById("watchlistContainer");
  const emptyState = document.getElementById("emptyWatchlist");
  const countEl = document.getElementById("watchlistCount");
  const clearBtn = document.getElementById("clearWatchlistBtn");

  if (!container) return;

  const list = getWatchlist();

  if (countEl) {
    countEl.textContent = `${list.length} ${list.length === 1 ? "movie" : "movies"} saved`;
  }

  if (list.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    if (clearBtn) clearBtn.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (clearBtn) clearBtn.style.display = "inline-flex";

  // Build HTML for each saved movie card
  container.innerHTML = list
    .map(
      (movie) => `
      <article class="movie-card" data-id="${movie.id}">
        <div class="movie-poster-wrap">
          <img 
            src="${movie.poster}" 
            alt="${movie.title} Poster" 
            class="movie-poster"
            loading="lazy"
            onerror="this.src='assets/images/placeholder.svg'"
          >
          <div class="rating-badge">
            <i class="fa-solid fa-star"></i>
            <span>${movie.rating}</span>
          </div>
          <div class="movie-overlay">
            <div class="overlay-actions">
              <a href="movie-details.html" class="overlay-btn overlay-btn-view">
                <i class="fa-solid fa-circle-info"></i> View Details
              </a>
              <button 
                class="overlay-btn overlay-btn-watchlist remove-from-watchlist-btn" 
                data-id="${movie.id}"
                data-title="${movie.title}"
              >
                <i class="fa-solid fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <div class="movie-meta">
            <span>${movie.year}</span>
            <span class="movie-genre">${movie.genre}</span>
          </div>
          <div class="watchlist-card-actions">
            <a href="movie-details.html" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-circle-info"></i> Details
            </a>
            <button 
              class="btn btn-danger btn-sm remove-from-watchlist-btn" 
              data-id="${movie.id}"
              data-title="${movie.title}"
            >
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  // Attach event listeners to newly generated remove buttons
  container.querySelectorAll(".remove-from-watchlist-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      let currentList = getWatchlist().filter((m) => m.id !== id);
      saveWatchlist(currentList);
      renderWatchlistItems();
      showToast(`Removed "${title}" from watchlist.`);
    });
  });
}

/* ==============================================================================
   5. Movies Page - Live Filtering & Search (movies.html)
   ============================================================================== */
function initMoviesPageFilters() {
  const moviesGrid = document.getElementById("exploreMoviesGrid");
  const searchInput = document.getElementById("movieSearchInput");
  const sortSelect = document.getElementById("movieSortSelect");
  const genrePills = document.querySelectorAll(".genre-pill");
  const resultsCount = document.getElementById("moviesResultsCount");
  const emptyState = document.getElementById("noMoviesFound");

  if (!moviesGrid) return;

  const movieCards = Array.from(moviesGrid.querySelectorAll(".movie-card"));

  function applyFilters() {
    const searchTerm = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const activePill = document.querySelector(".genre-pill.active");
    const selectedGenre = activePill ? activePill.dataset.genre.toLowerCase() : "all";
    const sortBy = sortSelect ? sortSelect.value : "popular";

    let visibleCards = [];

    movieCards.forEach((card) => {
      const title = (card.dataset.title || "").toLowerCase();
      const genres = (card.dataset.genres || "").toLowerCase();

      const matchesSearch = !searchTerm || title.includes(searchTerm);
      const matchesGenre = selectedGenre === "all" || genres.includes(selectedGenre);

      if (matchesSearch && matchesGenre) {
        card.style.display = "flex";
        visibleCards.push(card);
      } else {
        card.style.display = "none";
      }
    });

    // Sorting
    visibleCards.sort((a, b) => {
      if (sortBy === "rating") {
        return parseFloat(b.dataset.rating || 0) - parseFloat(a.dataset.rating || 0);
      } else if (sortBy === "newest") {
        return parseInt(b.dataset.year || 0) - parseInt(a.dataset.year || 0);
      } else {
        // "popular" (default order based on data-popularity)
        return parseInt(b.dataset.popularity || 0) - parseInt(a.dataset.popularity || 0);
      }
    });

    // Re-append in sorted order
    visibleCards.forEach((card) => moviesGrid.appendChild(card));

    // Update count display
    if (resultsCount) {
      resultsCount.textContent = `Showing ${visibleCards.length} ${
        visibleCards.length === 1 ? "movie" : "movies"
      }`;
    }

    // Toggle empty results card
    if (emptyState) {
      emptyState.style.display = visibleCards.length === 0 ? "block" : "none";
    }
  }

  // Genre pills click event
  genrePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      genrePills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      applyFilters();
    });
  });

  // Search input typing event
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // Sort dropdown change event
  if (sortSelect) {
    sortSelect.addEventListener("change", applyFilters);
  }
}

/* ==============================================================================
   6. URL Parameters (Genre links from Home page)
   ============================================================================== */
function handleUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const genreParam = urlParams.get("genre");
  const searchParam = urlParams.get("search");

  if (genreParam) {
    const matchingPill = document.querySelector(`.genre-pill[data-genre="${genreParam}"]`);
    if (matchingPill) {
      const allPills = document.querySelectorAll(".genre-pill");
      allPills.forEach((p) => p.classList.remove("active"));
      matchingPill.classList.add("active");
      matchingPill.click();
    }
  }

  if (searchParam) {
    const searchInput = document.getElementById("movieSearchInput");
    if (searchInput) {
      searchInput.value = searchParam;
      searchInput.dispatchEvent(new Event("input"));
    }
  }
}

/* ==============================================================================
   7. Video Trailer Modal (Play Trailer)
   ============================================================================== */
function initTrailerModal() {
  const modal = document.getElementById("trailerModal");
  if (!modal) return;

  const iframe = modal.querySelector("iframe");
  const closeBtn = modal.querySelector(".modal-close-btn");
  const trailerTriggers = document.querySelectorAll(".btn-watch-trailer");

  trailerTriggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const videoKey = btn.dataset.trailer || "interstellar";
      const videoSrc = TRAILER_URLS[videoKey] || TRAILER_URLS.default;

      if (iframe) {
        iframe.src = videoSrc;
      }
      modal.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent page scrolling
    });
  });

  function closeModal() {
    modal.classList.remove("active");
    if (iframe) {
      iframe.src = ""; // Stop video playback
    }
    document.body.style.overflow = "";
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close with Esc key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

/* ==============================================================================
   8. Toast Notification Utility
   ============================================================================== */
function showToast(message) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
