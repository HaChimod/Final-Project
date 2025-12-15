const BASE_URL = "http://localhost:8081";

/**
 * fetchModel - Fetch a model from the web server, including credentials (cookie/session)
 *
 * @param {string} url      The URL to issue the GET request.
 * @param {object} options  Optional fetch options (method, headers, body, etc.)
 */
async function fetchModel(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      credentials: "include",
      ...options,
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("fetchModel error:", err);
    return null;
  }
}

export default fetchModel;
