// const API_BASE = "http://localhost:3005";

// const request = async (path, options = {}) => {
//   const response = await fetch(`${API_BASE}${path}`, {
//     headers: { "Content-Type": "application/json" },
//     ...options,
//   });

//   if (!response.ok) {
//     const message = await response.text();
//     throw new Error(message || "Error en la petición");
//   }

//   if (response.status === 204) {
//     return null;
//   }

//   return response.json();
// };

// export const api = {
//   get: (path) => request(path),
//   post: (path, data) =>
//     request(path, { method: "POST", body: JSON.stringify(data) }),
//   put: (path, data) =>
//     request(path, { method: "PUT", body: JSON.stringify(data) }),
//   patch: (path, data) =>
//     request(path, { method: "PATCH", body: JSON.stringify(data) }),
//   del: (path) => request(path, { method: "DELETE" }),
// };

// export const getSession = () =>
//   JSON.parse(localStorage.getItem("auth_user") || "null");

// export const setSession = (user) =>
//   localStorage.setItem("auth_user", JSON.stringify(user));

// export const clearSession = () => localStorage.removeItem("auth_user");








// api.js
const API_BASE = "http://localhost:3005";

// GET
export const getData = async (endpoint) => {
  const res = await fetch(API_BASE + endpoint);

  if (!res.ok) return null;

  return res.json();
};

// POST
export const postData = async (endpoint, data) => {
  const res = await fetch(API_BASE + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) return null;

  return res.json();
};

// PUT
export const putData = async (endpoint, data) => {
  const res = await fetch(API_BASE + endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) return null;

  return res.json();
};

// DELETE
export const deleteData = async (endpoint) => {
  const res = await fetch(API_BASE + endpoint, {
    method: "DELETE",
  });

  return res.ok;
};

/* ======================
   SESIÓN
====================== */

export const getSession = () => {
  return JSON.parse(localStorage.getItem("auth_user"));
};

export const setSession = (user) => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("auth_user");
};
