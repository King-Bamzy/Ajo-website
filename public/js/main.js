const plans = window.__AJO_PLANS__ || [];

const inlineForm = document.getElementById("collection-form");
const inlineStatus = document.getElementById("collection-status");

const modal = document.getElementById("apply-modal");
const modalForm = document.getElementById("apply-form");
const modalStatus = document.getElementById("apply-status");

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

function suggestContribution(planName) {
  const plan = plans.find((item) => item.name === planName);
  return plan ? plan.contribution : "";
}

function refreshContribution(form) {
  if (!form) return;
  const planSelect = form.elements?.plan;
  const contributionInput = form.elements?.contribution;
  if (!planSelect || !contributionInput) return;
  const suggestion = suggestContribution(planSelect.value);
  contributionInput.value = contributionInput.value || suggestion;
}

function setSelectedPlan(form, planName) {
  if (!form || !planName) return;
  const planSelect = form.elements?.plan;
  if (!planSelect) return;
  const exists = Array.from(planSelect.options).some((opt) => opt.value === planName);
  if (!exists) return;
  planSelect.value = planName;
  refreshContribution(form);
}

function setModalOpen(open) {
  if (!modal) return;
  modal.classList.toggle("open", open);
  modal.setAttribute("aria-hidden", open ? "false" : "true");
  document.body.classList.toggle("modal-open", open);
}

function trapFocus(container) {
  if (!container) return () => {};
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const focusable = () => Array.from(container.querySelectorAll(selector)).filter((el) => el.offsetParent !== null);
  const first = () => focusable()[0];
  const last = () => {
    const list = focusable();
    return list[list.length - 1];
  };

  const onKeyDown = (event) => {
    if (event.key !== "Tab") return;
    const firstEl = first();
    const lastEl = last();
    if (!firstEl || !lastEl) return;

    if (event.shiftKey && document.activeElement === firstEl) {
      event.preventDefault();
      lastEl.focus();
    } else if (!event.shiftKey && document.activeElement === lastEl) {
      event.preventDefault();
      firstEl.focus();
    }
  };

  container.addEventListener("keydown", onKeyDown);
  return () => container.removeEventListener("keydown", onKeyDown);
}

let releaseModalFocus = () => {};
let lastActiveEl = null;

function openApplyModal(planName) {
  if (!modalForm) return;
  if (modalStatus) modalStatus.textContent = "";
  setSelectedPlan(modalForm, planName);
  refreshContribution(modalForm);
  lastActiveEl = document.activeElement;
  setModalOpen(true);
  releaseModalFocus();
  releaseModalFocus = trapFocus(modalForm.closest(".modal-panel"));
  modal.querySelector(".modal-panel")?.focus();
  const nameInput = modalForm.querySelector("input[name='memberName']");
  if (nameInput) nameInput.focus();
}

function closeApplyModal() {
  setModalOpen(false);
  releaseModalFocus();
  releaseModalFocus = () => {};
  if (lastActiveEl && lastActiveEl.focus) lastActiveEl.focus();
}

document.querySelectorAll("[data-open-apply='true']").forEach((el) => {
  el.addEventListener("click", (event) => {
    event.preventDefault();
    const planName = el.dataset.plan || el.closest("[data-plan]")?.dataset?.plan;
    openApplyModal(planName);
  });
});

document.querySelectorAll(".plan-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.closest && target.closest("[data-open-apply='true']")) return;
    openApplyModal(card.dataset.plan);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openApplyModal(card.dataset.plan);
    }
  });
});

modal?.addEventListener("click", (event) => {
  const target = event.target;
  if (!target) return;
  if (target.closest && target.closest("[data-close='true']")) {
    closeApplyModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("open")) {
    closeApplyModal();
  }
});

function bindForm(form, statusEl) {
  if (!form) return;

  const planSelect = form.elements?.plan;
  if (planSelect) {
    planSelect.addEventListener("change", () => refreshContribution(form));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      memberName: form.memberName.value,
      phone: form.phone.value,
      memberEmail: form.memberEmail?.value || "",
      plan: form.plan.value,
      contribution: Number(form.contribution.value) || 0,
      scheduledFor: form.scheduledFor.value || null,
      notes: form.notes.value
    };

    if (statusEl) {
      statusEl.classList.remove("success");
      statusEl.textContent = "Sending your application...";
    }

    const primaryButton = form.querySelector("button[type='submit']");
    if (primaryButton) primaryButton.setAttribute("aria-busy", "true");

    form.querySelectorAll("button, input, select, textarea").forEach((el) => (el.disabled = true));

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit application");
      }

      if (statusEl) {
        statusEl.classList.add("success");
        statusEl.textContent = `Application recorded for ${data.memberName || payload.memberName} (${data.plan || payload.plan}).`;
      }

      toast("Application sent", "Admin will review and confirm your schedule via WhatsApp.", "success");

      if (form === modalForm) {
        window.setTimeout(() => closeApplyModal(), 650);
      }

      form.reset();
      refreshContribution(form);
    } catch (error) {
      if (statusEl) {
        statusEl.classList.remove("success");
        statusEl.textContent = error.message || "Failed to submit the form.";
      }
      toast("Something went wrong", error.message || "Failed to submit.", "error");
    } finally {
      form.querySelectorAll("button, input, select, textarea").forEach((el) => (el.disabled = false));
      if (primaryButton) primaryButton.removeAttribute("aria-busy");
    }
  });

  refreshContribution(form);
}

document.addEventListener("DOMContentLoaded", () => {
  bindForm(inlineForm, inlineStatus);
  bindForm(modalForm, modalStatus);
});
