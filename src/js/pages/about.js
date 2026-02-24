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
      htmlContent += `
  <div class="col-12 col-md-6 col-xxl-4 mb-3">
    <div class="card h-100 repo-card" style="cursor: pointer" data-repo-name="${repo.name}" data-repo-owner="${repo.owner.login}">
      <div class="card-body">
        <h5 class="card-title">${repo.name}</h5>
        <p class="card-text small">${repo.description || "Aucune description"}</p>
        
        <div id="chart-${repo.id}" class="mt-3"></div>
        
        <div class="mt-3">
          <small class="text-muted d-block mb-1">Activité (52 sem.)</small>
          <div id="sparkline-${repo.id}"></div>
        </div>
      </div>
      <div class="card-footer bg-transparent border-top-0">
        <span class="badge bg-primary">${repo.language || "N/A"}</span>
      </div>
    </div>
  </div>
`;
    });

    htmlContent += "</div>";

    // Injecter dans le conteneur de la page de projets
    document.querySelector("#project").innerHTML = htmlContent;

    myProjects.forEach(async (repo) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/stats/participation`,
        );
        const data = await res.json();

        // Le tableau data.all contient les 52 semaines d'activité
        const optionsSparkline = {
          series: [{ data: data.all }],
          chart: {
            type: "area", // 'area' donne un bel effet rempli comme sur GitHub
            height: 30,
            sparkline: { enabled: true }, // Désactive les axes et les grilles
          },
          stroke: { curve: "smooth", width: 2 },
          fill: {
            opacity: 0.3,
            colors: ["#28a745"], // Couleur verte "GitHub"
          },
          colors: ["#28a745"],
          tooltip: { enabled: false }, // Reste discret
        };

        const sparkline = new ApexCharts(
          document.querySelector(`#sparkline-${repo.id}`),
          optionsSparkline,
        );
        sparkline.render();
      } catch (err) {
        console.error("Erreur Sparkline:", err);
      }
    });
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
