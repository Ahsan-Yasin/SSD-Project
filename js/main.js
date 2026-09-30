"use strict";

const navigationToggle = document.querySelector(".nav-toggle");
const siteNavigation = document.querySelector(".site-nav");

if (navigationToggle && siteNavigation) {
    navigationToggle.addEventListener("click", () => {
        const isExpanded = navigationToggle.getAttribute("aria-expanded") === "true";
        navigationToggle.setAttribute("aria-expanded", String(!isExpanded));
        navigationToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
        siteNavigation.classList.toggle("is-open", !isExpanded);
    });

    siteNavigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            navigationToggle.setAttribute("aria-expanded", "false");
            navigationToggle.setAttribute("aria-label", "Open navigation");
            siteNavigation.classList.remove("is-open");
        }
    });
}

document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
    yearElement.textContent = String(new Date().getFullYear());
});