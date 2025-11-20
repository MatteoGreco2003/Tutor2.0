// public/js/api.js

async function apiCall(url, options = {}) {
  const token = localStorage.getItem("token");

  console.log("=== DEBUG APICALL ===");
  console.log("URL:", url);
  console.log("Token trovato:", token ? "✅ SÌ" : "❌ NO");

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

  console.log("Headers inviati:", headers);

  try {
    const response = await fetch(url, { ...options, headers });

    console.log("Status risposta:", response.status);

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
