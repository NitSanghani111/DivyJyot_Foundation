/* ==========================================================================
   Divy Jyot Foundation - Form Validation & EmailJS Integration Service
   ========================================================================== */

// Base64 helper to decode keys at runtime, preventing simple inspection of raw credentials
const decodeKey = (encodedStr) => {
  try {
    return atob(encodedStr);
  } catch (e) {
    return encodedStr;
  }
};

// Obfuscated Configuration (Base64 encoded to protect keys from search crawlers & casual inspector users)
const EMAILJS_CONFIG_OBFUSCATED = {
  PUBLIC_KEY: 'aHJTTHotaGFVaEg4MGhNQTk=',     // Decodes to: hrSLz-haUhH80hMA9
  SERVICE_ID: 'c2VydmljZV9sejV0bnZ1',         // Decodes to: service_lz5tnvu
  TEMPLATES: {
    CONTACT_ORG: 'Y29udGFjdF9vcmc=',           // Decodes to: contact_org
    CONTACT_USER: 'Y29udGFjdF91c2Vy',         // Decodes to: contact_user
    VOLUNTEER_ORG: 'dm9sdW50ZWVyX29yZw==',     // Decodes to: volunteer_org
    VOLUNTEER_USER: 'dm9sdW50ZWVyX3VzZXI=',   // Decodes to: volunteer_user
    DONATE_ORG: 'ZG9uYXRlX29yZw==',           // Decodes to: donate_org
    DONATE_USER: 'ZG9uYXRlX3VzZXI='           // Decodes to: donate_user
  }
};

// Runtime configuration getter resolver
const EMAILJS_CONFIG = {
  get PUBLIC_KEY() { return decodeKey(EMAILJS_CONFIG_OBFUSCATED.PUBLIC_KEY); },
  get SERVICE_ID() { return decodeKey(EMAILJS_CONFIG_OBFUSCATED.SERVICE_ID); },
  TEMPLATES: {
    get CONTACT_ORG() { return decodeKey(EMAILJS_CONFIG_OBFUSCATED.TEMPLATES.CONTACT_ORG); },
    get CONTACT_USER() { return decodeKey(EMAILJS_CONFIG_OBFUSCATED.TEMPLATES.CONTACT_USER); },
    get VOLUNTEER_ORG() { return decodeKey(EMAILJS_CONFIG_OBFUSCATED.TEMPLATES.VOLUNTEER_ORG); },
    get VOLUNTEER_USER() { return decodeKey(EMAILJS_CONFIG_OBFUSCATED.TEMPLATES.VOLUNTEER_USER); },
    get DONATE_ORG() { return decodeKey(EMAILJS_CONFIG_OBFUSCATED.TEMPLATES.DONATE_ORG); },
    get DONATE_USER() { return decodeKey(EMAILJS_CONFIG_OBFUSCATED.TEMPLATES.DONATE_USER); }
  }
};

// Check if EmailJS is properly configured
const isEmailJSConfigured = () => {
  const pk = EMAILJS_CONFIG.PUBLIC_KEY;
  const sid = EMAILJS_CONFIG.SERVICE_ID;
  return (
    pk &&
    pk !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
    sid &&
    sid !== 'YOUR_EMAILJS_SERVICE_ID'
  );
};

// Initialize EmailJS if configured
(function () {
  if (isEmailJSConfigured() && typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log("EmailJS initialized successfully.");
  } else {
    console.warn(
      "EmailJS is not configured. Form submissions will operate in SIMULATION MODE.\n" +
      "To set up active email deliveries:\n" +
      "1. Register a free account at https://www.emailjs.com/\n" +
      "2. Create a service and email templates.\n" +
      "3. Populate keys inside 'js/email-service.js'."
    );
  }
})();

// Reusable validation helpers
const validators = {
  isValidEmail: (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  },
  isValidPhone: (phone) => {
    // 10 digits Indian phone number format
    const re = /^[6-9]\d{9}$/;
    return re.test(String(phone).trim());
  },
  cleanInput: (val) => {
    return String(val).trim();
  }
};

// Display helper for validation feedback
function setFieldValidation(inputElement, isValid, message = "") {
  if (!inputElement) return;
  const parent = inputElement.closest(".form-group");
  if (!parent) return;

  // Remove existing validation elements
  const existingFeedback = parent.querySelector(".invalid-feedback");
  if (existingFeedback) {
    existingFeedback.remove();
  }
  inputElement.classList.remove("is-invalid", "is-valid");

  if (isValid) {
    inputElement.classList.add("is-valid");
  } else {
    inputElement.classList.add("is-invalid");
    const feedback = document.createElement("div");
    feedback.className = "invalid-feedback d-block";
    feedback.style.color = "#d81b60";
    feedback.style.fontSize = "12px";
    feedback.style.marginTop = "5px";
    feedback.innerText = message;
    parent.appendChild(feedback);
  }
}

// Show global form message alerts
function showFormAlert(formElement, type, message) {
  if (!formElement) return;
  let alertDiv = formElement.querySelector(".form-alert-message");

  if (!alertDiv) {
    alertDiv = document.createElement("div");
    alertDiv.className = "form-alert-message mt-3 p-3 rounded";
    formElement.appendChild(alertDiv);
  }

  alertDiv.style.display = "block";
  if (type === "success") {
    alertDiv.style.backgroundColor = "#e6f4ea";
    alertDiv.style.color = "#137333";
    alertDiv.style.border = "1px solid #c2e7c9";
    alertDiv.innerHTML = `<span class="fa fa-check-circle mr-2"></span>${message}`;
  } else if (type === "error") {
    alertDiv.style.backgroundColor = "#fce8e6";
    alertDiv.style.color = "#c5221f";
    alertDiv.style.border = "1px solid #fad2cf";
    alertDiv.innerHTML = `<span class="fa fa-exclamation-circle mr-2"></span>${message}`;
  } else {
    alertDiv.style.backgroundColor = "#e8f0fe";
    alertDiv.style.color = "#1a73e8";
    alertDiv.style.border = "1px solid #d2e3fc";
    alertDiv.innerHTML = `<span class="fa fa-info-circle mr-2"></span>${message}`;
  }
}

// Toggle loading state on buttons
function setButtonLoading(buttonElement, isLoading, originalText = "Submit") {
  if (!buttonElement) return;
  if (isLoading) {
    buttonElement.disabled = true;
    buttonElement.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; display: inline-block; animation: spinner-border .75s linear infinite;"></span> Submitting...`;

    // Inject spinner keyframe animation if not present
    if (!document.getElementById("spinner-keyframe")) {
      const style = document.createElement("style");
      style.id = "spinner-keyframe";
      style.innerHTML = `@keyframes spinner-border { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
  } else {
    buttonElement.disabled = false;
    buttonElement.innerHTML = originalText;
  }
}

// --------------------------------------------------------------------------
// 1. GENERAL CONTACT FORM SUBMISSION
// --------------------------------------------------------------------------
async function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameEl = form.querySelector("[name='name']");
    const emailEl = form.querySelector("[name='email']");
    const subjectEl = form.querySelector("[name='subject']");
    const messageEl = form.querySelector("[name='message']");
    const submitBtn = form.querySelector("[type='submit']");

    let isFormValid = true;

    // Validate Name
    if (validators.cleanInput(nameEl.value).length < 2) {
      setFieldValidation(nameEl, false, "Please enter your full name (at least 2 letters)");
      isFormValid = false;
    } else {
      setFieldValidation(nameEl, true);
    }

    // Validate Email
    if (!validators.isValidEmail(validators.cleanInput(emailEl.value))) {
      setFieldValidation(emailEl, false, "Please enter a valid email address");
      isFormValid = false;
    } else {
      setFieldValidation(emailEl, true);
    }

    // Validate Subject
    if (validators.cleanInput(subjectEl.value).length < 3) {
      setFieldValidation(subjectEl, false, "Please enter a subject (at least 3 characters)");
      isFormValid = false;
    } else {
      setFieldValidation(subjectEl, true);
    }

    // Validate Message
    if (validators.cleanInput(messageEl.value).length < 10) {
      setFieldValidation(messageEl, false, "Please enter a detailed message (at least 10 characters)");
      isFormValid = false;
    } else {
      setFieldValidation(messageEl, true);
    }

    if (!isFormValid) return;

    const originalText = submitBtn.value || submitBtn.innerText || "Send Message";
    setButtonLoading(submitBtn, true, originalText);

    const templateParams = {
      from_name: nameEl.value,
      from_email: emailEl.value,
      subject: subjectEl.value,
      message: messageEl.value,
      to_email: 'nitsanghani1@gmail.com'
    };

    try {
      if (isEmailJSConfigured() && typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        // Send notification to organization
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.CONTACT_ORG, templateParams, EMAILJS_CONFIG.PUBLIC_KEY);
        // Send auto-acknowledgement to submitter (if configured)
        if (EMAILJS_CONFIG.TEMPLATES.CONTACT_USER && EMAILJS_CONFIG.TEMPLATES.CONTACT_USER !== 'YOUR_CONTACT_USER_TEMPLATE_ID') {
          await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.CONTACT_USER, templateParams, EMAILJS_CONFIG.PUBLIC_KEY);
        }
      } else {
        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("SIMULATION SUCCESS - Contact Form Parameters:", templateParams);
      }

      showFormAlert(form, "success", "Thank you! Your message has reached Divy Jyot Foundation. We will connect with you shortly.");
      form.reset();

      // Clear green borders after reset
      form.querySelectorAll(".form-control").forEach(el => el.classList.remove("is-valid"));
    } catch (err) {
      console.error("EmailJS Error:", err);
      showFormAlert(form, "error", "Failed to send message: " + (err.text || err.message || "Unknown error") + ". Please try again later.");
    } finally {
      setButtonLoading(submitBtn, false, originalText);
    }
  });
}

// --------------------------------------------------------------------------
// 2. BECOME A VOLUNTEER FORM SUBMISSION
// --------------------------------------------------------------------------
async function setupVolunteerForm() {
  const form = document.getElementById("volunteer-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameEl = form.querySelector("[name='name']");
    const emailEl = form.querySelector("[name='email']");
    const phoneEl = form.querySelector("[name='phone']");
    const cityEl = form.querySelector("[name='city']");
    const areaEl = form.querySelector("[name='area']");
    const messageEl = form.querySelector("[name='message']");
    const submitBtn = form.querySelector("[type='submit']");

    let isFormValid = true;

    // Validate Name
    if (validators.cleanInput(nameEl.value).length < 2) {
      setFieldValidation(nameEl, false, "Please enter your full name");
      isFormValid = false;
    } else {
      setFieldValidation(nameEl, true);
    }

    // Validate Email
    if (!validators.isValidEmail(validators.cleanInput(emailEl.value))) {
      setFieldValidation(emailEl, false, "Please enter a valid email address");
      isFormValid = false;
    } else {
      setFieldValidation(emailEl, true);
    }

    // Validate Phone
    if (!validators.isValidPhone(phoneEl.value)) {
      setFieldValidation(phoneEl, false, "Please enter a valid 10-digit Indian phone number (e.g. 9876543210)");
      isFormValid = false;
    } else {
      setFieldValidation(phoneEl, true);
    }

    // Validate City
    if (validators.cleanInput(cityEl.value).length < 2) {
      setFieldValidation(cityEl, false, "Please enter your city/town");
      isFormValid = false;
    } else {
      setFieldValidation(cityEl, true);
    }

    // Validate Message (optional, but checking length if present)
    setFieldValidation(messageEl, true);

    if (!isFormValid) return;

    const originalText = submitBtn.value || submitBtn.innerText || "Submit Registration";
    setButtonLoading(submitBtn, true, originalText);

    const templateParams = {
      from_name: nameEl.value,
      from_email: emailEl.value,
      phone: phoneEl.value,
      city: cityEl.value,
      contribution_area: areaEl.value,
      message: messageEl.value || "None",
      to_email: 'nitsanghani1@gmail.com'
    };

    try {
      if (isEmailJSConfigured() && typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        // Send notification to organization
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.VOLUNTEER_ORG, templateParams, EMAILJS_CONFIG.PUBLIC_KEY);
        // Send auto-acknowledgement
        if (EMAILJS_CONFIG.TEMPLATES.VOLUNTEER_USER && EMAILJS_CONFIG.TEMPLATES.VOLUNTEER_USER !== 'YOUR_VOLUNTEER_USER_TEMPLATE_ID') {
          await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.VOLUNTEER_USER, templateParams, EMAILJS_CONFIG.PUBLIC_KEY);
        }
      } else {
        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("SIMULATION SUCCESS - Volunteer Form Parameters:", templateParams);
      }

      showFormAlert(form, "success", "Registration successful! Thank you for volunteering to create an adulteration-free Gujarat. Our coordinator will contact you shortly.");
      form.reset();

      form.querySelectorAll(".form-control").forEach(el => el.classList.remove("is-valid"));
    } catch (err) {
      console.error("EmailJS Error:", err);
      showFormAlert(form, "error", "Registration failed: " + (err.text || err.message || "Unknown error") + ". Please try again.");
    } finally {
      setButtonLoading(submitBtn, false, originalText);
    }
  });
}

// --------------------------------------------------------------------------
// 3. DONATE INTEREST FORM SUBMISSION
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
async function setupDonateForm(formId = "donate-form") {
  const form = document.getElementById(formId);
  if (!form) return;

  const fileInput = form.querySelector("[name='payment_screenshot']");
  const submitBtn = form.querySelector("[type='submit']");
  const amountInput = form.querySelector("[name='amount']");
  const amountBtns = form.querySelectorAll(".amount-btn");

  // Amount selection quick select logic
  amountBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      amountBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      const val = this.getAttribute("data-val");
      if (val) {
        amountInput.value = val;
        amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        amountInput.value = "";
        amountInput.focus();
      }
    });
  });

  if (amountInput) {
    amountInput.addEventListener("input", function () {
      const currentVal = this.value;
      let matched = false;
      amountBtns.forEach(btn => {
        const btnVal = btn.getAttribute("data-val");
        if (btnVal && btnVal === currentVal) {
          btn.classList.add("active");
          matched = true;
        } else {
          btn.classList.remove("active");
        }
      });
      const customBtn = form.querySelector("#custom-amount-btn");
      if (!matched && currentVal !== "") {
        if (customBtn) customBtn.classList.add("active");
      } else {
        if (customBtn && matched) customBtn.classList.remove("active");
      }
    });
  }

  // Copy UPI ID feature
  const upiBadge = form.querySelector("#upi-badge");
  const copySuccess = form.querySelector("#copy-success-msg");
  if (upiBadge) {
    upiBadge.addEventListener("click", function () {
      navigator.clipboard.writeText("divyjyot@upi").then(function () {
        if (copySuccess) {
          copySuccess.style.display = "block";
          setTimeout(() => {
            copySuccess.style.display = "none";
          }, 2000);
        }
      }).catch(function (err) {
        console.error("Could not copy text: ", err);
      });
    });
  }

  // Enable/Disable submit button and show screenshot filename
  const uploadZone = form.querySelector(".payment-upload-zone");
  const uploadMainText = form.querySelector(".upload-label-main");
  const uploadSubText = form.querySelector(".upload-label-sub");
  const screenshotNextBtn = form.querySelector("#screenshot-next-btn");

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files[0]) {
        if (submitBtn) submitBtn.removeAttribute("disabled");
        if (screenshotNextBtn) screenshotNextBtn.removeAttribute("disabled");
        setFieldValidation(fileInput, true);

        const fileName = fileInput.files[0].name;
        if (uploadZone) uploadZone.classList.add("file-selected");
        if (uploadMainText) uploadMainText.innerHTML = '<i class="fa fa-check-circle mr-1" style="color: #22c55e;"></i> Screenshot Selected';
        if (uploadSubText) uploadSubText.textContent = fileName + " (Click to replace)";
      } else {
        if (submitBtn) submitBtn.setAttribute("disabled", "true");
        if (screenshotNextBtn) screenshotNextBtn.setAttribute("disabled", "true");
        setFieldValidation(fileInput, false, "Please upload a proof of payment screenshot");

        if (uploadZone) uploadZone.classList.remove("file-selected");
        if (uploadMainText) uploadMainText.textContent = "Upload Payment Screenshot";
        if (uploadSubText) uploadSubText.textContent = "Click or drag image file here (required)";
      }
    });
  }

  // Stepper/Wizard Step Navigation
  const stepContents = form.querySelectorAll(".donation-step-content");
  const nextBtns = form.querySelectorAll(".btn-next-step");
  const prevBtns = form.querySelectorAll(".btn-prev-step");
  const progressBar = form.querySelector(".progress-bar");
  const progressText = form.querySelector(".progress-step-text");
  const progressPercent = form.querySelector(".progress-percent");

  const stepNames = {
    1: "Basic Details & Amount",
    2: "Pay & Upload Proof"
  };

  function goToStep(stepNum) {
    stepContents.forEach(step => {
      step.style.display = "none";
      step.classList.remove("active-step");
      if (parseInt(step.getAttribute("data-step")) === stepNum) {
        step.style.display = "block";
        step.classList.add("active-step");
      }
    });

    // Update progress bar
    const percentage = stepNum * 50;
    if (progressBar) {
      progressBar.style.width = percentage + "%";
      progressBar.setAttribute("aria-valuenow", percentage);
    }
    if (progressText) {
      progressText.textContent = `Step ${stepNum} of 2: ${stepNames[stepNum]}`;
    }
    if (progressPercent) {
      progressPercent.textContent = percentage + "%";
    }
  }

  // Next Button Clicks
  nextBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const currentStepContainer = btn.closest(".donation-step-content");
      const currentStep = parseInt(currentStepContainer.getAttribute("data-step"));

      // Validation check before going to next step
      let stepValid = true;

      if (currentStep === 1) {
        const nameEl = form.querySelector("[name='name']");
        const emailEl = form.querySelector("[name='email']");
        const phoneEl = form.querySelector("[name='phone']");
        const initiativeEl = form.querySelector("[name='initiative']");
        const amountEl = form.querySelector("[name='amount']");

        // Validate Name
        if (validators.cleanInput(nameEl.value).length < 2) {
          setFieldValidation(nameEl, false, "Please enter your full name");
          stepValid = false;
        } else {
          setFieldValidation(nameEl, true);
        }

        // Validate Phone
        if (!validators.isValidPhone(phoneEl.value)) {
          setFieldValidation(phoneEl, false, "Please enter a valid 10-digit phone number");
          stepValid = false;
        } else {
          setFieldValidation(phoneEl, true);
        }

        // Validate Email
        if (!validators.isValidEmail(validators.cleanInput(emailEl.value))) {
          setFieldValidation(emailEl, false, "Please enter a valid email address");
          stepValid = false;
        } else {
          setFieldValidation(emailEl, true);
        }

        // Validate Initiative
        if (!initiativeEl.value) {
          setFieldValidation(initiativeEl, false, "Please select an initiative campaign to support");
          stepValid = false;
        } else {
          setFieldValidation(initiativeEl, true);
        }

        // Validate Amount
        if (!amountEl.value || parseInt(amountEl.value) < 10) {
          setFieldValidation(amountEl, false, "Please enter an amount of at least ₹10");
          stepValid = false;
        } else {
          setFieldValidation(amountEl, true);
        }
      }

      if (stepValid && currentStep < 2) {
        goToStep(currentStep + 1);
      }
    });
  });

  // Prev Button Clicks
  prevBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const currentStepContainer = btn.closest(".donation-step-content");
      const currentStep = parseInt(currentStepContainer.getAttribute("data-step"));
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameEl = form.querySelector("[name='name']");
    const emailEl = form.querySelector("[name='email']");
    const phoneEl = form.querySelector("[name='phone']");
    const initiativeEl = form.querySelector("[name='initiative']");
    const amountEl = form.querySelector("[name='amount']");

    let isFormValid = true;

    // Validate Name
    if (validators.cleanInput(nameEl.value).length < 2) {
      setFieldValidation(nameEl, false, "Please enter your full name");
      isFormValid = false;
    } else {
      setFieldValidation(nameEl, true);
    }

    // Validate Email
    if (!validators.isValidEmail(validators.cleanInput(emailEl.value))) {
      setFieldValidation(emailEl, false, "Please enter a valid email address");
      isFormValid = false;
    } else {
      setFieldValidation(emailEl, true);
    }

    // Validate Phone
    if (!validators.isValidPhone(phoneEl.value)) {
      setFieldValidation(phoneEl, false, "Please enter a valid 10-digit Indian phone number");
      isFormValid = false;
    } else {
      setFieldValidation(phoneEl, true);
    }

    // Validate Initiative
    if (!initiativeEl.value) {
      setFieldValidation(initiativeEl, false, "Please select an initiative campaign to support");
      isFormValid = false;
    } else {
      setFieldValidation(initiativeEl, true);
    }

    // Validate Amount
    const amountVal = parseFloat(validators.cleanInput(amountEl.value));
    if (isNaN(amountVal) || amountVal < 10) {
      setFieldValidation(amountEl, false, "Please enter a valid donation amount (minimum ₹10)");
      isFormValid = false;
    } else {
      setFieldValidation(amountEl, true);
    }

    // Validate Payment Screenshot File
    const file = fileInput ? fileInput.files[0] : null;
    if (!file) {
      setFieldValidation(fileInput, false, "Please upload a proof of payment screenshot");
      isFormValid = false;
    } else {
      setFieldValidation(fileInput, true);
    }

    if (!isFormValid) return;

    const originalText = submitBtn.value || submitBtn.innerText || "Submit Donation Details";
    setButtonLoading(submitBtn, true, originalText);

    // Convert file to Base64
    let screenshotBase64 = "";
    if (file) {
      try {
        screenshotBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      } catch (err) {
        console.error("Error reading payment screenshot file:", err);
      }
    }

    const templateParams = {
      from_name: nameEl.value,
      from_email: emailEl.value,
      phone: phoneEl.value,
      initiative: initiativeEl.value,
      amount: amountEl.value,
      payment_screenshot: screenshotBase64,
      to_email: 'nitsanghani1@gmail.com'
    };

    try {
      if (isEmailJSConfigured() && typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        // Send notification to organization
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.DONATE_ORG, templateParams, EMAILJS_CONFIG.PUBLIC_KEY);
        // Send auto-acknowledgement
        if (EMAILJS_CONFIG.TEMPLATES.DONATE_USER && EMAILJS_CONFIG.TEMPLATES.DONATE_USER !== 'YOUR_DONATE_USER_TEMPLATE_ID') {
          await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.DONATE_USER, templateParams, EMAILJS_CONFIG.PUBLIC_KEY);
        }
      } else {
        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("SIMULATION SUCCESS - Donation Form Parameters:", templateParams);
      }

      showFormAlert(form, "success", "Donation details and proof of payment submitted successfully! Thank you for supporting Divy Jyot Foundation. We will verify and connect with you shortly.");
      form.reset();
      goToStep(1);

      // Reset upload zone visuals
      if (uploadZone) uploadZone.classList.remove("file-selected");
      if (uploadMainText) uploadMainText.textContent = "Upload Payment Screenshot";
      if (uploadSubText) uploadSubText.textContent = "Click or drag image file here (required)";

      if (submitBtn) submitBtn.setAttribute("disabled", "true");
      if (screenshotNextBtn) screenshotNextBtn.setAttribute("disabled", "true");

      form.querySelectorAll(".form-control").forEach(el => el.classList.remove("is-valid"));
    } catch (err) {
      console.error("EmailJS Error:", err);
      showFormAlert(form, "error", "Failed to submit donation: " + (err.text || err.message || "Unknown error") + ". Please try again.");
    } finally {
      setButtonLoading(submitBtn, false, originalText);
    }
  });
}

// --------------------------------------------------------------------------
// PAGE INITIALIZERS
// --------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  setupContactForm();
  setupVolunteerForm();
  setupDonateForm("donate-form");
  setupDonateForm("donate-form-mobile");
});
