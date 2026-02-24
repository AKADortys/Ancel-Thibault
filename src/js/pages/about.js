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
      // Dans ta boucle myProjects.forEach((repo) => { ... })
      htmlContent += `
  <div class="col-12 col-md-6 col-xxl-4 mb-3">
    <div class="card h-100 repo-card" 
         style="cursor: pointer" 
         data-repo-name="${repo.name}" 
         data-repo-owner="${repo.owner.login}">
      <div class="card-body">
        <h5 class="card-title">${repo.name}</h5>
        <p class="card-text">${repo.description || "Aucune description"}</p>
        <div id="chart-${repo.id}" class="mt-3"></div> </div>
      <div class="card-footer bg-transparent border-top-0">
        <span class="badge bg-primary">${repo.language || "N/A"}</span>
      </div>
    </div>
  </div>
`;
    });

    htmlContent += "</div>";

    // Injecter dans le conteneur de la page de projets
    document.querySelector("main").innerHTML = htmlContent;
    // Ajouter un événement de clic à chaque carte de projet pour charger le graphique des langages
    document.querySelectorAll(".repo-card").forEach((card) => {
      card.addEventListener("click", async function () {
        const repoName = this.dataset.repoName;
        const owner = this.dataset.repoOwner;
        const chartContainer = this.querySelector('[id^="chart-"]');

        // Éviter de recharger si le graphique existe déjà
        if (chartContainer.innerHTML !== "") return;

        try {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/languages`,
          );
          const langData = await response.json();

          const options = {
            chart: { type: "donut", height: 150 },
            series: Object.values(langData),
            labels: Object.keys(langData),
            legend: { position: "bottom" },
            dataLabels: { enabled: false },
          };

          const chart = new ApexCharts(chartContainer, options);
          chart.render();
        } catch (error) {
          console.error("Erreur lors du chargement des langages", error);
        }
      });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des projets", error);
  }
}

loadGitHubProjects();
