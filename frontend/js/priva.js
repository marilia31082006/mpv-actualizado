// Menu Mobile
const btn_menu = document.querySelector(".btn_menu");
const icon_menu = btn_menu.querySelector("i");
const mobileMenu = document.getElementById("mobileMenu");
const overlay = document.getElementById("overlay");

btn_menu.addEventListener("click", (event) => {
  event.preventDefault();
  mobileMenu.classList.toggle("menu-open");
  overlay.classList.toggle("active");

  if (icon_menu.classList.contains("fa-bars")) {
    icon_menu.classList.remove("fa-bars");
    icon_menu.classList.add("fa-xmark");
  } else {
    icon_menu.classList.remove("fa-xmark");
    icon_menu.classList.add("fa-bars");
  }
});

overlay.addEventListener("click", () => {
  mobileMenu.classList.remove("menu-open");
  overlay.classList.remove("active");
  icon_menu.classList.remove("fa-xmark");
  icon_menu.classList.add("fa-bars");
});

// Scroll Header Effect
window.addEventListener("scroll", function () {
  const header = document.getElementById("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Dark Mode Toggle
const modo = document.querySelector(".modo");
const mobileModo = document.querySelector(".mobile-modo");
const body = document.body;

// Check for saved theme preference
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
  updateModeIcons(true);
}

function toggleDarkMode() {
  body.classList.toggle("dark-mode");
  const isDark = body.classList.contains("dark-mode");
  updateModeIcons(isDark);

  if (isDark) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

function updateModeIcons(isDark) {
  const icons = document.querySelectorAll(".modo i, .mobile-modo i");
  icons.forEach((icon) => {
    if (isDark) {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    } else {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }
  });

  // Update mobile mode button text
  if (mobileModo) {
    mobileModo.querySelector("span").textContent = isDark
      ? " Modo Escuro"
      : " Modo Claro";
  }
}

modo.addEventListener("click", toggleDarkMode);
if (mobileModo) {
  mobileModo.addEventListener("click", toggleDarkMode);
}

// Current Year in Footer
const anoSpan = document.querySelector(".ano");
const anoAtual = new Date().getFullYear();
anoSpan.textContent = anoAtual;



function volta(){
  location.href="../frontend/index.html"

}