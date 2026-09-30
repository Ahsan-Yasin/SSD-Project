"use strict";

const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const loginError = document.querySelector("#login-error");
const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");

if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
        const shouldShowPassword = passwordInput.type === "password";
        passwordInput.type = shouldShowPassword ? "text" : "password";
        passwordToggle.setAttribute("aria-pressed", String(shouldShowPassword));
        passwordToggle.setAttribute("aria-label", shouldShowPassword ? "Hide password" : "Show password");
        passwordToggle.textContent = shouldShowPassword ? "Hide" : "Show";
    });
}

function clearLoginErrors() {
    loginError.textContent = "";
    loginError.hidden = true;
    emailError.textContent = "";
    passwordError.textContent = "";
    emailInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
}

loginForm.addEventListener("input", clearLoginErrors);

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearLoginErrors();

    const validEmailFormat = emailInput.validity.valid;
    const hasPassword = passwordInput.value.length > 0;

    if (!validEmailFormat) {
        emailInput.setAttribute("aria-invalid", "true");
        emailError.textContent = "Enter a valid email address.";
    }

    if (!hasPassword) {
        passwordInput.setAttribute("aria-invalid", "true");
        passwordError.textContent = "Enter your password.";
    }

    if (!validEmailFormat || !hasPassword) {
        // Authentication failures must use one generic message; this prototype does not verify credentials.
        loginError.textContent = "Invalid email or password.";
        loginError.hidden = false;
        (validEmailFormat ? passwordInput : emailInput).focus();
        return;
    }

    try {
        // This non-sensitive flag only demonstrates navigation. It is NOT real security; the backend must enforce authentication and authorization.
        sessionStorage.setItem("staffhubDemoAccess", "active");
    } catch {
        loginError.textContent = "This browser cannot start the prototype session. Enable session storage and try again.";
        loginError.hidden = false;
        return;
    }

    window.location.assign("portal.html");
});