import { api, getSession, clearSession } from "./api.js";

const session = getSession();
if (!session) {
  window.location.href = "./index.html";
}

const userBox = document.querySelector("#user-box");
const navLinks = document.querySelector("#nav-links");
const logoutBtn = document.querySelector("#logout-btn");
const sectionTitle = document.querySelector("#section-title");
const filterGroup = document.querySelector("#filter-group");

const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const typeFilter = document.querySelector("#type-filter");
const clearFilters = document.querySelector("#clear-filters");

const offersGrid = document.querySelector("#offers-grid");
const appliedGrid = document.querySelector("#applied-grid");
const adminOffersGrid = document.querySelector("#admin-offers-grid");

const offerForm = document.querySelector("#offer-form");
const offerFormTitle = document.querySelector("#offer-form-title");
const offerFormAlert = document.querySelector("#offer-form-alert");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");

const applicationsTableBody = document.querySelector(
  "#applications-table tbody"
);

const sections = Array.from(document.querySelectorAll(".section"));

let offers = [];
let applications = [];
let users = [];
let editingOfferId = null;

const navConfig = session.role === "admin"
  ? [
      { id: "section-admin-offers", label: "Ofertas" },
      { id: "section-admin-form", label: "Crear / Editar" },
      { id: "section-admin-applications", label: "Postulaciones" },
    ]
  : [
      { id: "section-all-offers", label: "Todas las ofertas" },
      { id: "section-applied", label: "Aplicadas" },
    ];

const showAlert = (container, message, type = "success") => {
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    container.innerHTML = "";
  }, 2500);
};

const setActiveSection = (id) => {
  sections.forEach((section) => section.classList.remove("active"));
  const active = document.querySelector(`#${id}`);
  if (active) active.classList.add("active");

  const item = navLinks.querySelector(`[data-target="${id}"]`);
  navLinks.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
  if (item) item.classList.add("active");

  const titleMap = {
    "section-all-offers": "Ofertas laborales",
    "section-applied": "Mis aplicaciones",
    "section-admin-offers": "Ofertas publicadas",
    "section-admin-form": "Gestionar oferta",
    "section-admin-applications": "Postulaciones recibidas",
  };
  sectionTitle.textContent = titleMap[id] || "Panel";

  const showFilters = ["section-all-offers", "section-admin-offers"].includes(id);
  filterGroup.style.display = showFilters ? "flex" : "none";
};

const applyFilters = (list) => {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const type = typeFilter.value;

  return list.filter((offer) => {
    const matchesTerm =
      !term ||
      offer.title.toLowerCase().includes(term) ||
      offer.company.toLowerCase().includes(term);
    const matchesCategory = !category || offer.category === category;
    const matchesType = !type || offer.type === type;
    return matchesTerm && matchesCategory && matchesType;
  });
};

const renderOffers = () => {
  const filtered = applyFilters(offers);

  if (offersGrid) {
    offersGrid.innerHTML = filtered.length
      ? filtered
          .map((offer) => {
            const applied = applications.some(
              (app) => app.userId === session.id && app.offerId === offer.id
            );

            return `
            <article class="card">
              <span class="badge">${offer.category}</span>
              <h4>${offer.title}</h4>
              <p>${offer.company} · ${offer.location}</p>
              <div class="meta">
                <span class="tag">${offer.type}</span>
                <span class="tag">${offer.salary}</span>
              </div>
              <p>${offer.description}</p>
              <div class="actions">
                <button class="btn ${applied ? "btn-ghost" : "btn-accent"}" data-apply="${offer.id}" ${
              applied ? "disabled" : ""
            }>
                  ${applied ? "Aplicado" : "Aplicar"}
                </button>
              </div>
            </article>`;
          })
          .join("")
      : `<div class="empty">No hay ofertas con esos filtros.</div>`;
  }

  if (adminOffersGrid) {
    adminOffersGrid.innerHTML = filtered.length
      ? filtered
          .map(
            (offer) => `
          <article class="card">
            <span class="badge">${offer.category}</span>
            <h4>${offer.title}</h4>
            <p>${offer.company} · ${offer.location}</p>
            <div class="meta">
              <span class="tag">${offer.type}</span>
              <span class="tag">${offer.salary}</span>
            </div>
            <p>${offer.description}</p>
            <div class="actions">
              <button class="btn btn-ghost" data-edit="${offer.id}">Editar</button>
              <button class="btn btn-danger" data-delete="${offer.id}">Eliminar</button>
            </div>
          </article>`
          )
          .join("")
      : `<div class="empty">No hay ofertas publicadas.</div>`;
  }
};

const renderApplied = () => {
  if (!appliedGrid) return;

  const appliedOffers = applications
    .filter((app) => app.userId === session.id)
    .map((app) => ({
      ...app,
      offer: offers.find((offer) => offer.id === app.offerId),
    }))
    .filter((app) => app.offer);

  appliedGrid.innerHTML = appliedOffers.length
    ? appliedOffers
        .map(
          (app) => `
      <article class="card">
        <span class="badge">${app.offer.category}</span>
        <h4>${app.offer.title}</h4>
        <p>${app.offer.company} · ${app.offer.location}</p>
        <div class="meta">
          <span class="tag">${app.offer.type}</span>
          <span class="tag">${app.offer.salary}</span>
        </div>
        <p>${app.offer.description}</p>
        <small>Postulado el ${app.date}</small>
      </article>`
        )
        .join("")
    : `<div class="empty">Aún no has aplicado a ofertas.</div>`;
};

const renderApplicationsAdmin = () => {
  if (!applicationsTableBody) return;

  applicationsTableBody.innerHTML = applications.length
    ? applications
        .map((app) => {
          const user = users.find((u) => u.id === app.userId);
          const offer = offers.find((o) => o.id === app.offerId);
          if (!user || !offer) return "";
          return `
          <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${offer.title}</td>
            <td>${offer.company}</td>
            <td>${app.date}</td>
          </tr>`;
        })
        .join("")
    : `
      <tr>
        <td colspan="5">No hay postulaciones registradas.</td>
      </tr>`;
};

const loadData = async () => {
  [offers, applications, users] = await Promise.all([
    api.get("/offers"),
    api.get("/applications"),
    api.get("/users"),
  ]);
  renderOffers();
  renderApplied();
  renderApplicationsAdmin();
};

const setUserBox = () => {
  userBox.innerHTML = `
    <strong>${session.name}</strong>
    <span>${session.email}</span>
    <small>${session.role === "admin" ? "Administrador" : "Usuario"}</small>
  `;
};

const setupNav = () => {
  navLinks.innerHTML = navConfig
    .map(
      (item, index) =>
        `<button data-target="${item.id}" class="${index === 0 ? "active" : ""}">${item.label}</button>`
    )
    .join("");

  navLinks.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    setActiveSection(target.dataset.target);
  });

  setActiveSection(navConfig[0].id);
};

const handleApply = async (offerId) => {
  const already = applications.some(
    (app) => app.userId === session.id && app.offerId === offerId
  );
  if (already) return;

  await api.post("/applications", {
    userId: session.id,
    offerId,
    date: new Date().toLocaleDateString("es-ES"),
  });

  applications = await api.get("/applications");
  renderOffers();
  renderApplied();
};

const handleDeleteOffer = async (offerId) => {
  const confirmDelete = window.confirm("¿Eliminar esta oferta?");
  if (!confirmDelete) return;

  await api.del(`/offers/${offerId}`);

  const related = applications.filter((app) => app.offerId === offerId);
  await Promise.all(related.map((app) => api.del(`/applications/${app.id}`)));

  await loadData();
};

const startEditOffer = (offerId) => {
  const offer = offers.find((item) => item.id === offerId);
  if (!offer) return;
  editingOfferId = offerId;
  offerFormTitle.textContent = "Editar oferta";
  offerForm.querySelector("#title").value = offer.title;
  offerForm.querySelector("#company").value = offer.company;
  offerForm.querySelector("#location").value = offer.location;
  offerForm.querySelector("#category").value = offer.category;
  offerForm.querySelector("#type").value = offer.type;
  offerForm.querySelector("#salary").value = offer.salary;
  offerForm.querySelector("#description").value = offer.description;
  setActiveSection("section-admin-form");
};

const resetOfferForm = () => {
  editingOfferId = null;
  offerFormTitle.textContent = "Crear oferta";
  offerForm.reset();
};

if (offersGrid) {
  offersGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-apply]");
    if (!btn) return;
    handleApply(Number(btn.dataset.apply));
  });
}

if (adminOffersGrid) {
  adminOffersGrid.addEventListener("click", (event) => {
    const editBtn = event.target.closest("button[data-edit]");
    const deleteBtn = event.target.closest("button[data-delete]");
    if (editBtn) startEditOffer(Number(editBtn.dataset.edit));
    if (deleteBtn) handleDeleteOffer(Number(deleteBtn.dataset.delete));
  });
}

if (offerForm) {
  offerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    offerFormAlert.innerHTML = "";

    const payload = {
      title: offerForm.querySelector("#title").value.trim(),
      company: offerForm.querySelector("#company").value.trim(),
      location: offerForm.querySelector("#location").value.trim(),
      category: offerForm.querySelector("#category").value.trim(),
      type: offerForm.querySelector("#type").value.trim(),
      salary: offerForm.querySelector("#salary").value.trim(),
      description: offerForm.querySelector("#description").value.trim(),
    };

    if (Object.values(payload).some((value) => !value)) {
      showAlert(offerFormAlert, "Completa todos los campos.", "error");
      return;
    }

    if (editingOfferId) {
      await api.put(`/offers/${editingOfferId}`, { id: editingOfferId, ...payload });
      showAlert(offerFormAlert, "Oferta actualizada.");
    } else {
      await api.post("/offers", payload);
      showAlert(offerFormAlert, "Oferta creada.");
    }

    resetOfferForm();
    await loadData();
  });
}

cancelEditBtn?.addEventListener("click", () => resetOfferForm());

logoutBtn?.addEventListener("click", () => {
  clearSession();
  window.location.href = "./index.html";
});

[searchInput, categoryFilter, typeFilter].forEach((input) => {
  input?.addEventListener("input", () => {
    renderOffers();
  });
});

clearFilters?.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  typeFilter.value = "";
  renderOffers();
});

setUserBox();
setupNav();
loadData();
