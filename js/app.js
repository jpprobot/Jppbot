import { PHOTO_CONFIG } from "../photo-config.js";

const root = document.documentElement;
const preference = matchMedia("(prefers-reduced-motion: reduce)");
const motionButton = document.querySelector(".motion-toggle");

function setPaused(paused) {
  root.classList.toggle("paused", paused);
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.setAttribute(
    "aria-label",
    paused ? "Reprendre les animations" : "Mettre les animations en pause",
  );
  motionButton.querySelector(".motion-text").textContent = paused
    ? "Animations en pause"
    : "Pause des animations";
  document.dispatchEvent(
    new CustomEvent("jsp:motion-change", { detail: { paused } }),
  );
}
setPaused(preference.matches);
motionButton.addEventListener("click", () =>
  setPaused(!root.classList.contains("paused")),
);
preference.addEventListener("change", (event) => setPaused(event.matches));

const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  navigation.classList.remove("open");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("open", open);
});
navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!navigation.contains(event.target) && !menu.contains(event.target))
    closeMenu();
});
matchMedia("(min-width: 521px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("is-waiting");
    revealObserver.observe(element);
  });
}

const progress = document.querySelector(".progress");
let progressPending = false;
function updateProgress() {
  const height = root.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0})`;
  progressPending = false;
}
addEventListener(
  "scroll",
  () => {
    if (progressPending) return;
    progressPending = true;
    requestAnimationFrame(updateProgress);
  },
  { passive: true },
);
addEventListener("resize", updateProgress);
updateProgress();

const photos = [...document.querySelectorAll("img[data-photo]")];
photos.forEach((img) => {
  const path = PHOTO_CONFIG[img.dataset.photo];
  if (!path) return;
  const candidate = new Image();
  candidate.onload = () => {
    img.src = candidate.src;
    img.alt = img.dataset.customAlt;
    img.dataset.custom = "true";
    img.closest("figure").querySelector(".illustration-label").hidden = true;
    document.querySelector(".image-disclosure").hidden = photos.every(
      (photo) => photo.dataset.custom === "true",
    );
  };
  // Keep the labelled demo image if the custom file is missing or invalid.
  candidate.onerror = () => console.warn(`Photo indisponible : ${path}`);
  candidate.src = new URL(path, document.baseURI).href;
});

const viewer = document.querySelector("#robot-viewer");
function showFallback(message) {
  viewer.setAttribute("aria-busy", "false");
  viewer.classList.remove("is-ready");
  document.querySelector("#scene-message").textContent = message;
  document.querySelector("#scene-controls").hidden = true;
}
// Keep navigation, images and motion controls independent from the 3D module.
import("../assets/robot-scene.js")
  .then(({ mountRobot }) => mountRobot(viewer, showFallback))
  .catch((error) => {
    showFallback(
      "Aperçu du concept · La 3D est indisponible sur ce navigateur.",
    );
    console.warn("La scène 3D n’a pas pu démarrer.", error);
  });
