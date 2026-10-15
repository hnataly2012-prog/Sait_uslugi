"use strict";

const CONTACT = {
  phone: "+79990000000",
  email: "consult@example.ru",
  telegram: "example_lawyer"
};

const TARIFFS = {
  person: [
    ["Анализ и стратегия", 10000],
    ["Подготовка заявления", 25000],
    ["Судебное сопровождение", 65000],
    ["Завершение процедуры", 10000]
  ],
  company: [
    ["Финансово-правовой анализ", 40000],
    ["Подготовка заявления", 60000],
    ["Сопровождение процедуры", 150000],
    ["Завершение", 40000]
  ]
};

const money = new Intl.NumberFormat("ru-RU");

function formatMoney(amount) {
  return money.format(amount) + " ₽";
}

const phone = document.getElementById("phoneLink");
phone.href = "tel:" + CONTACT.phone;
phone.textContent = CONTACT.phone.replace(
  /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/,
  "+7 ($1) $2-$3-$4"
);

const email = document.getElementById("emailLink");
email.href = "mailto:" + CONTACT.email;
email.textContent = CONTACT.email;

const telegram = document.getElementById("telegramLink");
telegram.href = "https://t.me/" + CONTACT.telegram.replace(/^@/, "");

document.getElementById("year").textContent = new Date().getFullYear();

const menu = document.getElementById("menuButton");
const links = document.getElementById("navLinks");
menu.addEventListener("click", () => {
  const opened = links.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(opened));
});
links.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    links.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".tabs").forEach((group) => {
  group.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      group.querySelectorAll(".tab").forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-selected", "false");
        document.getElementById(item.dataset.tab).hidden = true;
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      document.getElementById(button.dataset.tab).hidden = false;
    });
  });
});

function selectedStages(scope) {
  if (scope === "analysis") return 1;
  if (scope === "filing") return 2;
  return 4;
}

function updateCalculator() {
  const kind = document.getElementById("clientType").value;
  const scope = document.getElementById("serviceScope").value;
  const stages = TARIFFS[kind].slice(0, selectedStages(scope));
  const total = stages.reduce((sum, stage) => sum + stage[1], 0);
  document.getElementById("calcResult").textContent = formatMoney(total);
  document.getElementById("calcBreakdown").innerHTML = stages
    .map((stage) => `<li><span>${stage[0]}</span><span>${formatMoney(stage[1])}</span></li>`)
    .join("");
}

document.getElementById("clientType").addEventListener("change", updateCalculator);
document.getElementById("serviceScope").addEventListener("change", updateCalculator);
updateCalculator();

function showError(id, message) {
  const node = document.getElementById(id);
  node.textContent = message;
  node.classList.add("show");
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((node) => {
    node.textContent = "";
    node.classList.remove("show");
  });
}

document.getElementById("leadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  const name = document.getElementById("leadName").value.trim();
  const contact = document.getElementById("leadContact").value.trim();
  const type = document.getElementById("leadType").value;
  const message = document.getElementById("leadMessage").value.trim();
  const consent = document.getElementById("consent").checked;
  let valid = true;

  if (name.length < 2) {
    showError("nameError", "Укажите, как к вам обращаться.");
    valid = false;
  }
  if (contact.length < 5) {
    showError("contactError", "Оставьте телефон или email для ответа.");
    valid = false;
  }
  if (!consent) {
    showError("consentError", "Нужно согласие на обработку данных для ответа.");
    valid = false;
  }
  if (!valid) return;

  const subject = "Запрос консультации: " + type;
  const body = [
    "Имя: " + name,
    "Контакт: " + contact,
    "Вопрос: " + type,
    "",
    "Описание ситуации:",
    message || "Не указано"
  ].join("\n");

  const success = document.getElementById("formSuccess");
  success.textContent = "Заявка подготовлена для " + CONTACT.email + ". Если почтовая программа не открылась, отправьте это письмо вручную.";
  success.classList.add("show");
  window.location.href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
});

const sections = document.querySelectorAll("main .section");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function reveal(section) {
  section.classList.add("is-visible");
}

if (reduceMotion || !("IntersectionObserver" in window)) {
  sections.forEach(reveal);
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0 });

  sections.forEach((section) => {
    observer.observe(section);
    section.addEventListener("focusin", () => reveal(section));
  });
}
