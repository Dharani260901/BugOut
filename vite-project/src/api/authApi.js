import api from "./axios";

/* -------- SIGNUP -------- */
export const signupApi = async (payload) => {
  const { data } = await api.post("/auth/signup", payload);

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

/* -------- LOGIN -------- */
export const loginApi = async (payload) => {
  const { data } = await api.post("/auth/login", payload);

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

/* -------- LOGOUT -------- */
export const logoutApi = async () => {
  await api.post("/auth/logout");

  localStorage.clear();
};
