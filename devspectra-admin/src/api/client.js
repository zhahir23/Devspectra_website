import { API_URL, DEMO_MODE } from '../config';
import { ApiError, messageFromResponse } from './errors';
import { mockRequest } from './mock';
import { storage } from './storage';

let unauthorizedHandler = null;

/** Dipanggil oleh AuthContext: apa yang dilakukan kalau backend bilang sesi tidak berlaku. */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

/**
 * Kirim permintaan ke backend.
 * - Token JWT otomatis ditambahkan sebagai "Authorization: Bearer ...".
 * - Respons JSON otomatis di-parse; respons teks biasa dikembalikan sebagai string.
 * - Kalau gagal, melempar ApiError yang berisi pesan dalam bahasa Indonesia.
 */
export async function request(method, path, { body, auth = true } = {}) {
  if (DEMO_MODE) return mockRequest(method, path, body);

  const headers = { Accept: 'application/json' };
  const token = storage.getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Tidak bisa terhubung ke backend di ${API_URL}. Pastikan server Spring Boot sedang berjalan.`,
      0,
    );
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const error = new ApiError(messageFromResponse(response.status, data), response.status, data);
    if (response.status === 401 && auth && unauthorizedHandler) unauthorizedHandler(error);
    throw error;
  }
  return data;
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  del: (path, options) => request('DELETE', path, options),
};
