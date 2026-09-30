"use strict";

// This sessionStorage check only supports a prototype flow. It is NOT real security; real authentication and authorization must be enforced by the backend.
let hasDemoAccess = false;

try {
    hasDemoAccess = sessionStorage.getItem("staffhubDemoAccess") === "active";
} catch {
    hasDemoAccess = false;
}

if (!hasDemoAccess) {
    window.location.replace("login.html");
} else {
    const logoutButton = document.querySelector("#logout-button");
    const leaveForm = document.querySelector("#leave-form");
    const leaveType = document.querySelector("#leave-type");
    const startDate = document.querySelector("#start-date");
    const endDate = document.querySelector("#end-date");
    const reasonInput = document.querySelector("#reason");
    const reasonCounter = document.querySelector("#reason-counter");
    const leaveList = document.querySelector("#leave-list");
    const statusFilter = document.querySelector("#status-filter");
    const historyStatus = document.querySelector("#history-status");
    const emptyHistory = document.querySelector("#empty-history");
    const cancelDialog = document.querySelector("#cancel-dialog");
    const confirmCancelButton = document.querySelector("#confirm-cancel");
    const keepRequestButton = document.querySelector("#keep-request");
    const formError = document.querySelector("#leave-form-error");
    let requestSequence = 0;
    let requestToCancel = null;
    let cancelButtonToRestore = null;

    function localDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    startDate.min = localDateString();
    endDate.min = localDateString();

    logoutButton.addEventListener("click", () => {
        try {
            sessionStorage.removeItem("staffhubDemoAccess");
        } finally {
            window.location.assign("index.html");
        }
    });

    function clearLeaveErrors() {
        formError.textContent = "";
        formError.hidden = true;
        ["leave-type", "start-date", "end-date"].forEach((fieldId) => {
            document.querySelector(`#${fieldId}`).removeAttribute("aria-invalid");
            document.querySelector(`#${fieldId}-error`).textContent = "";
        });
    }

    function validateLeaveForm() {
        clearLeaveErrors();
        let firstInvalidField = null;
        const today = localDateString();

        if (!leaveType.value) {
            leaveType.setAttribute("aria-invalid", "true");
            document.querySelector("#leave-type-error").textContent = "Choose a leave type.";
            firstInvalidField = firstInvalidField || leaveType;
        }

        if (!startDate.value) {
            startDate.setAttribute("aria-invalid", "true");
            document.querySelector("#start-date-error").textContent = "Choose a start date.";
            firstInvalidField = firstInvalidField || startDate;
        } else if (startDate.value < today) {
            startDate.setAttribute("aria-invalid", "true");
            document.querySelector("#start-date-error").textContent = "Start date cannot be in the past.";
            firstInvalidField = firstInvalidField || startDate;
        }

        if (!endDate.value) {
            endDate.setAttribute("aria-invalid", "true");
            document.querySelector("#end-date-error").textContent = "Choose an end date.";
            firstInvalidField = firstInvalidField || endDate;
        } else if (startDate.value && endDate.value < startDate.value) {
            endDate.setAttribute("aria-invalid", "true");
            document.querySelector("#end-date-error").textContent = "End date cannot be before the start date.";
            firstInvalidField = firstInvalidField || endDate;
        }

        if (reasonInput.value.length > 200) {
            reasonInput.setAttribute("aria-invalid", "true");
            formError.textContent = "Keep the reason to 200 characters or fewer.";
            formError.hidden = false;
            firstInvalidField = firstInvalidField || reasonInput;
        }

        if (firstInvalidField) {
            if (!formError.textContent) {
                formError.textContent = "Check the highlighted fields and try again.";
                formError.hidden = false;
            }
            firstInvalidField.focus();
            return false;
        }

        return true;
    }

    startDate.addEventListener("change", () => {
        endDate.min = startDate.value || localDateString();
    });

    leaveForm.addEventListener("input", (event) => {
        if (event.target.matches("#reason")) {
            reasonCounter.textContent = `${reasonInput.value.length} / 200`;
            reasonInput.removeAttribute("aria-invalid");
        }
    });

    leaveForm.addEventListener("change", (event) => {
        if (event.target.matches("#leave-type, #start-date, #end-date")) {
            event.target.removeAttribute("aria-invalid");
            document.querySelector(`#${event.target.id}-error`).textContent = "";
            formError.textContent = "";
            formError.hidden = true;
        }
    });

    function formatDate(dateValue) {
        const date = new Date(`${dateValue}T00:00:00`);
        return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
    }

    function createRequestItem(request) {
        const item = document.createElement("li");
        item.className = "leave-item";
        item.dataset.status = "pending";
        item.dataset.requestId = request.id;

        const main = document.createElement("div");
        main.className = "leave-item-main";
        const heading = document.createElement("div");
        heading.className = "leave-item-heading";
        const title = document.createElement("h3");
        title.textContent = `${request.type} leave`;
        const badge = document.createElement("span");
        badge.className = "status-badge status-pending";
        badge.textContent = "Pending";
        heading.append(title, badge);

        const dates = document.createElement("p");
        dates.className = "leave-dates";
        dates.textContent = `${formatDate(request.start)} to ${formatDate(request.end)}`;
        main.append(heading, dates);

        if (request.reason) {
            const reason = document.createElement("p");
            reason.className = "leave-dates request-reason";
            const reasonLabel = document.createElement("span");
            reasonLabel.textContent = "Reason: ";
            const reasonText = document.createElement("span");
            // User-provided reason text is assigned with textContent, never innerHTML, to prevent markup execution and XSS.
            reasonText.textContent = request.reason;
            reason.append(reasonLabel, reasonText);
            main.append(reason);
        }

        const cancelButton = document.createElement("button");
        cancelButton.className = "text-button cancel-request";
        cancelButton.type = "button";
        cancelButton.dataset.action = "cancel";
        cancelButton.setAttribute("aria-label", `Cancel pending ${request.type.toLowerCase()} leave request`);
        cancelButton.textContent = "Cancel request";
        item.append(main, cancelButton);
        return item;
    }

    function updateHistoryFilter() {
        const requestedStatus = statusFilter.value;
        let visibleCount = 0;

        leaveList.querySelectorAll(".leave-item").forEach((item) => {
            const matches = requestedStatus === "all" || item.dataset.status === requestedStatus;
            item.hidden = !matches;
            if (matches) {
                visibleCount += 1;
            }
        });

        emptyHistory.hidden = visibleCount !== 0;
        historyStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "request" : "requests"} shown.`;
    }

    reasonInput.addEventListener("input", () => {
        reasonCounter.textContent = `${reasonInput.value.length} / 200`;
    });

    leaveForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!validateLeaveForm()) {
            return;
        }

        requestSequence += 1;
        const request = {
            id: `new-request-${requestSequence}`,
            type: leaveType.value,
            start: startDate.value,
            end: endDate.value,
            reason: reasonInput.value.trim()
        };

        leaveList.prepend(createRequestItem(request));
        statusFilter.value = "all";
        updateHistoryFilter();
        leaveForm.reset();
        endDate.min = localDateString();
        reasonCounter.textContent = "0 / 200";
        clearLeaveErrors();
        historyStatus.textContent = "Leave request added with Pending status.";
    });

    statusFilter.addEventListener("change", updateHistoryFilter);
    updateHistoryFilter();

    leaveList.addEventListener("click", (event) => {
        const cancelButton = event.target.closest('button[data-action="cancel"]');
        if (!cancelButton) {
            return;
        }

        const requestItem = cancelButton.closest(".leave-item");
        if (!requestItem || requestItem.dataset.status !== "pending") {
            return;
        }

        requestToCancel = requestItem;
        cancelButtonToRestore = cancelButton;
        cancelDialog.showModal();
    });

    function closeCancelDialog(restoreFocus) {
        cancelDialog.close();
        if (restoreFocus) {
            if (cancelButtonToRestore?.isConnected) {
                cancelButtonToRestore.focus();
            } else {
                statusFilter.focus();
            }
        }
        requestToCancel = null;
        cancelButtonToRestore = null;
    }

    keepRequestButton.addEventListener("click", () => closeCancelDialog(true));

    confirmCancelButton.addEventListener("click", () => {
        if (requestToCancel?.isConnected && requestToCancel.dataset.status === "pending") {
            requestToCancel.remove();
            updateHistoryFilter();
            historyStatus.textContent = "Pending leave request cancelled.";
        }
        closeCancelDialog(true);
    });

    cancelDialog.addEventListener("click", (event) => {
        if (event.target === cancelDialog) {
            closeCancelDialog(true);
        }
    });
}