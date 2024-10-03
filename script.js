document.addEventListener("DOMContentLoaded", () => {
  const problemSelect = document.getElementById("problem-select");
  const problemDisplay = document.getElementById("problem-display");
  const codeDisplay = document.getElementById("code-display");
  const themeToggle = document.getElementById("theme-toggle");
  const copyButtons = document.querySelectorAll(".copy-btn");
  const loadingIndicator = document.getElementById("loading");

  const owner = "Tech13-08";
  const repo = "dsa_repo";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  // Theme toggle functionality
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });

  // Fetch repository contents
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

  // Fetch file content
  async function fetchFileContent(path) {
    try {
      const response = await fetch(`${apiUrl}/${path}`);
      if (!response.ok) throw new Error("Failed to fetch file content");
      const data = await response.json();
      return atob(data.content); // Decode base64 content
    } catch (error) {
      console.error("Error fetching file content:", error);
      return "";
    }
  }

  // Populate problem select
  async function populateSelect() {
    loadingIndicator.style.display = "block";
    const files = await fetchRepoContents();
    loadingIndicator.style.display = "none";

    files.forEach((file) => {
      if (file.type === "file") {
        const option = document.createElement("option");
        option.value = file.path;
        option.textContent = file.name;
        problemSelect.appendChild(option);
      }
    });
  }

  // Event listener for problem selection
  problemSelect.addEventListener("change", async () => {
    if (problemSelect.value) {
      loadingIndicator.style.display = "block";
      const content = await fetchFileContent(problemSelect.value);
      loadingIndicator.style.display = "none";

      // Assuming the file content is formatted with "Problem:" and "Solution:" markers
      const [problem, solution] = content.split(/\n.*CODE.*\n/);
      problemDisplay.textContent = problem.trim();
      codeDisplay.textContent = solution.trim();
    } else {
      problemDisplay.textContent = "";
      codeDisplay.textContent = "";
    }
  });

  // Copy button functionality
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

  // Initialize the select options
  populateSelect();
});
