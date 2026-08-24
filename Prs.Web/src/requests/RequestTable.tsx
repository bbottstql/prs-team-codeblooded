import { useState, useEffect, SyntheticEvent } from "react";
import bootstrapIcons from "../assets/bootstrap-icons.svg";
import { IRequest } from "./IRequest";
import { requestAPI } from "./RequestAPI";
import RequestRow from "./RequestRow";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { IUser } from "../users/IUser";
import { userAPI } from "../users/UserAPI";
import { useUserContext } from "../App";

function RequestTable() {
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authenticatedUser } = useUserContext();
  const status = searchParams.get("status") ?? undefined;
  const selectedUserId = searchParams.get("userId");
  const selectedExcludeUserId = searchParams.get("excludeUserId");
  const userId = selectedUserId ? Number(selectedUserId) : undefined;
  const excludeUserId = selectedExcludeUserId
    ? Number(selectedExcludeUserId)
    : undefined;
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") as "status" | "total" | null;
  const direction = searchParams.get("dir") === "desc" ? "desc" : "asc";

  async function loadUsers() {
    try {
      const data = await userAPI.list();
      setUsers(data);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load users.",
        {
          duration: 6000,
        },
      );
    }
  }

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await requestAPI.list(status, userId, excludeUserId);
        setRequests(data);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load requests.",
          { duration: 6000 },
        );
      }
    }

    fetchRequests();
  }, [status, userId, excludeUserId]);

  useEffect(() => {
    loadUsers();
  }, []);

  function removeRequest(request: IRequest) {
    setRequests(requests.filter((r) => r.id !== request.id));
  }

  function handleFilterChange(event: SyntheticEvent) {
    const { name, value } = event.target as
      | HTMLInputElement
      | HTMLSelectElement;
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (name === "userId" && value === "anyone-else") {
        nextParams.delete("userId");
        if (authenticatedUser?.id !== undefined) {
          nextParams.set("excludeUserId", authenticatedUser.id.toString());
        }
      } else if (name === "userId") {
        nextParams.delete("excludeUserId");
        if (value) {
          nextParams.set(name, value);
        } else {
          nextParams.delete(name);
        }
      } else if (value) {
        nextParams.set(name, value);
      } else {
        nextParams.delete(name);
      }
      return nextParams;
    });
  }

  function handleSortChange(column: "status" | "total") {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      const nextDirection =
        sort === column && direction === "asc" ? "desc" : "asc";
      nextParams.set("sort", column);
      nextParams.set("dir", nextDirection);
      return nextParams;
    });
  }

  async function exportRequests() {
    try {
      const { blob, filename } = await requestAPI.export(status);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to export requests.",
        { duration: 6000 },
      );
    }
  }

  const otherUsers = users.filter((user) => user.id !== authenticatedUser?.id);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleRequests = requests
    .filter(
      (request) =>
        !normalizedSearch ||
        request.description.toLowerCase().includes(normalizedSearch) ||
        request.justification.toLowerCase().includes(normalizedSearch),
    )
    .sort((firstRequest, secondRequest) => {
      if (!sort) return 0;
      const firstValue =
        sort === "total" ? firstRequest.total : firstRequest.status;
      const secondValue =
        sort === "total" ? secondRequest.total : secondRequest.status;
      const comparison =
        typeof firstValue === "number" && typeof secondValue === "number"
          ? firstValue - secondValue
          : String(firstValue).localeCompare(String(secondValue));
      return direction === "asc" ? comparison : -comparison;
    });

  return (
    <>
      <div className="d-flex flex-column mb-4 w-25">
        <label htmlFor="search" className="form-label">
          Search
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <svg className="bi" width={18} height={18} fill="currentColor">
              <use xlinkHref={`${bootstrapIcons}#search`} />
            </svg>
          </span>
          <input
            id="search"
            name="search"
            type="search"
            className="form-control border-start-0"
            placeholder="Search requests"
            value={search}
            onChange={handleFilterChange}
          />
        </div>
      </div>
      <div className="d-flex flex-column mb-4 w-25">
        <label htmlFor="status" className="form-label">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="form-select"
          value={searchParams.get("status") ?? ""}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="NEW">New</option>
          <option value="REVIEW">Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      <div className="d-flex flex-column mb-4 w-25">
        <label htmlFor="userId" className="form-label">
          Requested by
        </label>
        <select
          id="userId"
          name="userId"
          className="form-select"
          value={selectedExcludeUserId ? "anyone-else" : (selectedUserId ?? "")}
          onChange={handleFilterChange}
        >
          <option value="">Anyone</option>
          {authenticatedUser?.isReviewer && (
            <option value="anyone-else">Anyone else</option>
          )}
          {authenticatedUser && (
            <option value={authenticatedUser.id}>
              {authenticatedUser.firstName} {authenticatedUser.lastName} (you)
            </option>
          )}
          {otherUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="btn btn-primary mb-4"
        onClick={exportRequests}
      >
        <svg className="bi me-2" width={18} height={18} fill="currentColor">
          <use xlinkHref={`${bootstrapIcons}#cloud-download`} />
        </svg>
        Export CSV
      </button>
      <section className="list d-flex flex-row flex-wrap bg-body-tertiary gap-5 p-4 rounded-4">
        <table className="table table-hover w-75 table rounded-4">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Description</th>
              <th scope="col">
                <button
                  type="button"
                  className="btn btn-link p-0 text-body text-decoration-none"
                  onClick={() => handleSortChange("status")}
                >
                  Status{" "}
                  {sort === "status" && (direction === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  className="btn btn-link p-0 text-body text-decoration-none"
                  onClick={() => handleSortChange("total")}
                >
                  Total {sort === "total" && (direction === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th scope="col">Requested By</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleRequests.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                onRemove={removeRequest}
              />
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default RequestTable;
