import { useState } from "react";
import toast from "react-hot-toast";
import { useUserContext } from "../App";
import { IComment } from "./IComment";
import { commentAPI } from "./CommentAPI";

interface ICommentSectionProps {
  requestId: number;
  comments: IComment[];
  onAdd: (comment: IComment) => void;
  onRemove: (comment: IComment) => void;
}

function CommentSection({
  requestId,
  comments,
  onAdd,
  onRemove,
}: ICommentSectionProps) {
  const { user } = useUserContext();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function addComment() {
    const trimmedBody = body.trim();
    if (!trimmedBody || !user?.id) return;

    setSaving(true);
    try {
      const comment = await commentAPI.post({
        id: undefined,
        body: trimmedBody,
        requestId,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      onAdd(comment);
      setBody("");
      toast.success("Comment added.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to add comment.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteComment(comment: IComment) {
    if (!comment.id || !user?.id) return;

    try {
      await commentAPI.delete(comment.id, user.id);
      onRemove(comment);
      toast.success("Comment deleted.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete comment.",
      );
    }
  }

  return (
    <div className="card p-4 mt-5">
      <h5 className="card-title">Comments ({comments.length})</h5>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {comments.map((comment) => (
            <article className="border-bottom pb-3" key={comment.id}>
              <div className="d-flex justify-content-between">
                <strong>
                  {comment.user?.firstName} {comment.user?.lastName}
                </strong>
                <small className="text-secondary">
                  {new Date(comment.createdAt).toLocaleString()}
                </small>
              </div>
              <p className="mb-2 mt-2">{comment.body}</p>
              {comment.userId === user?.id && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteComment(comment)}
                >
                  Delete
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      <label className="form-label" htmlFor="commentBody">
        Add a comment
      </label>
      <textarea
        id="commentBody"
        className="form-control mb-2"
        maxLength={500}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
      />
      <button
        type="button"
        className="btn btn-primary align-self-start"
        disabled={saving || !body.trim() || !user?.id}
        onClick={addComment}
      >
        Add comment
      </button>
    </div>
  );
}

export default CommentSection;
