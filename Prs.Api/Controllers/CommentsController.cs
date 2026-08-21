using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Prs.Api.Data;
using Prs.Api.Models;

namespace Prs.Api.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase {
        private readonly PrsDbContext _db;

        public CommentsController(PrsDbContext db) {
            _db = db;
        }

        // GET: api/Comments?requestId=5
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comment>>> GetAll([FromQuery] int requestId) {
            return await _db.Comments
                            .AsNoTracking()
                            .Include(comment => comment.User)
                            .Where(comment => comment.RequestId == requestId)
                            .OrderBy(comment => comment.CreatedAt)
                            .ThenBy(comment => comment.Id)
                            .ToListAsync();
        }

        // POST: api/Comments
        [HttpPost]
        public async Task<ActionResult<Comment>> Create(Comment newComment) {
            if (!await _db.Requests.AnyAsync(request => request.Id == newComment.RequestId) ||
                !await _db.Users.AnyAsync(user => user.Id == newComment.UserId)) {
                return BadRequest();
            }

            newComment.Body = newComment.Body.Trim();
            if (string.IsNullOrWhiteSpace(newComment.Body)) {
                return BadRequest();
            }

            newComment.CreatedAt = DateTime.UtcNow;
            _db.Comments.Add(newComment);
            await _db.SaveChangesAsync();

            var commentWithUser = await _db.Comments
                                           .Include(comment => comment.User)
                                           .SingleAsync(comment => comment.Id == newComment.Id);

            return CreatedAtAction(nameof(GetAll), new { requestId = newComment.RequestId }, commentWithUser);
        }

        // DELETE: api/Comments/5?userId=2
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int userId) {
            var comment = await _db.Comments.FindAsync(id);
            if (comment == null) {
                return NotFound();
            }

            if (comment.UserId != userId) {
                return Forbid();
            }

            _db.Comments.Remove(comment);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}