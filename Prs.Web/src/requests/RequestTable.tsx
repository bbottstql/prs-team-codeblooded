import { useState, useEffect, SyntheticEvent } from "react";
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
    const { name, value } = event.target as HTMLSelectElement;
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

  const otherUsers = users.filter((user) => user.id !== authenticatedUser?.id);

  return (
    <>
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
      <section className="list d-flex flex-row flex-wrap bg-body-tertiary gap-5 p-4 rounded-4">
        <table className="table table-hover w-75 table rounded-4">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Description</th>
              <th scope="col">Status</th>
              <th scope="col">Total</th>
              <th scope="col">Requested By</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
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
