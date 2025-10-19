const API_BASE = "/api";

const labels = {
  username: "Username",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  department: "Department",
  jobTitle: "Job Title",
  address1: "Address Line 1",
  address2: "Address Line 2",
  city: "City",
  state: "State/Province",
  postalCode: "Postal Code"
};

function showMessage(selector, type, text) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.remove("success", "error");
  if (type) {
    el.classList.add(type);
  }
  el.textContent = text || "";
}

function setActiveTab(targetId) {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.target === targetId);
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  if (targetId === "register-section") {
    setRegisterStep("1");
  }
}

function setRegisterStep(step) {
  document.querySelectorAll(".step").forEach((indicator) => {
    indicator.classList.toggle("active", indicator.dataset.step === step);
  });

  const form = document.getElementById("register-form");
  const review = document.getElementById("register-review");
  if (!form || !review) return;

  if (step === "1") {
    form.classList.remove("hidden");
    review.classList.add("hidden");
  } else {
    form.classList.add("hidden");
    review.classList.remove("hidden");
  }
}

function collectRegistrationData() {
  const registerForm = document.getElementById("register-form");
  const data = {};
  if (!registerForm) return data;

  const formData = new FormData(registerForm);
  formData.forEach((value, key) => {
    data[key] = value.trim();
  });

  return data;
}

function buildReview(data) {
  const container = document.getElementById("review-content");
  if (!container) return;
  container.innerHTML = "";

  Object.entries(labels).forEach(([key, label]) => {
    const value = data[key] || "—";
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <h4>${label}</h4>
      <p>${value}</p>
    `;
    container.appendChild(card);
  });
}

async function postJSON(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || "Request failed.";
    throw new Error(message);
  }

  return data;
}

function initTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const target = event.currentTarget.dataset.target;
      if (!target) return;
      setActiveTab(target);
      showMessage("#login-message", "", "");
      showMessage("#register-message", "", "");
    });
  });
}

function initRegistration() {
  const registerForm = document.getElementById("register-form");
  const reviewForm = document.getElementById("register-review");
  const cancelButton = document.getElementById("register-cancel");
  const backButton = document.getElementById("review-back");

  if (!registerForm || !reviewForm) return;

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = collectRegistrationData();
    const missingRequired = ["username", "password", "firstName", "lastName", "email"].some(
      (key) => !data[key]
    );

    if (missingRequired) {
      showMessage("#register-message", "error", "Please complete all required fields.");
      return;
    }

    if ((data.password || "").length < 8) {
      showMessage("#register-message", "error", "Password must be at least 8 characters.");
      return;
    }

    buildReview(data);
    setRegisterStep("2");
    showMessage("#register-message", "", "");
  });

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = collectRegistrationData();

    try {
      const result = await postJSON(`${API_BASE}/auth/register`, data);
      showMessage("#register-message", "success", result.message || "Registration successful.");
      registerForm.reset();
      setRegisterStep("1");
    } catch (error) {
      showMessage("#register-message", "error", error.message);
    }
  });

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      registerForm.reset();
      setRegisterStep("1");
      showMessage("#register-message", "", "");
    });
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      setRegisterStep("1");
    });
  }
}

function initLogin() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
      username: loginForm.username.value.trim(),
      password: loginForm.password.value.trim()
    };

    if (!data.username || !data.password) {
      showMessage("#login-message", "error", "Enter both username and password.");
      return;
    }

    try {
      const result = await postJSON(`${API_BASE}/auth/login`, data);
      const name = `${result.employee?.firstName || ""} ${result.employee?.lastName || ""}`.trim();
      showMessage("#login-message", "success", `Welcome back, ${name || data.username}!`);
      loginForm.reset();

      if (result.employee?.id) {
        setTimeout(() => {
          window.location.href = `/user-info.html?userId=${encodeURIComponent(result.employee.id)}`;
        }, 400);
      }
    } catch (error) {
      showMessage("#login-message", "error", error.message);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initRegistration();
  initLogin();
});
