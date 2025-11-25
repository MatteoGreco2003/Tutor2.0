// public/js/api.js

async function apiCall(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ Token non trovato in localStorage");
    window.location.href = "/login";
    return null;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      console.error("❌ Token scaduto o non valido");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return null;
    }

    return response;
  } catch (error) {
    console.error("❌ Errore fetch:", error);
    return null;
  }
}
