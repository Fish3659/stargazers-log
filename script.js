const repositoryList = document.querySelector("#repository-list");
const listStatus = document.querySelector("#list-status");

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function createRepositoryCard(event) {
  const repository = event.repository;
  const item = document.createElement("li");
  item.className = "repository-card";

  const link = document.createElement("a");
  link.className = "repository-name";
  link.href = repository.html_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = repository.full_name;
  item.append(link);

  const description = document.createElement("p");
  description.className = "repository-description";
  description.textContent = repository.description || "No description provided.";
  item.append(description);

  const metadata = document.createElement("p");
  metadata.className = "repository-meta";
  metadata.textContent = [
    repository.language || "Language not specified",
    `${Number(repository.stargazers_count).toLocaleString()} stars`,
    `Starred ${formatDate(event.created_at)}`,
  ].join(" · ");
  item.append(metadata);

  return item;
}

async function loadRepositories() {
  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Could not load repository data (${response.status}).`);
    }

    const events = await response.json();
    if (!Array.isArray(events)) {
      throw new Error("Repository data must be a list.");
    }

    const starredEvents = events.filter(
      (event) => event?.type === "starred" && event.repository?.full_name && event.repository?.html_url,
    );

    if (starredEvents.length === 0) {
      listStatus.textContent = "No starred repositories to show yet.";
      return;
    }

    const cards = starredEvents.map(createRepositoryCard);
    repositoryList.replaceChildren(...cards);
    listStatus.textContent = `${cards.length} starred ${cards.length === 1 ? "repository" : "repositories"}.`;
  } catch (error) {
    console.error("Unable to load starred repositories:", error);
    listStatus.textContent = "Repositories couldn't be loaded. Please try again later.";
  }
}

loadRepositories();
