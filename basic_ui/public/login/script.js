// DOM Elements
const loginCard = document.getElementById("loginCard")
const registerCard = document.getElementById("registerCard")
const successMessage = document.getElementById("successMessage")
const showRegisterBtn = document.getElementById("showRegister")
const showLoginBtn = document.getElementById("showLogin")
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const toastEl = document.getElementById("toast")

// API base resolution (tries multiple options)
function resolveApiBases() {
  const bases = []
  try {
    const origin = window.location.origin // e.g., http://localhost:3000
    // Map Next.js dev port 3000 to Django 8000
    const mapped = origin.replace(/:(\d+)$/, (m, p) => `:${p === "3000" ? "8000" : p}`)
    bases.push(`${mapped}/api`)
  } catch (_) {}
  bases.push("http://127.0.0.1:8000/api")
  bases.push("http://localhost:8000/api")
  return Array.from(new Set(bases))
}

const API_BASES = resolveApiBases()

async function tryFetchWithBases(path, options) {
  let lastErr
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, options)
      return { res, base }
    } catch (e) {
      lastErr = e
    }
  }
  if (lastErr) throw lastErr
  throw new Error("All API base attempts failed")
}

async function apiFetch(path, options = {}) {
  const { res } = await tryFetchWithBases(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "omit",
    ...options,
  })
  const isJson = res.headers.get("content-type")?.includes("application/json")
  const body = isJson ? await res.json().catch(() => ({})) : null
  // Handle our custom renderer envelope { success, data, message, errors }
  const hasEnvelope = body && typeof body === "object" && Object.prototype.hasOwnProperty.call(body, "success") && Object.prototype.hasOwnProperty.call(body, "data")
  if (!res.ok || (hasEnvelope && body.success === false)) {
    const message = (hasEnvelope ? body.message : body?.detail) || "Request failed"
    const err = new Error(message)
    err.status = res.status
    err.data = (hasEnvelope ? body.errors || body : body)
    throw err
  }
  if (hasEnvelope) {
    return body.data
  }
  return body
}

// Form switching
showRegisterBtn.addEventListener("click", (e) => {
  e.preventDefault()
  loginCard.style.display = "none"
  registerCard.style.display = "block"
  if (successMessage) successMessage.style.display = "none"
})

showLoginBtn.addEventListener("click", (e) => {
  e.preventDefault()
  registerCard.style.display = "none"
  loginCard.style.display = "block"
  if (successMessage) successMessage.style.display = "none"
})

// Modal and toast utilities
const modalOverlay = document.getElementById("modalOverlay")
const errorModal = document.getElementById("errorModal")
const modalTitle = document.getElementById("modalTitle")
const modalBody = document.getElementById("modalBody")
const modalClose = document.getElementById("modalClose")
const modalPrimary = document.getElementById("modalPrimary")
const modalSecondary = document.getElementById("modalSecondary")

function hideModal() {
  if (modalOverlay) modalOverlay.style.display = "none"
  if (errorModal) errorModal.style.display = "none"
  if (modalPrimary) {
    modalPrimary.style.display = "none"
    modalPrimary.onclick = null
  }
  if (modalSecondary) {
    modalSecondary.style.display = "none"
    modalSecondary.onclick = null
  }
}

function showModal({ title = "Notice", message = "", primaryText, onPrimary, secondaryText, onSecondary }) {
  if (!errorModal || !modalOverlay) {
    alert(message || title)
    return
  }
  modalTitle.textContent = title
  modalBody.textContent = message
  if (primaryText) {
    modalPrimary.textContent = primaryText
    modalPrimary.style.display = "inline-block"
    modalPrimary.onclick = () => {
      if (typeof onPrimary === "function") onPrimary()
      hideModal()
    }
  }
  if (secondaryText) {
    modalSecondary.textContent = secondaryText
    modalSecondary.style.display = "inline-block"
    modalSecondary.onclick = () => {
      if (typeof onSecondary === "function") onSecondary()
      hideModal()
    }
  }
  modalOverlay.style.display = "block"
  errorModal.style.display = "block"
}

if (modalClose) modalClose.addEventListener("click", hideModal)
if (modalOverlay) modalOverlay.addEventListener("click", hideModal)

function showToast(message = "") {
  const toast = document.getElementById("toast")
  if (!toast) return
  toast.textContent = message
  toast.style.display = "block"
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => {
    toast.style.display = "none"
  }, 2500)
}

// Colleges handling
async function ensureColleges() {
  // Try to get colleges
  let data = await apiFetch("/colleges/?ordering=code", { method: "GET" })
  if (Array.isArray(data) && data.length === 0) {
    // Create a default college if none exist
    try {
      await apiFetch("/colleges/", {
        method: "POST",
        body: JSON.stringify({ name: "Default College", code: "DEF" }),
      })
    } catch (_) {
      // ignore create error (e.g., unique violation race)
    }
    // Re-fetch
    data = await apiFetch("/colleges/?ordering=code", { method: "GET" })
  }
  return data
}

async function loadCollegesIntoSelect() {
  const select = document.getElementById("registerCollege")
  if (!select) return
  try {
    const colleges = await ensureColleges()
    // Clear existing
    select.innerHTML = ""
    // Add a placeholder
    const ph = document.createElement("option")
    ph.value = ""
    ph.disabled = true
    ph.selected = true
    ph.textContent = "Select your college"
    select.appendChild(ph)
    // Populate
    colleges.forEach((c) => {
      const opt = document.createElement("option")
      opt.value = c.id
      opt.textContent = `${c.code} - ${c.name}`
      select.appendChild(opt)
    })
  } catch (e) {
    // Show an error in the placeholder
    select.innerHTML = ""
    const errOpt = document.createElement("option")
    errOpt.value = ""
    errOpt.disabled = true
    errOpt.selected = true
    errOpt.textContent = "Failed to load colleges"
    select.appendChild(errOpt)
  }
}

// Load colleges on page load
window.addEventListener("DOMContentLoaded", loadCollegesIntoSelect)

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  return password.length >= 8
}

function calculatePasswordStrength(password) {
  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 25
  return strength
}

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId)
  const error = document.getElementById(errorId)
  input.classList.add("error")
  input.classList.remove("success")
  error.textContent = message
  error.classList.add("show")
}

function showSuccess(inputId, errorId) {
  const input = document.getElementById(inputId)
  const error = document.getElementById(errorId)
  input.classList.remove("error")
  input.classList.add("success")
  error.classList.remove("show")
}

function clearValidation(inputId, errorId) {
  const input = document.getElementById(inputId)
  const error = document.getElementById(errorId)
  input.classList.remove("error", "success")
  error.classList.remove("show")
}

// Password strength indicator
const registerPassword = document.getElementById("registerPassword")
const strengthFill = document.querySelector(".strength-fill")
const strengthText = document.querySelector(".strength-text")

registerPassword.addEventListener("input", (e) => {
  const password = e.target.value
  const strength = calculatePasswordStrength(password)

  strengthFill.style.width = strength + "%"

  if (strength === 0) {
    strengthFill.style.background = "#e2e8f0"
    strengthText.textContent = "Password strength"
    strengthText.style.color = "#718096"
  } else if (strength < 50) {
    strengthFill.style.background = "#e53e3e"
    strengthText.textContent = "Weak password"
    strengthText.style.color = "#e53e3e"
  } else if (strength < 75) {
    strengthFill.style.background = "#ed8936"
    strengthText.textContent = "Fair password"
    strengthText.style.color = "#ed8936"
  } else if (strength < 100) {
    strengthFill.style.background = "#38a169"
    strengthText.textContent = "Good password"
    strengthText.style.color = "#38a169"
  } else {
    strengthFill.style.background = "#00bcd4"
    strengthText.textContent = "Strong password"
    strengthText.style.color = "#00bcd4"
  }
})

// Real-time validation
document.getElementById("loginEmail").addEventListener("blur", (e) => {
  const email = e.target.value
  if (!email) {
    showError("loginEmail", "loginEmailError", "Email is required")
  } else if (!validateEmail(email)) {
    showError("loginEmail", "loginEmailError", "Please enter a valid email")
  } else {
    showSuccess("loginEmail", "loginEmailError")
  }
})

document.getElementById("registerEmail").addEventListener("blur", (e) => {
  const email = e.target.value
  if (!email) {
    showError("registerEmail", "registerEmailError", "Email is required")
  } else if (!validateEmail(email)) {
    showError("registerEmail", "registerEmailError", "Please enter a valid email")
  } else {
    showSuccess("registerEmail", "registerEmailError")
  }
})

document.getElementById("confirmPassword").addEventListener("blur", (e) => {
  const password = document.getElementById("registerPassword").value
  const confirmPassword = e.target.value

  if (!confirmPassword) {
    showError("confirmPassword", "confirmPasswordError", "Please confirm your password")
  } else if (password !== confirmPassword) {
    showError("confirmPassword", "confirmPasswordError", "Passwords do not match")
  } else {
    showSuccess("confirmPassword", "confirmPasswordError")
  }
})

// Form submissions
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const button = document.getElementById("loginButton")
  const buttonText = button.querySelector(".button-text")
  const spinner = button.querySelector(".loading-spinner")

  // Validation
  let isValid = true

  if (!email) {
    showError("loginEmail", "loginEmailError", "Email is required")
    isValid = false
  } else if (!validateEmail(email)) {
    showError("loginEmail", "loginEmailError", "Please enter a valid email")
    isValid = false
  }

  if (!password) {
    showError("loginPassword", "loginPasswordError", "Password is required")
    isValid = false
  }

  if (!isValid) return

  // Show loading state
  button.disabled = true
  buttonText.style.opacity = "0"
  spinner.style.display = "block"
  try {
    // TokenObtainPairView expects username + password. We use email as username.
    const tokenData = await apiFetch("/auth/token/", {
      method: "POST",
      body: JSON.stringify({ username: email, password }),
    })
    // Store tokens on same origin
    localStorage.setItem("access_token", tokenData.access)
    localStorage.setItem("refresh_token", tokenData.refresh)

    // Optionally fetch current user
    try {
      const me = await apiFetch("/auth/me/", {
        headers: { Authorization: `Bearer ${tokenData.access}` },
      })
      console.log("Logged in user:", me)
    } catch (_) {}

    // Redirect to Next.js dashboard (same origin)
    window.location.href = "/dashboard"
  } catch (err) {
    // Immediate feedback
    showToast("Login failed. Check email/password.")
    showError("loginPassword", "loginPasswordError", "Invalid password or email")
    // Decide: wrong password or no account
    try {
      const existsData = await apiFetch(`/auth/email-exists/?email=${encodeURIComponent(email)}`, { method: "GET" })
      const exists = !!(existsData && (existsData.exists === true || existsData === true))
      if (exists) {
        // Wrong or invalid password
        showModal({
          title: "Invalid password",
          message: "The password you entered is incorrect. Please try again.",
          primaryText: "Try Again",
          onPrimary: () => {
            const pwd = document.getElementById("loginPassword")
            if (pwd) pwd.focus()
          },
          secondaryText: "Forgot Password?",
        })
        // Inline mark and toast
        showError("loginPassword", "loginPasswordError", "Invalid password. Please try again.")
        showError("loginEmail", "loginEmailError", "Account exists. Invalid password")
        showToast("Invalid password. Please try again.")
      } else {
        // No account exists for this email
        showModal({
          title: "No account found",
          message: "We couldn't find an account with this email. Would you like to create one?",
          primaryText: "Create Account",
          onPrimary: () => {
            loginCard.style.display = "none"
            registerCard.style.display = "block"
            const regEmail = document.getElementById("registerEmail")
            if (regEmail) regEmail.value = email
          },
          secondaryText: "Cancel",
        })
        showError("loginEmail", "loginEmailError", "No account found. Please register.")
      }
    } catch (_) {
      // Fallback generic message
      showModal({
        title: "Sign-in failed",
        message: err.message || "Invalid email or password",
        primaryText: "OK",
      })
    }
  } finally {
    button.disabled = false
    buttonText.style.opacity = "1"
    spinner.style.display = "none"
  }
})

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("registerName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const agreeTerms = document.getElementById("agreeTerms").checked
  const collegeSelect = document.getElementById("registerCollege")
  const collegeId = collegeSelect ? collegeSelect.value : ""
  const button = document.getElementById("registerButton")
  const buttonText = button.querySelector(".button-text")
  const spinner = button.querySelector(".loading-spinner")

  // Validation
  let isValid = true

  if (!name) {
    showError("registerName", "registerNameError", "Full name is required")
    isValid = false
  }

  if (!email) {
    showError("registerEmail", "registerEmailError", "Email is required")
    isValid = false
  } else if (!validateEmail(email)) {
    showError("registerEmail", "registerEmailError", "Please enter a valid email")
    isValid = false
  }

  if (!password) {
    showError("registerPassword", "registerPasswordError", "Password is required")
    isValid = false
  } else if (!validatePassword(password)) {
    showError("registerPassword", "registerPasswordError", "Password must be at least 8 characters")
    isValid = false
  }

  if (!confirmPassword) {
    showError("confirmPassword", "confirmPasswordError", "Please confirm your password")
    isValid = false
  } else if (password !== confirmPassword) {
    showError("confirmPassword", "confirmPasswordError", "Passwords do not match")
    isValid = false
  }

  if (!agreeTerms) {
    alert("Please agree to the Terms of Service")
    isValid = false
  }

  if (!collegeId) {
    showError("registerCollege", "registerCollegeError", "Please select your college")
    isValid = false
  }

  if (!isValid) return

  // Show loading state
  button.disabled = true
  buttonText.style.opacity = "0"
  spinner.style.display = "block"
  try {
    // Map role from UI to expected values
    const roleSelect = document.getElementById("role")
    const rawRole = (roleSelect?.value || "").toLowerCase()
    const role = rawRole.includes("super") ? "superadmin" : "admin"

    await apiFetch("/auth/register/", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        confirm_password: confirmPassword,
        role,
        college_id: Number(collegeId),
      }),
    })

    // After successful registration, redirect to Sign In view
    registerCard.style.display = "none"
    loginCard.style.display = "block"
    // Optional: pre-fill the email field with the registered email
    const loginEmailInput = document.getElementById("loginEmail")
    if (loginEmailInput) loginEmailInput.value = email

    if (successMessage) {
      successMessage.style.display = "none"
    }
  } catch (err) {
    const data = err.data || {}
    // Show field errors if provided by API
    if (data.email) showError("registerEmail", "registerEmailError", Array.isArray(data.email) ? data.email[0] : String(data.email))
    if (data.password) showError("registerPassword", "registerPasswordError", Array.isArray(data.password) ? data.password[0] : String(data.password))
    if (data.confirm_password) showError("confirmPassword", "confirmPasswordError", Array.isArray(data.confirm_password) ? data.confirm_password[0] : String(data.confirm_password))
    if (data.role) showError("role", "registerroleError", Array.isArray(data.role) ? data.role[0] : String(data.role))
    // Duplicate email -> show modal to login instead
    if (data.email && String(data.email).toLowerCase().includes("exists")) {
      showModal({
        title: "Already registered",
        message: "An account with this email already exists. Please sign in.",
        primaryText: "Go to Sign In",
        onPrimary: () => {
          registerCard.style.display = "none"
          loginCard.style.display = "block"
          const loginEmailInput = document.getElementById("loginEmail")
          if (loginEmailInput) loginEmailInput.value = email
        },
      })
    } else if (!data.email && !data.password && !data.confirm_password && !data.role) {
      showModal({
        title: "Registration failed",
        message: data.detail || "Please check your details and try again.",
        primaryText: "OK",
      })
    }
  } finally {
    button.disabled = false
    buttonText.style.opacity = "1"
    spinner.style.display = "none"
  }
})

// Clear validation on input
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    if (input.classList.contains("error")) {
      input.classList.remove("error")
      const errorElement = document.getElementById(input.id + "Error")
      if (errorElement) {
        errorElement.classList.remove("show")
      }
    }
  })
})
