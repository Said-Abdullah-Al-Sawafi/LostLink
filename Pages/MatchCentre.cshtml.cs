using LostLink.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LostLink.Pages;

public class MatchCentreModel : PageModel
{
    public List<MatchResult> Pairs { get; private set; } = new();

    public void OnGet() => Pairs = Repository.LostItems
        .Where(l => l.Status == ItemStatus.Active)
        .SelectMany(l => Repository.FoundItems
            .Where(f => f.Status == ItemStatus.Active)
            .Select(f => MatchEngine.Score(l, f)))
        .Where(m => m.Level != MatchLevel.None)
        .OrderByDescending(m => m.Score)
        .ToList();
}
