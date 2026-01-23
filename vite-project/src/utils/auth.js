export const isTokenValid = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return false;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));

    if (!payload.exp) return false;

    return payload.exp * 1000 > Date.now();
  } catch (err) {
    console.error("Token validation failed", err);
    return false;
  }
};
