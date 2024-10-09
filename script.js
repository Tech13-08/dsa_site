document.addEventListener("DOMContentLoaded", () => {
  const problemSelect = document.getElementById("problem-select");
  const problemDisplay = document.getElementById("problem-display");
  const codeDisplay = document.getElementById("code-display");
  const themeToggle = document.getElementById("theme-toggle");
  const copyButtons = document.querySelectorAll(".copy-btn");

  // Set DSA Git Repo
  const owner = "Tech13-08";
  const repo = "dsa_repo";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });

  async function fetchRepoContents() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch repository contents");
      return await response.json();
    } catch (error) {
      console.error("Error fetching repo contents:", error);
      return [];
    }
  }

  async function fetchFileContent(path) {
    try {
      const response = await fetch(`${apiUrl}/${path}`);
      if (!response.ok) throw new Error("Failed to fetch file content");
      const data = await response.json();
      return atob(data.content);
    } catch (error) {
      console.error("Error fetching file content:", error);
      return "";
    }
  }

  async function populateSelect() {
    problemDisplay.textContent = "Loading...";
    codeDisplay.textContent = "Loading...";
    const files = await fetchRepoContents();
    problemDisplay.textContent = "";
    codeDisplay.textContent = "";
    files.forEach((file) => {
      if (file.type === "file") {
        const option = document.createElement("option");
        option.value = file.path;
        option.textContent = file.name;
        problemSelect.appendChild(option);
      }
    });
  }

  async function parseUrl() {
    let paramString = window.location.href.split("?")[1];
    let queryString = new URLSearchParams(paramString);
    for (let pair of queryString.entries()) {
      if (pair[0] == "file") {
        updateContent(pair[1]);
      }
    }
  }

  async function updateContent(value) {
    if (value) {
      problemDisplay.textContent = "Loading...";
      codeDisplay.textContent = "Loading...";
      const content = await fetchFileContent(value);
      problemSelect.value = value;
      const [problem, solution] = content.split(/\n.*CODE.*\n/);
      problemDisplay.textContent = problem.trim();
      codeDisplay.textContent = solution.trim();
    } else {
      problemDisplay.textContent = "";
      codeDisplay.textContent = "";
    }
  }

  problemSelect.addEventListener("change", async () => {
    updateContent(problemSelect.value);
    window.history.pushState(
      problemSelect.value,
      "DSA Problem Viewer",
      window.location.href.split("?")[0] + "?file=" + problemSelect.value
    );
  });

  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const targetElement = document.getElementById(targetId);

      navigator.clipboard
        .writeText(targetElement.textContent)
        .then(() => {
          const originalText = button.textContent;
          button.textContent = "Copied!";
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    });
  });

  populateSelect();
  parseUrl();
});
