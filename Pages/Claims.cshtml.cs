using LostLink.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LostLink.Pages;

// Admin verification desk: expected answer vs given answer side by side,
// word-overlap pre-check badge, approve/reject with named handlers.
public class ClaimsModel : PageModel
{
    public List<Claim> Pending { get; private set; } = new();
    public Dictionary<int, FoundItem> FoundByClaim { get; } = new();

    public void OnGet()
    {
        Pending = Repository.Claims.Where(c => c.Status == ClaimStatus.Pending)
                    .OrderBy(c => c.SubmittedAt).ToList();
        foreach (var claim in Pending)
            FoundByClaim[claim.Id] = Repository.GetFound(claim.FoundItemId)!;
    }

    public IActionResult OnPostApprove(int id)
    {
        var claim = Repository.Claims.FirstOrDefault(c => c.Id == id);
        var found = claim is null ? null : Repository.GetFound(claim.FoundItemId);
        if (claim is null || found is null) return NotFound();

        try
        {
            claim.Status = ClaimStatus.Approved;
            found.Status = ItemStatus.Matched;

            if (claim.LostItemId is int lostId &&
                Repository.GetLost(lostId) is { } lost)
                lost.Status = ItemStatus.Matched;

            TempData["Success"] = $"Claim #{id} approved. Contact details and the " +
                "pickup point are now visible on the item page.";
        }
        catch (Exception)
        {
            TempData["Error"] = "Could not update the claim. Please try again.";
        }
        return RedirectToPage();
    }

    public IActionResult OnPostReject(int id)
    {
        var claim = Repository.Claims.FirstOrDefault(c => c.Id == id);
        if (claim is null) return NotFound();
        claim.Status = ClaimStatus.Rejected;    // admin may add a note via a small form
        TempData["Success"] = $"Claim #{id} rejected.";
        return RedirectToPage();
    }
}
