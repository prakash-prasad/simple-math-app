document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("user-id-input");
  const goBtn = document.getElementById("go-btn");
  const errorMsg = document.getElementById("error-msg");

  function validate() {
    return input.value.trim().length > 0;
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add("visible");
    input.classList.add("input-error");
  }

  function clearError() {
    errorMsg.classList.remove("visible");
    input.classList.remove("input-error");
  }

  // Live validation: enable/disable GO button
  input.addEventListener("input", () => {
    goBtn.disabled = !validate();
    if (validate()) clearError();
  });

  // GO button click
  goBtn.addEventListener("click", () => {
    const val = input.value.trim();
    if (!val) {
      showError("Please enter a User ID to continue.");
      input.focus();
      return;
    }
    setUserId(val);
    window.location.href = "/app.html";
  });

  // Allow Enter key
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !goBtn.disabled) {
      goBtn.click();
    }
  });

  // Focus input on load
  input.focus();
});
