
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("compact");
    } else {
        header.classList.remove("compact");
    }
});
