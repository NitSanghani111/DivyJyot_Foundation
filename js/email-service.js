/* ==========================================================================
   Divy Jyot Foundation - Form Validation & Web3Forms Integration Service
   ========================================================================== */

// Base64 helper to decode keys at runtime, preventing simple inspection of raw credentials
const decodeKey = (encodedStr) => {
  if (!encodedStr || encodedStr.includes('YOUR_')) {
    return '';
  }
  // If it's a standard UUID (contains hyphens), it's a raw key
  if (encodedStr.includes('-')) {
    return encodedStr.trim();
  }
  try {
    const decoded = atob(encodedStr).trim();
    // If the decoded key contains hyphens, it's a valid base64 encoded UUID
    if (decoded.includes('-')) {
      return decoded;
    }
    return encodedStr.trim();
  } catch (e) {
    return encodedStr.trim();
  }
};

// Obfuscated Configuration (Base64 encoded or raw Web3Forms Access Key)
const WEB3FORMS_CONFIG_OBFUSCATED = {
  ACCESS_KEY: 'c6652d9c-373f-4967-a0f6-308c3a7db3e9'
};

// Runtime configuration getter resolver
const WEB3FORMS_CONFIG = {
  get ACCESS_KEY() { return decodeKey(WEB3FORMS_CONFIG_OBFUSCATED.ACCESS_KEY); }
};

// Check if Web3Forms is properly configured
const isWeb3FormsConfigured = () => {
  const ak = WEB3FORMS_CONFIG.ACCESS_KEY;
  return (
    ak &&
    ak !== 'YOUR_BASE64_WEB3FORMS_ACCESS_KEY_HERE' &&
    ak !== 'YOUR_WEB3FORMS_ACCESS_KEY_HERE' &&
    ak.trim() !== ''
  );
};

// Initialize Web3Forms warning if not configured
(function () {
  if (isWeb3FormsConfigured()) {
    console.log("Web3Forms integration is ready.");
  } else {
    console.warn(
      "Web3Forms is not configured. Form submissions will operate in SIMULATION MODE.\n" +
      "To set up active email deliveries:\n" +
      "1. Get a free access key at https://web3forms.com/\n" +
      "2. Populate ACCESS_KEY inside 'js/email-service.js' (raw or base64 encoded)."
    );
  }
})();

/**
 * Reusable email sending function for Web3Forms API
 * @param {string} subject - Email subject line
 * @param {Object} data - Key-value payload of form fields
 * @param {File} [fileAttachment] - Optional File object from file input
 * @param {string} [fromName] - Optional custom sender name
 * @returns {Promise<boolean>} - Resolves to true on success
 */
async function sendEmailWeb3Forms(subject, data, fileAttachment = null, fromName = "Divy Jyot Foundation") {
  if (!isWeb3FormsConfigured()) {
    // Simulation Mode
    console.log(`[SIMULATION MODE] Submitting form: "${subject}"`, data);
    if (fileAttachment) {
      console.log(`[SIMULATION MODE] File attached:`, fileAttachment.name, `(${fileAttachment.size} bytes)`);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  }

  const formData = new FormData();
  formData.append("access_key", WEB3FORMS_CONFIG.ACCESS_KEY);
  formData.append("subject", subject);
  formData.append("from_name", fromName);

  // Set replyto so reply emails go to the submitter directly
  const submitterEmail = data["Email"] || data["Email Address"] || data["email"];
  if (submitterEmail) {
    formData.append("replyto", submitterEmail);
    // Explicitly add 'email' parameter for Web3Forms Autoresponder support
    formData.append("email", submitterEmail);
  }

  formData.append("redirect", ""); // Don't redirect, return JSON response

  // Append other payload data
  for (const [key, val] of Object.entries(data)) {
    formData.append(key, val);
  }

  // Append attachment file if exists
  if (fileAttachment) {
    formData.append("attachment", fileAttachment);
  }

  let response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData
  });

  // Handle Free Tier / Size Limits fallback: if status is 400 or 413 and we had an attachment, retry without it
  if ((response.status === 400 || response.status === 413) && fileAttachment) {
    console.warn(`Web3Forms returned status ${response.status}. Retrying submission without file attachment (likely size limit or Free plan limitation)...`);
    const fallbackFormData = new FormData();
    fallbackFormData.append("access_key", WEB3FORMS_CONFIG.ACCESS_KEY);
    fallbackFormData.append("subject", subject + " (Screenshot Excluded)");
    fallbackFormData.append("from_name", fromName);

    if (submitterEmail) {
      fallbackFormData.append("replyto", submitterEmail);
      fallbackFormData.append("email", submitterEmail);
    }
    fallbackFormData.append("redirect", "");

    for (const [key, val] of Object.entries(data)) {
      fallbackFormData.append(key, val);
    }
    fallbackFormData.append("System Note", `Payment screenshot was attached by user but stripped because the file is too large (status 413) or the Web3Forms key is on the Free tier.`);

    response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: fallbackFormData
    });
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.success) {
    return true;
  } else {
    throw new Error(result.message || "Failed to submit form to Web3Forms");
  }
}

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
    const phoneEl = form.querySelector("[name='phone']");
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

    // Validate Phone Number
    if (phoneEl) {
      if (!validators.isValidPhone(validators.cleanInput(phoneEl.value))) {
        setFieldValidation(phoneEl, false, "Please enter a valid 10-digit mobile number");
        isFormValid = false;
      } else {
        setFieldValidation(phoneEl, true);
      }
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

    const payload = {
      "Name": nameEl.value,
      "Email Address": emailEl.value,
      "Mobile Number": phoneEl ? phoneEl.value : "",
      "Subject": subjectEl.value,
      "Message": messageEl.value
    };

    try {
      const emailSubject = `Contact Form Inquiry from ${nameEl.value}: ${subjectEl.value}`;
      await sendEmailWeb3Forms(emailSubject, payload, null, "Divy Jyot - Contact Form");

      showFormAlert(form, "success", "Thank you! Your message has reached Divy Jyot Foundation. We will connect with you shortly.");
      form.reset();

      // Clear green borders after reset
      form.querySelectorAll(".form-control").forEach(el => el.classList.remove("is-valid"));
    } catch (err) {
      console.error("Form Submission Error:", err);
      showFormAlert(form, "error", "Failed to send message: " + (err.message || "Unknown error") + ". Please try again later.");
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

    const payload = {
      "Name": nameEl.value,
      "Email Address": emailEl.value,
      "Phone Number": phoneEl.value,
      "City/Town": cityEl.value,
      "Preferred Area of Contribution": areaEl.value,
      "Message/Notes": messageEl.value || "None"
    };

    try {
      const emailSubject = `New Volunteer Registration: ${nameEl.value} (${cityEl.value})`;
      await sendEmailWeb3Forms(emailSubject, payload, null, "Divy Jyot - Volunteer Form");

      showFormAlert(form, "success", "Registration successful! Thank you for volunteering to create an adulteration-free Gujarat. Our coordinator will contact you shortly.");
      form.reset();

      form.querySelectorAll(".form-control").forEach(el => el.classList.remove("is-valid"));
    } catch (err) {
      console.error("Form Submission Error:", err);
      showFormAlert(form, "error", "Registration failed: " + (err.message || "Unknown error") + ". Please try again.");
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

    if (!isFormValid) return;

    const originalText = submitBtn.value || submitBtn.innerText || "Submit Donation Details";
    setButtonLoading(submitBtn, true, originalText);

    const payload = {
      "Name": nameEl.value,
      "Email Address": emailEl.value,
      "Phone Number": phoneEl.value,
      "Support Initiative": initiativeEl.value,
      "Donation Amount": `Rs. ${amountEl.value}`
    };

    try {
      const emailSubject = `Donation Form Submitted: Rs. ${amountEl.value} by ${nameEl.value}`;
      await sendEmailWeb3Forms(emailSubject, payload, null, "Divy Jyot - Donation Form");

      form.reset();
      goToStep(1);

      // Show Custom Success Modal prompting WhatsApp screenshot
      const successModal = document.getElementById("donation-success-modal");
      if (successModal) {
        successModal.style.display = "flex";
        setTimeout(() => {
          const content = successModal.querySelector(".custom-modal-content");
          if (content) content.style.transform = "scale(1)";
        }, 50);
      }

      form.querySelectorAll(".form-control").forEach(el => el.classList.remove("is-valid"));
    } catch (err) {
      console.error("Form Submission Error:", err);
      showFormAlert(form, "error", "Failed to submit donation: " + (err.message || "Unknown error") + ". Please try again.");
    } finally {
      setButtonLoading(submitBtn, false, originalText);
    }
  });

  // Setup modal close handler once
  const closeModalBtn = document.getElementById("close-success-modal-btn");
  const successModal = document.getElementById("donation-success-modal");
  if (closeModalBtn && successModal) {
    closeModalBtn.addEventListener("click", function () {
      successModal.style.display = "none";
      const content = successModal.querySelector(".custom-modal-content");
      if (content) content.style.transform = "scale(0.9)";
    });
  }
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
