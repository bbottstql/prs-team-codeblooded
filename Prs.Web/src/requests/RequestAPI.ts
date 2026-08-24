import { BASE_URL, checkStatus, parseJSON } from "../utility/fetchUtilities";
import { IRequest } from "./IRequest";

const url = `${BASE_URL}/requests`;

export const requestAPI = {
<<<<<<< HEAD
  list(status?: string): Promise<IRequest[]> {
    let requestsUrl = `${url}`;
    if (status) requestsUrl += `?status=${status.toUpperCase()}`;
=======
  list(
    status?: string,
    userId?: number,
    excludeUserId?: number,
  ): Promise<IRequest[]> {
    let requestsUrl = `${url}`;
    const searchParams = new URLSearchParams();
    if (status) searchParams.set("status", status.toUpperCase());
    if (userId) searchParams.set("userId", userId.toString());
    if (excludeUserId) {
      searchParams.set("excludeUserId", excludeUserId.toString());
    }
    const query = searchParams.toString();
    if (query) requestsUrl += `?${query}`;
>>>>>>> main
    return fetch(requestsUrl).then(checkStatus).then(parseJSON);
  },

  find(id: number): Promise<IRequest> {
    return fetch(`${url}/${id}`).then(checkStatus).then(parseJSON);
  },

  post(request: IRequest) {
    return fetch(`${url}`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  put(request: IRequest) {
    return fetch(`${url}/${request.id}`, {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  delete(id: number) {
    return fetch(`${url}/${id}`, { method: "DELETE" }).then(checkStatus);
  },

  review(request: IRequest) {
    return fetch(`${url}/review/${request.id}`, {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  approve(request: IRequest) {
    return fetch(`${url}/approve/${request.id}`, {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  reject(id: number, rejectionReason: string) {
    return fetch(`${url}/reject/${id}`, {
      method: "PUT",
      body: JSON.stringify(rejectionReason),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(checkStatus);
  },
};
