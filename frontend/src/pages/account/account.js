/* ==========================================================================
   MI CUENTA - PUNTOS ACUMULADOS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const totalUserPoints = document.querySelector("#totalUserPoints");
  const userForumPointsList = document.querySelector("#userForumPointsList");

  const USER_STORAGE_KEY = "mel_logged_user";
  const MEMBERSHIPS_STORAGE_KEY = "mel_forum_memberships";

  function getLoggedUser() {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error leyendo usuario desde localStorage:", error);
      return null;
    }
  }

  function getAllMemberships() {
    const storedMemberships = localStorage.getItem(MEMBERSHIPS_STORAGE_KEY);

    if (!storedMemberships) return {};

    try {
      return JSON.parse(storedMemberships);
    } catch (error) {
      console.error("Error leyendo membresías desde localStorage:", error);
      return {};
    }
  }

  function formatNumber(number) {
    return Number(number || 0).toLocaleString("es-MX");
  }

  function formatDate(dateString) {
    if (!dateString) return "fecha no disponible";

    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  async function getForumsData() {
    try {
      const response = await fetch("/data/forums.json");

      if (!response.ok) {
        throw new Error(`Error al cargar forums.json: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error cargando foros:", error);
      return [];
    }
  }

  function findForumById(forums, forumId) {
    return forums.find((forum) => forum.id === forumId);
  }

  function renderEmptyState(message) {
    if (totalUserPoints) {
      totalUserPoints.textContent = "0";
    }

    if (userForumPointsList) {
      userForumPointsList.innerHTML = `
        <p class="empty-points-message">
          ${message}
        </p>
      `;
    }
  }

  function sortMembershipsByPoints(memberships) {
    return memberships.sort((a, b) => {
      return Number(b.points || 0) - Number(a.points || 0);
    });
  }

  async function renderUserPoints() {
    const loggedUser = getLoggedUser();

    if (!loggedUser) {
      renderEmptyState(
        "Inicia sesión para consultar tus puntos acumulados y tus foros activos."
      );
      return;
    }

    const memberships = getAllMemberships();
    const userMemberships = memberships[loggedUser.id] || {};
    const userForumMemberships = Object.values(userMemberships);

    if (userForumMemberships.length === 0) {
      renderEmptyState(
        "Aún no tienes puntos acumulados. Suscríbete a un foro, crea una publicación o responde para comenzar a ganar puntos."
      );
      return;
    }

    const forums = await getForumsData();

    const sortedMemberships = sortMembershipsByPoints(userForumMemberships);

    const totalPoints = sortedMemberships.reduce((total, membership) => {
      return total + Number(membership.points || 0);
    }, 0);

    if (totalUserPoints) {
      totalUserPoints.textContent = formatNumber(totalPoints);
    }

    if (!userForumPointsList) return;

    userForumPointsList.innerHTML = sortedMemberships
      .map((membership) => {
        const forum = findForumById(forums, membership.forumId);

        const forumName = forum?.nombre || "Foro desconocido";
        const forumIcon = forum?.icono || "📚";
        const joinedAt = formatDate(membership.joinedAt);
        const points = Number(membership.points || 0);

        return `
          <article class="forum-points-item">
            <div class="forum-points-icon">
              ${forumIcon}
            </div>

            <div class="forum-points-info">
              <h4>${forumName}</h4>
              <p>Te uniste el ${joinedAt}</p>
            </div>

            <div class="forum-points-value">
              ${formatNumber(points)}
              <small>puntos</small>
            </div>
          </article>
        `;
      })
      .join("");
  }

  renderUserPoints();
});