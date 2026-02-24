async function loadGitHubProjects() {
  try {
    const response = await fetch(
      "https://api.github.com/users/AKADortys/repos?sort=updated",
    );
    const repos = await response.json();

    // Filtrer les projets pour n'afficher que ceux qui ne sont pas des forks
    const myProjects = repos.filter((repo) => !repo.fork);

    let htmlContent = '<div class="row">';

    myProjects.forEach((repo) => {
      // Construction de la carte pour chaque projet
      htmlContent += `
        <div class="col-12 col-md-6 col-xxl-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${repo.name}</h5>
              <p class="card-text">${repo.description || "Aucune description"}</p>
              <span class="badge bg-primary">${repo.language || "N/A"}</span>
            </div>
            <div class="card-footer bg-transparent border-top-0">
              <a href="${repo.html_url}" target="_blank" class="btn btn-outline-dark btn-sm">Code Source</a>
              ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="btn btn-success btn-sm">Voir le site</a>` : ""}
            </div>
          </div>
        </div>
      `;
    });

    htmlContent += "</div>";

    // Injecter dans le conteneur de la page de projets
    document.querySelector("main").innerHTML = htmlContent;
  } catch (error) {
    console.error("Erreur lors de la récupération des projets", error);
  }
}

loadGitHubProjects();
