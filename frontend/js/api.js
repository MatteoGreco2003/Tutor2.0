/**
 * ============================================
 * API UTILITY FUNCTIONS
 * ============================================
 * Central API call handler with automatic token management
 * and authentication error handling
 */

/**
 * Make authenticated API calls with automatic token injection
 *
 * This function handles:
 * - Automatic token retrieval from localStorage
 * - Token validation and auto-logout on expiration
 * - Standard Authorization header setup
 * - Centralized error handling
 * - Automatic redirect to login on auth failure
 *
 * @param {string} url - The API endpoint URL (e.g., "/student/data", "/test")
 * @param {Object} options - Fetch options object
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} options.headers - Custom headers (merged with default headers)
 * @param {string|Object} options.body - Request body (for POST, PUT, PATCH)
 *
 * @returns {Promise<Response|null>} - Fetch response object or null on error
 *
 * @example
 * // GET request
 * const response = await apiCall("/student/data", {
 *   method: "GET"
 * });
 * const data = await response.json();
 *
 * @example
 * // POST request
 * const response = await apiCall("/test", {
 *   method: "POST",
 *   body: JSON.stringify({
 *     materialID: "123",
 *     data: "2025-12-02",
 *     argomento: "Capitolo 5",
 *     voto: 8.5
 *   })
 * });
 *
 * @example
 * // DELETE request
 * const response = await apiCall("/test/123", {
 *   method: "DELETE"
 * });
 */
async function apiCall(url, options = {}) {
  // Retrieve authentication token from localStorage
  const token = localStorage.getItem("token");

  // If no token found, user is not authenticated
  if (!token) {
    console.error("❌ Token non trovato in localStorage");
    window.location.href = "/login";
    return null;
  }

  // Build default headers with Authorization token
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers, // Allow custom headers override
  };

  try {
    // Execute fetch request with merged options and headers
    const response = await fetch(url, { ...options, headers });

    // Check if token is expired or invalid (401 Unauthorized)
    if (response.status === 401) {
      console.error("❌ Token scaduto o non valido");
      // Clear stored token
      localStorage.removeItem("token");
      // Redirect to login page
      window.location.href = "/login";
      return null;
    }

    // Return response object (caller handles JSON parsing)
    return response;
  } catch (error) {
    // Network error or other fetch failure
    console.error("❌ Errore fetch:", error);
    return null;
  }
}
