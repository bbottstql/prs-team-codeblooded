import { IUser } from "../users/IUser";
import { IRequest } from "./IRequest";

export function canReviewRequest(
  request: IRequest | undefined,
  user: IUser | undefined,
) {
  return Boolean(
    user?.isReviewer &&
    request?.userId !== user.id &&
    request?.status === "REVIEW",
  );
}
