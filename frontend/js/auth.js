const USER_KEY = "math_app_user_id";

function getUserId() {
  return sessionStorage.getItem(USER_KEY);
}

function setUserId(id) {
  sessionStorage.setItem(USER_KEY, id.trim());
}

function clearUserId() {
  sessionStorage.removeItem(USER_KEY);
}

function requireAuth() {
  if (!getUserId()) {
    window.location.href = "/index.html";
  }
}
