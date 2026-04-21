async function apiJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function ensureToastLayer() {
  let layer = document.querySelector(".toast-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "toast-layer";
    layer.setAttribute("aria-live", "polite");
    document.body.appendChild(layer);
  }
  return layer;
}

function toast(title, message, variant = "success", timeoutMs = 3800) {
  const layer = ensureToastLayer();
  const el = document.createElement("div");
  el.className = `toast ${variant}`;
  el.innerHTML = `
    <div>
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
    <button class="toast-close" type="button" aria-label="Close">X</button>
  `;
  layer.appendChild(el);

  const close = () => {
    el.classList.remove("show");
    window.setTimeout(() => el.remove(), 180);
  };

  el.querySelector(".toast-close")?.addEventListener("click", close);
  window.setTimeout(() => el.classList.add("show"), 10);
  window.setTimeout(close, timeoutMs);
}

function setStatusChip(chip, status) {
  if (!chip) return;
  chip.textContent = `Status: ${status}`;
  chip.className = `status-chip status-${status}`;
}

function setAvailableChip(chip, available) {
  if (!chip) return;
  chip.textContent = available ? "Available" : "Hidden";
  chip.className = `status-chip ${available ? "status-accepted" : "status-rejected"}`;
}

function setRoleChip(chip, role) {
  if (!chip) return;
  chip.textContent = `Role: ${role}`;
  chip.className = `status-chip ${role === "admin" ? "status-accepted" : "status-pending"}`;
}

function setDisabledChip(chip, disabled) {
  if (!chip) return;
  chip.textContent = disabled ? "Disabled" : "Active";
  chip.className = `status-chip ${disabled ? "status-rejected" : "status-accepted"}`;
}

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!target || !target.closest) return;

  const statusButton = target.closest("button[data-action='set-status']");
  if (statusButton) {
    const card = statusButton.closest("[data-collection-id]");
    const id = card?.dataset?.collectionId;
    const status = statusButton.dataset.status;
    if (!id || !status) return;

    statusButton.disabled = true;
    statusButton.setAttribute("aria-busy", "true");
    try {
      const result = await apiJson(`/api/admin/collections/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setStatusChip(card.querySelector("[data-status-chip='true']"), result.status);
      toast("Updated", `Request status is now "${result.status}".`, "success");
    } catch (error) {
      toast("Failed", error.message, "error");
    } finally {
      statusButton.disabled = false;
      statusButton.removeAttribute("aria-busy");
    }
    return;
  }

  const deleteButton = target.closest("button[data-action='delete-request']");
  if (deleteButton) {
    const card = deleteButton.closest("[data-collection-id]");
    const id = card?.dataset?.collectionId;
    if (!id) return;

    const ok = confirm("Delete this request? This cannot be undone.");
    if (!ok) return;

    deleteButton.disabled = true;
    deleteButton.setAttribute("aria-busy", "true");
    try {
      await apiJson(`/api/admin/collections/${id}`, { method: "DELETE" });
      card.remove();
      toast("Deleted", "Request removed.", "success");
    } catch (error) {
      toast("Failed", error.message, "error");
      deleteButton.disabled = false;
    }
    deleteButton.removeAttribute("aria-busy");
  }

  const exportButton = target.closest("button[data-export='collections']");
  if (exportButton) {
    exportButton.disabled = true;
    exportButton.setAttribute("aria-busy", "true");
    try {
      const response = await fetch("/api/admin/exports/collections.csv");
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ajo-collections-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("Export ready", "Downloaded collections CSV.", "success");
    } catch (error) {
      toast("Export failed", error.message, "error");
    } finally {
      exportButton.disabled = false;
      exportButton.removeAttribute("aria-busy");
    }
  }
});

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function applyFilters() {
  const collectionsQuery = normalizeText(document.querySelector("[data-admin-search='collections']")?.value);
  const collectionsStatus = normalizeText(document.querySelector("[data-admin-filter='collections']")?.value);

  document.querySelectorAll("[data-collection-id]").forEach((card) => {
    const text = normalizeText(card.textContent);
    const statusChip = card.querySelector("[data-status-chip='true']")?.textContent || "";
    const status = normalizeText(statusChip.replace("status:", ""));

    const matchesQuery = !collectionsQuery || text.includes(collectionsQuery);
    const matchesStatus = !collectionsStatus || status.includes(collectionsStatus);
    card.style.display = matchesQuery && matchesStatus ? "" : "none";
  });

  const itemsQuery = normalizeText(document.querySelector("[data-admin-search='items']")?.value);
  document.querySelectorAll("[data-item-id]").forEach((card) => {
    const text = normalizeText(card.textContent);
    card.style.display = !itemsQuery || text.includes(itemsQuery) ? "" : "none";
  });

  const usersQuery = normalizeText(document.querySelector("[data-admin-search='users']")?.value);
  const usersRole = normalizeText(document.querySelector("[data-admin-filter='users']")?.value);
  document.querySelectorAll("[data-user-id]").forEach((card) => {
    const text = normalizeText(card.textContent);
    const roleChip = normalizeText(card.querySelector("[data-role-chip='true']")?.textContent || "");
    const matchesQuery = !usersQuery || text.includes(usersQuery);
    const matchesRole = !usersRole || roleChip.includes(usersRole);
    card.style.display = matchesQuery && matchesRole ? "" : "none";
  });
}

document.addEventListener("input", (event) => {
  const target = event.target;
  if (!target || !target.matches) return;
  if (target.matches("[data-admin-search]")) applyFilters();
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!target || !target.matches) return;
  if (target.matches("[data-admin-filter]")) applyFilters();
});

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!form || !(form instanceof HTMLFormElement)) return;

  const scheduleForm = form.closest("form[data-action='schedule-form']");
  if (scheduleForm) {
    event.preventDefault();
    const card = form.closest("[data-collection-id]");
    const id = card?.dataset?.collectionId;
    if (!id) return;

    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    if (button) button.setAttribute("aria-busy", "true");

    try {
      const result = await apiJson(`/api/admin/collections/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ scheduledFor: form.scheduledFor.value || null })
      });
      setStatusChip(card.querySelector("[data-status-chip='true']"), result.status);
      toast("Saved", "Schedule updated.", "success");
    } catch (error) {
      toast("Failed", error.message, "error");
    } finally {
      if (button) button.disabled = false;
      if (button) button.removeAttribute("aria-busy");
    }
    return;
  }

  const itemForm = form.closest("form[data-action='item-form']");
  if (itemForm) {
    event.preventDefault();
    const card = form.closest("[data-item-id]");
    const id = card?.dataset?.itemId;
    if (!id) return;

    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    if (button) button.setAttribute("aria-busy", "true");

    try {
      const result = await apiJson(`/api/admin/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          price: Number(form.price.value || 0),
          available: Boolean(form.available.checked)
        })
      });
      setAvailableChip(card.querySelector("[data-available-chip='true']"), result.available);
      toast("Saved", "Item updated.", "success");
    } catch (error) {
      toast("Failed", error.message, "error");
    } finally {
      if (button) button.disabled = false;
      if (button) button.removeAttribute("aria-busy");
    }
    return;
  }

  const userForm = form.closest("form[data-action='user-form']");
  if (userForm) {
    event.preventDefault();
    const card = form.closest("[data-user-id]");
    const id = card?.dataset?.userId;
    if (!id) return;

    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    if (button) button.setAttribute("aria-busy", "true");

    try {
      const result = await apiJson(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          role: form.role.value,
          disabled: Boolean(form.disabled.checked)
        })
      });
      setRoleChip(card.querySelector("[data-role-chip='true']"), result.role);
      setDisabledChip(card.querySelector("[data-disabled-chip='true']"), result.disabled);
      toast("Saved", "User updated.", "success");
    } catch (error) {
      toast("Failed", error.message, "error");
    } finally {
      if (button) button.disabled = false;
      if (button) button.removeAttribute("aria-busy");
    }
  }
});

document.addEventListener("DOMContentLoaded", applyFilters);
