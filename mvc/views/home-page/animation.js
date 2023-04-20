const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry);
    if (entry.isIntersecting) {
      if (entry.target.id === "shirt-1") {
        entry.target.classList.add("show-1");
      }
      if (entry.target.id === "shirt-2") {
        entry.target.classList.add("show-2");
      }
      if (entry.target.id === "shirt-3") {
        entry.target.classList.add("show-3");
      }
      if (entry.target.id === "shirt-text") {
        entry.target.classList.add("show-shirt-text");
      }
    } else {
      if (entry.target.id === "shirt-1") {
        entry.target.classList.remove("show-1");
      }
      if (entry.target.id === "shirt-2") {
        entry.target.classList.remove("show-2");
      }
      if (entry.target.id === "shirt-3") {
        entry.target.classList.remove("show-3");
      }
      if (entry.target.id === "shirt-text") {
        entry.target.classList.remove("show-shirt-text");
      }
    }
  });
});

const hiddenElements = document.querySelectorAll(".hidden-hide");
hiddenElements.forEach((el) => observer.observe(el));

//scroll button

const scrollBtn = document.getElementById("scrollBtn");

scrollBtn.addEventListener("click", function () {
  window.scrollTo({
    top: 1000,
    behavior: "smooth",
  });
});
