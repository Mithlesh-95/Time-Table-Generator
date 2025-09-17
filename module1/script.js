// DOM Elements
const loginCard = document.getElementById("loginCard")
const registerCard = document.getElementById("registerCard")
const successMessage = document.getElementById("successMessage")
const showRegisterBtn = document.getElementById("showRegister")
const showLoginBtn = document.getElementById("showLogin")
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")

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

  // Simulate API call
  setTimeout(() => {
    button.disabled = false
    buttonText.style.opacity = "1"
    spinner.style.display = "none"

    // Show success message if present (guarded)
    if (successMessage) {
      loginCard.style.display = "none"
      successMessage.style.display = "block"
      const successTextEl = document.getElementById("successText")
      if (successTextEl) successTextEl.textContent = "You have been successfully logged in!"
      successMessage.classList.add("show")
    }
  }, 2000)
})

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("registerName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const agreeTerms = document.getElementById("agreeTerms").checked
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

  if (!isValid) return

  // Show loading state
  button.disabled = true
  buttonText.style.opacity = "0"
  spinner.style.display = "block"

  // Simulate API call
  setTimeout(() => {
    button.disabled = false
    buttonText.style.opacity = "1"
    spinner.style.display = "none"

    // After successful registration, redirect to Sign In view
    registerCard.style.display = "none"
    loginCard.style.display = "block"
    // Optional: pre-fill the email field with the registered email
    const loginEmailInput = document.getElementById("loginEmail")
    if (loginEmailInput) loginEmailInput.value = email

    // If there is a successMessage element, keep it hidden to avoid conflicting UI
    if (successMessage) {
      successMessage.style.display = "none"
    }
  }, 2000)
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
