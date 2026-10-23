using LostLink.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LostLink.Pages;

// One page serves both kinds: /Details?kind=found&id=2 (found report + claim form)
// and /Details?kind=lost&id=1 (lost report + matching found items).
public class DetailsModel : PageModel
{
    [BindProperty]
    public Claim ClaimInput { get; set; } = new();

    public LostItem? Lost { get; private set; }
    public FoundItem? Found { get; private set; }
    public List<MatchResult> Matches { get; private set; } = new();
    public Claim? ApprovedClaim { get; private set; }
    public bool ClaimApproved => ApprovedClaim is not null;

    public IActionResult OnGet(string kind = "lost", int id = 0)
    {
        if (kind == "found")
        {
            if (!LoadFound(id)) return NotFound();
        }
        else
        {
            Lost = Repository.GetLost(id);
            if (Lost is null) return NotFound();

            Matches = Repository.FoundItems
                .Where(f => f.Status == ItemStatus.Active)
                .Select(f => MatchEngine.Score(Lost, f))
                .Where(m => m.Level != MatchLevel.None)
                .OrderByDescending(m => m.Score)
                .ToList();
        }
        return Page();
    }

    public IActionResult OnPostClaim(int id)
    {
        var found = Repository.GetFound(id);
        if (found is null || !found.CanAcceptClaims()) return NotFound();

        if (!ModelState.IsValid)
        {
            // redisplay the whole page with the validation errors
            LoadFound(id);
            return Page();
        }

        try
        {
            ClaimInput.FoundItemId = id;
            Repository.AddClaim(ClaimInput);
            TempData["Success"] = "Claim submitted. An administrator will verify " +
                "your answer and get in touch.";
        }
        catch (Exception)
        {
            TempData["Error"] = "Could not submit the claim. Please try again.";
        }
        return RedirectToPage(new { kind = "found", id });
    }

    private bool LoadFound(int id)
    {
        Found = Repository.GetFound(id);
        if (Found is null) return false;

        Matches = Repository.LostItems
            .Where(l => l.Status == ItemStatus.Active)
            .Select(l => MatchEngine.Score(l, Found))
            .Where(m => m.Level != MatchLevel.None)
            .OrderByDescending(m => m.Score)
            .ToList();

        ApprovedClaim = Repository.Claims.FirstOrDefault(c =>
            c.FoundItemId == id && c.Status == ClaimStatus.Approved);
        return true;
    }
}
