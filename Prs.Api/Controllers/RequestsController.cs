using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Prs.Api.Data;
using Prs.Api.Models;

namespace Prs.Api.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class RequestsController : ControllerBase {
        private readonly PrsDbContext _db;

        public RequestsController(PrsDbContext db) {
            _db = db;
        }

        // GET: api/Requests
        // GET: api/Requests?status=NEW
        // GET: api/Requests?status=REVIEW
        // GET: api/Requests?status=APPROVED
<<<<<<< HEAD
        // GET: api/Requests?status=REJECTED
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Request>>> GetAll([FromQuery] string? status = null) {
=======
        // GET: api/Requests?status=REJECTED&userId=5&excludeUserId=6
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Request>>> GetAll([FromQuery] string? status = null, [FromQuery] int? userId = null, [FromQuery] int? excludeUserId = null) {
>>>>>>> main
            var query = _db.Requests
                           .Include(request => request.User)
                           .AsQueryable();

            if (status != null) {
                query = query.Where(request => request.Status == status);
<<<<<<< HEAD
=======
            }

            if (userId != null) {
                query = query.Where(request => request.UserId == userId);

            }

            if (excludeUserId != null) {
                query = query.Where(request => request.UserId != excludeUserId);
>>>>>>> main
            }

            return await query.ToListAsync();
        }

        // GET: api/Requests/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Request>> GetById(int id) {
            var request = await _db.Requests
                                   .Include(request => request.User)
                                   .Include(request => request.RequestLines)
                                       .ThenInclude(requestline => requestline.Product)
                                   .SingleOrDefaultAsync(request => request.Id == id);

            if (request == null) {
                return NotFound();
            }

            return request;
        }

        // POST: api/Requests
        [HttpPost]
        public async Task<ActionResult<Request>> Create(Request newRequest) {
            _db.Requests.Add(newRequest);
            await _db.SaveChangesAsync();

            var requestWithUser = await _db.Requests
                                           .Include(request => request.User)
                                           .SingleOrDefaultAsync(request => request.Id == newRequest.Id);

            return CreatedAtAction(nameof(GetById), new { id = newRequest.Id }, requestWithUser);
        }

        // POST: api/Requests/5/duplicate
        [HttpPost("{id}/duplicate")]
        public async Task<ActionResult<Request>> Duplicate(int id, [FromBody] int userId) {
            var currentRequest = await _db.Requests
                                          .Include(request => request.RequestLines)
                                          .SingleOrDefaultAsync(request => request.Id == id);
            if (currentRequest == null) {
                return NotFound();
            }

            if (!await _db.Users.AnyAsync(user => user.Id == userId)) {
                return BadRequest("The requested user does not exist.");
            }

            var duplicatedRequest = new Request {
                Description = $"Copy of {currentRequest.Description}",
                Justification = currentRequest.Justification,
                DeliveryMode = currentRequest.DeliveryMode,
                Status = RequestStatus.New,
                UserId = userId,
                RequestLines = currentRequest.RequestLines
                    .Select(requestLine => new RequestLine {
                        ProductId = requestLine.ProductId,
                        Quantity = requestLine.Quantity,
                    })
                    .ToList(),
            };

            _db.Requests.Add(duplicatedRequest);
            await _db.SaveChangesAsync();

            duplicatedRequest.Total = await _db.RequestLines
                .Where(requestLine => requestLine.RequestId == duplicatedRequest.Id)
                .SumAsync(requestLine => requestLine.Quantity * requestLine.Product!.Price);
            await _db.SaveChangesAsync();

            var requestWithDetails = await _db.Requests
                                               .Include(request => request.User)
                                               .Include(request => request.RequestLines)
                                                   .ThenInclude(requestLine => requestLine.Product)
                                               .SingleAsync(request => request.Id == duplicatedRequest.Id);

            return CreatedAtAction(nameof(GetById), new { id = duplicatedRequest.Id }, requestWithDetails);
        }

        // PUT: api/Requests/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Request>> Update(int id, Request updatedRequest) {
            if (id != updatedRequest.Id) {
                return BadRequest();
            }

            var currentRequest = await _db.Requests.FindAsync(id);
            if (currentRequest == null) {
                return NotFound();
            }

            _db.Entry(currentRequest).CurrentValues.SetValues(updatedRequest);
            await _db.SaveChangesAsync();

            var requestWithUser = await _db.Requests
                                           .Include(request => request.User)
                                           .SingleOrDefaultAsync(request => request.Id == id);

            return Ok(requestWithUser);
        }

        // PUT: api/Requests/5/review
        [HttpPut("{id}/review")]
        public async Task<ActionResult<Request>> Review(int id) {
            var currentRequest = await _db.Requests.FindAsync(id);
            if (currentRequest == null) {
                return NotFound();
            }

            currentRequest.Status = (currentRequest.Total < 50)
                ? RequestStatus.Approved
                : RequestStatus.Review;
            currentRequest.RejectionReason = null;
            await _db.SaveChangesAsync();

            return Ok(currentRequest);
        }

        // PUT: api/Requests/5/approve
        [HttpPut("{id}/approve")]
        public async Task<ActionResult<Request>> Approve(int id) {
            var currentRequest = await _db.Requests.FindAsync(id);
            if (currentRequest == null) {
                return NotFound();
            }

            currentRequest.Status = RequestStatus.Approved;
            currentRequest.RejectionReason = null;
            await _db.SaveChangesAsync();

            return Ok(currentRequest);
        }

        // PUT: api/Requests/5/reject
        [HttpPut("{id}/reject")]
        public async Task<ActionResult<Request>> Reject(int id, [FromBody] string rejectionReason) {
            var currentRequest = await _db.Requests.FindAsync(id);
            if (currentRequest == null) {
                return NotFound();
            }

            currentRequest.Status = RequestStatus.Rejected;
            currentRequest.RejectionReason = rejectionReason;
            await _db.SaveChangesAsync();

            return Ok(currentRequest);
        }

        // DELETE: api/Requests/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) {
            var request = await _db.Requests.FindAsync(id);
            if (request == null) {
                return NotFound();
            }

            _db.Requests.Remove(request);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
