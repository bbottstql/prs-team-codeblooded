import { describe, expect, it } from "vitest";
import { canReviewRequest } from "./requestUtilities";
import { IRequest } from "./IRequest";
import { IUser } from "../users/IUser";

const request: IRequest = {
  id: 1,
  description: "Laptop",
  justification: "Replacement",
  rejectionReason: undefined,
  deliveryMode: "Delivery",
  status: "REVIEW",
  total: 100,
  userId: 2,
  requestLines: [],
};

const reviewer: IUser = {
  id: 3,
  username: "reviewer",
  password: "",
  firstName: "Review",
  lastName: "Er",
  phone: "",
  email: "",
  isReviewer: true,
  isAdmin: false,
};

describe("canReviewRequest", () => {
  it("allows a reviewer to review someone else's request in REVIEW", () => {
    expect(canReviewRequest(request, reviewer)).toBe(true);
  });

  it("rejects non-reviewers, owners, and requests outside REVIEW", () => {
    expect(canReviewRequest(request, { ...reviewer, isReviewer: false })).toBe(
      false,
    );
    expect(canReviewRequest(request, { ...reviewer, id: request.userId })).toBe(
      false,
    );
    expect(canReviewRequest({ ...request, status: "NEW" }, reviewer)).toBe(
      false,
    );
  });
});
