// Validation + double-submit protection for every form
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    if (e.defaultPrevented) return; // e.g. the user cancelled a confirm() dialog

    if (form.classList.contains("needs-validation") && !form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    if (form.dataset.sending) {
      e.preventDefault(); // already submitted, ignore extra clicks
      return;
    }
    form.dataset.sending = "1";

    const btn = form.querySelector("button[type=submit], button:not([type])");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Please wait...';
    }
  });
});

// if the user comes back with the Back button, reset any disabled buttons
window.addEventListener("pageshow", (e) => {
  if (e.persisted) window.location.reload();
});