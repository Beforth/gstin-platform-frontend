// Dashboard API (keys, usage, team). Role scoping is enforced by the server, not here.
import { del, get, patch, post } from "./http";

export const consoleApi = {
  overview: (days = 14) => get(`/console/overview?days=${days}`),
  keys: () => get("/console/keys"),
  createKey: (body) => post("/console/keys", body),
  revokeKey: (id) => del(`/console/keys/${id}`),
  usage: (days = 14, keyId) => get(`/console/usage?days=${days}${keyId ? `&key_id=${keyId}` : ""}`),
  requests: (limit = 50, keyId) => get(`/console/requests?limit=${limit}${keyId ? `&key_id=${keyId}` : ""}`),
  users: () => get("/console/users"),
  createUser: (body) => post("/console/users", body),
  updateUser: (id, body) => patch(`/console/users/${id}`, body),
  resetPassword: (id, body = {}) => post(`/console/users/${id}/reset-password`, body),
  sessions: () => get("/auth/sessions"),
  signOutOthers: () => del("/auth/sessions"),
};
