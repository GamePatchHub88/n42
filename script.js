
"use strict";

// ========================================
// 1. تحديد عناصر الصفحة
// ========================================

const steps = {
  personal: document.querySelector("#step-1"),
  plan: document.querySelector("#step-2"),
  addons: document.querySelector("#step-3"),
  summary: document.querySelector("#step-4"),
  thankYou: document.querySelector("#step-5"),
};

const personalForm = document.querySelector(".fields");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");

const planCards = [...document.querySelectorAll(".plan-card")];
const billingInput = document.querySelector(".billing-switch input");
const addonCards = [...document.querySelectorAll(".addon-card")];

const summary = document.querySelector(".summary");
const totalElement = document.querySelector(".total strong");

const nextButtons = document.querySelectorAll(
  ".actions .button.primary"
);

// ========================================
// 2. بيانات الباقات والأسعار
// ========================================

const plans = [
  {
    name: "Arcade",
    monthly: 9,
    yearly: 90,
  },
  {
    name: "Advanced",
    monthly: 12,
    yearly: 120,
  },
  {
    name: "Pro",
    monthly: 15,
    yearly: 150,
  },
];

const addons = [
  {
    name: "Online service",
    description: "Access to multiplayer games",
    monthly: 1,
    yearly: 10,
  },
  {
    name: "Larger storage",
    description: "Extra 1TB of cloud save",
    monthly: 2,
    yearly: 20,
  },
  {
    name: "Customizable Profile",
    description: "Custom theme on your profile",
    monthly: 2,
    yearly: 20,
  },
];

// ========================================
// 3. الحالة الحالية للنموذج
// ========================================

const state = {
  currentStep: 1,
  selectedPlan: 0,
  yearly: false,
  selectedAddons: new Set([0]),
};

// ========================================
// 4. أدوات مساعدة
// ========================================

function getPrice(item) {
  return state.yearly ? item.yearly : item.monthly;
}

function getPeriod() {
  return state.yearly ? "yr" : "mo";
}

function formatPrice(price) {
  return `$${price}/${getPeriod()}`;
}

function goToStep(stepNumber) {
  if (!steps[`step${stepNumber}`]) {
    // أسماء المفاتيح الفعلية مختلفة، لذلك نستخدم المصفوفة أدناه.
    const radios = Object.values(steps);
    radios[stepNumber - 1].checked = true;
  } else {
    steps[`step${stepNumber}`].checked = true;
  }

  state.currentStep = stepNumber;
}

// ========================================
// 5. التحقق من البيانات الشخصية
// ========================================

function validateField(input, message) {
  const value = input.value.trim();

  input.setCustomValidity("");

  if (!value) {
    input.setCustomValidity(message);
    input.reportValidity();
    return false;
  }

  if (!input.checkValidity()) {
    input.reportValidity();
    return false;
  }

  return true;
}

function validatePersonalInfo() {
  const validName = validateField(
    nameInput,
    "Please enter your name."
  );

  if (!validName) return false;

  const validEmail = validateField(
    emailInput,
    "Please enter a valid email address."
  );

  if (!validEmail) return false;

  const validPhone = validateField(
    phoneInput,
    "Please enter your phone number."
  );

  if (!validPhone) return false;

  // رفض رقم الهاتف الذي يحتوي على أحرف فقط.
  const phoneDigits = phoneInput.value.replace(/\D/g, "");

  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    phoneInput.setCustomValidity(
      "Please enter a valid phone number."
    );
    phoneInput.reportValidity();
    return false;
  }

  return true;
}

// ========================================
// 6. التنقل بين الخطوات
// ========================================

document.querySelectorAll(".actions .button").forEach((button) => {
  button.addEventListener("click", (event) => {
    const targetId = button.getAttribute("for");

    if (!targetId) return;

    event.preventDefault();

    const targetStep = Number(targetId.replace("step-", ""));

    // التحقق قبل مغادرة الخطوة الأولى.
    if (
      targetStep > state.currentStep &&
      state.currentStep === 1
    ) {
      if (!validatePersonalInfo()) return;
    }

    // لا نسمح بتأكيد النموذج دون بيانات صحيحة.
    if (targetStep === 5 && !validatePersonalInfo()) {
      goToStep(1);
      return;
    }

    goToStep(targetStep);

    if (targetStep === 4) {
      updateSummary();
    }
  });
});

// منع إرسال النموذج وإعادة تحميل الصفحة.
personalForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

// ========================================
// 7. اختيار الباقة
// ========================================

planCards.forEach((card, index) => {
  const radio = card.querySelector('input[type="radio"]');

  radio.addEventListener("change", () => {
    if (!radio.checked) return;

    state.selectedPlan = index;

    updatePlanPrices();
    updateSummary();
  });
});

// ========================================
// 8. التبديل بين الشهري والسنوي
// ========================================

billingInput.addEventListener("change", () => {
  state.yearly = billingInput.checked;

  document
    .querySelector(".monthly-label")
    .classList.toggle("active", !state.yearly);

  document
    .querySelector(".yearly-label")
    .classList.toggle("active", state.yearly);

  updatePlanPrices();
  updateAddonPrices();
  updateSummary();
});

// ========================================
// 9. تحديث أسعار الباقات
// ========================================

function updatePlanPrices() {
  planCards.forEach((card, index) => {
    const plan = plans[index];
    const priceElement = card.querySelector(".price");
    const bonusElement = card.querySelector(".plan-details small");

    priceElement.textContent = formatPrice(getPrice(plan));

    bonusElement.textContent = state.yearly
      ? "2 months free"
      : "";
  });
}

// ========================================
// 10. اختيار الإضافات
// ========================================

addonCards.forEach((card, index) => {
  const checkbox = card.querySelector('input[type="checkbox"]');

  // مزامنة الحالة الأولية مع HTML.
  checkbox.checked = state.selectedAddons.has(index);

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      state.selectedAddons.add(index);
    } else {
      state.selectedAddons.delete(index);
    }

    updateSummary();
  });
});

// ========================================
// 11. تحديث أسعار الإضافات
// ========================================

function updateAddonPrices() {
  addonCards.forEach((card, index) => {
    const priceElement = card.querySelector(".addon-price");

    priceElement.textContent =
      `+${formatPrice(addons[index]).replace("$", "$")}`;
  });
}

// ========================================
// 12. إنشاء الملخص وحساب الإجمالي
// ========================================

function updateSummary() {
  const selectedPlan = plans[state.selectedPlan];

  const selectedAddonItems = [...state.selectedAddons]
    .sort((a, b) => a - b)
    .map((index) => addons[index]);

  const planPrice = getPrice(selectedPlan);

  const addonsTotal = selectedAddonItems.reduce(
    (total, addon) => total + getPrice(addon),
    0
  );

  const total = planPrice + addonsTotal;

  summary.innerHTML = `
    <div class="summary-plan">
      <div>
        <strong>
          ${selectedPlan.name}
          (${state.yearly ? "Yearly" : "Monthly"})
        </strong>
        <label class="change-plan" for="step-2">Change</label>
      </div>

      <strong>${formatPrice(planPrice)}</strong>
    </div>

    <div class="summary-divider"></div>

    ${
      selectedAddonItems.length
        ? selectedAddonItems
            .map(
              (addon) => `
                <div class="summary-item">
                  <span>${addon.name}</span>
                  <strong>+${formatPrice(getPrice(addon))}</strong>
                </div>
              `
            )
            .join("")
        : `
          <div class="summary-item">
            <span>No add-ons selected</span>
            <strong>$0/${getPeriod()}</strong>
          </div>
        `
    }
  `;

  totalElement.textContent = `+$${total}/${getPeriod()}`;

  const totalLabel = document.querySelector(".total span");

  totalLabel.textContent = state.yearly
    ? "Total (per year)"
    : "Total (per month)";
}

// ========================================
// 13. إعادة ضبط النموذج
// ========================================

function resetForm() {
  personalForm.reset();

  state.currentStep = 1;
  state.selectedPlan = 0;
  state.yearly = false;
  state.selectedAddons = new Set([0]);

  planCards.forEach((card, index) => {
    card.querySelector('input[type="radio"]').checked =
      index === 0;
  });

  addonCards.forEach((card, index) => {
    card.querySelector('input[type="checkbox"]').checked =
      index === 0;
  });

  billingInput.checked = false;

  goToStep(1);
  updatePlanPrices();
  updateAddonPrices();
  updateSummary();
}

// ========================================
// 14. التشغيل الأولي
// ========================================

updatePlanPrices();
updateAddonPrices();
updateSummary();
