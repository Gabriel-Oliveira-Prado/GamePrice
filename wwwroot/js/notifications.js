(function () {
    "use strict";

    const feedback = document.querySelector("[data-site-feedback]");
    if (!feedback) return;

    const type = feedback.dataset.feedbackType === "error" ? "error" : "success";
    const message = feedback.textContent.trim();

    if (!window.Swal) {
        feedback.hidden = false;
        return;
    }

    feedback.remove();
    window.Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: type === "error" ? 6000 : 4200,
        timerProgressBar: false,
        showClass: { popup: "" },
        hideClass: { popup: "" },
        customClass: {
            popup: "gameprice-alert",
            title: "gameprice-alert-title"
        }
    });
})();
