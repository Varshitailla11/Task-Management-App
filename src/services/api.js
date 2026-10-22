import { getToken } from "./authService";

export const apiRequest = async (
  url,
  options = {}
) => {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "API request failed"
    );
  }

  return data;
};