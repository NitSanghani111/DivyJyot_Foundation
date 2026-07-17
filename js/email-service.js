/* ==========================================================================
   Divy Jyot Foundation - Form Validation & EmailJS Integration Service
   ========================================================================== */

// EmailJS Configuration
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY', // Set your Public Key here
  SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID', // Set your Service ID here
  TEMPLATES: {
    CONTACT_ORG: 'YOUR_CONTACT_ORG_TEMPLATE_ID',     // Email template sent to NGO
    CONTACT_USER: 'YOUR_CONTACT_USER_TEMPLATE_ID',   // Acknowledge email sent to User
    VOLUNTEER_ORG: 'YOUR_VOLUNTEER_ORG_TEMPLATE_ID', // Email template sent to NGO
    VOLUNTEER_USER: 'YOUR_VOLUNTEER_USER_TEMPLATE_ID', // Acknowledge email sent to User
    DONATE_ORG: 'YOUR_DONATE_ORG_TEMPLATE_ID',       // Email template sent to NGO
    DONATE_USER: 'YOUR_DONATE_USER_TEMPLATE_ID'      // Acknowledge email sent to User
  }
};

// Check if EmailJS is properly configured
const isEmailJSConfigured = () => {
  return (
    EMAILJS_CONFIG.PUBLIC_KEY && 
    EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
    EMAILJS_CONFIG.SERVICE_ID && 
    EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_EMAILJS_SERVICE_ID'
  );
};

// Initialize EmailJS if configured
(function() {
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

  form.addEventListener("submit", async function(e) {
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
      to_email: 'info@divyjyotfoundation.com'
    };
    
    try {
      if (isEmailJSConfigured() && typeof emailjs !== 'undefined') {
        // Send notification to organization
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.CONTACT_ORG, templateParams);
        // Send auto-acknowledgement to submitter (if configured)
        if (EMAILJS_CONFIG.TEMPLATES.CONTACT_USER && EMAILJS_CONFIG.TEMPLATES.CONTACT_USER !== 'YOUR_CONTACT_USER_TEMPLATE_ID') {
          await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.CONTACT_USER, templateParams);
        }
      } else {
        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("SIMULATION SUCCESS - Contact Form Parameters:", templateParams);
      }
      
      showFormAlert(form, "success", "Thank you! Your message has been sent successfully. An acknowledgement email has been sent to " + emailEl.value + ".");
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

  form.addEventListener("submit", async function(e) {
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
      to_email: 'info@divyjyotfoundation.com'
    };
    
    try {
      if (isEmailJSConfigured() && typeof emailjs !== 'undefined') {
        // Send notification to organization
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.VOLUNTEER_ORG, templateParams);
        // Send auto-acknowledgement
        if (EMAILJS_CONFIG.TEMPLATES.VOLUNTEER_USER && EMAILJS_CONFIG.TEMPLATES.VOLUNTEER_USER !== 'YOUR_VOLUNTEER_USER_TEMPLATE_ID') {
          await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.VOLUNTEER_USER, templateParams);
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

  // Enable/Disable submit button based on screenshot upload
  if (fileInput && submitBtn) {
    fileInput.addEventListener("change", function() {
      if (fileInput.files && fileInput.files[0]) {
        submitBtn.removeAttribute("disabled");
        setFieldValidation(fileInput, true);
      } else {
        submitBtn.setAttribute("disabled", "true");
        setFieldValidation(fileInput, false, "Please upload a proof of payment screenshot");
      }
    });
  }

  form.addEventListener("submit", async function(e) {
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
      to_email: 'info@divyjyotfoundation.com'
    };
    
    try {
      if (isEmailJSConfigured() && typeof emailjs !== 'undefined') {
        // Send notification to organization
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.DONATE_ORG, templateParams);
        // Send auto-acknowledgement
        if (EMAILJS_CONFIG.TEMPLATES.DONATE_USER && EMAILJS_CONFIG.TEMPLATES.DONATE_USER !== 'YOUR_DONATE_USER_TEMPLATE_ID') {
          await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.DONATE_USER, templateParams);
        }
      } else {
        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("SIMULATION SUCCESS - Donation Form Parameters:", templateParams);
      }
      
      showFormAlert(form, "success", "Donation details and proof of payment submitted successfully! Thank you for supporting Divy Jyot Foundation. A confirmation email has been sent to " + emailEl.value + ".");
      form.reset();
      if (submitBtn) submitBtn.setAttribute("disabled", "true");
      
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
