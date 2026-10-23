using LostLink.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LostLink.Pages;

public class IndexModel : PageModel
{
    public int LostCount { get; private set; }
    public int FoundCount { get; private set; }
    public int ReunitedCount { get; private set; }

    public List<LostItem> LatestLost { get; private set; } = new();
    public List<FoundItem> LatestFound { get; private set; } = new();

    public void OnGet()
    {
        LostCount = Repository.LostItems.Count;
        FoundCount = Repository.FoundItems.Count;
        ReunitedCount = Repository.Claims.Count(c => c.Status == ClaimStatus.Approved);

        LatestLost = Repository.LostItems
            .OrderByDescending(l => l.ReportedAt).Take(3).ToList();
        LatestFound = Repository.FoundItems
            .OrderByDescending(f => f.ReportedAt).Take(3).ToList();
    }
}
