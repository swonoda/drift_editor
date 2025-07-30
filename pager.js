let currentPage = 0;

function showPage(index) {
  const pages = document.querySelectorAll("#viewer article");
  pages.forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });
}

document.getElementById("prev").addEventListener("click", () => {
  const pages = document.querySelectorAll("#viewer article");
  if (currentPage > 0) {
    currentPage--;
    showPage(currentPage);
  }
});

document.getElementById("next").addEventListener("click", () => {
  const pages = document.querySelectorAll("#viewer article");
  if (currentPage < pages.length - 1) {
    currentPage++;
    showPage(currentPage);
  }
});

// 外部から呼ばれる：テキストをページに分割して表示
function displayPages(text, linesPerPage = 20) {
  const lines = text.split(/\r?\n/);
  const viewer = document.getElementById("viewer");
  viewer.innerHTML = "";

  for (let i = 0; i < lines.length; i += linesPerPage) {
    const slice = lines.slice(i, i + linesPerPage);
    const page = document.createElement("article");
    slice.forEach(line => {
      const p = document.createElement("p");
      p.textContent = line;
      page.appendChild(p);
    });
    viewer.appendChild(page);
  }

  currentPage = 0;
  showPage(currentPage);
}

window.displayPages = displayPages;