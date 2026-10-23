using LostLink.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LostLink.Pages;

public class ReportFoundModel : PageModel
{
    private readonly ILogger<ReportFoundModel> _logger;

    public ReportFoundModel(ILogger<ReportFoundModel> logger) => _logger = logger;

    [BindProperty]
    public FoundItem Found { get; set; } = new();

    public void OnGet() => Found.DateFound = DateTime.Today;

    // AJAX: /ReportFound?handler=Preview&category=...&colour=...
    public JsonResult OnGetPreview(ItemCategory category, string colour, string brand,
                                   string location, DateTime dateFound, string description)
    {
        var draft = new FoundItem
        {
            Category = category,
            Colour = colour ?? "",
            Brand = brand ?? "",
            Location = location ?? "",
            DateFound = dateFound == default ? DateTime.Today : dateFound,
            Description = description ?? ""
        };

        var matches = Repository.LostItems
            .Where(l => l.Status == ItemStatus.Active)
            .Select(l => MatchEngine.Score(l, draft))
            .Where(m => m.Level != MatchLevel.None)
            .OrderByDescending(m => m.Score)
            .Take(3)
            .Select(m => new
            {
                score = m.Score,
                level = m.Level.ToString(),
                reasons = m.Reasons,
                lostSummary = m.Lost.Summary()
            });

        return new JsonResult(matches.ToList());
    }

    public IActionResult OnPost()
    {
        if (!ModelState.IsValid) return Page();

        try
        {
            Repository.AddFound(Found);
            TempData["Success"] = $"Found report #{Found.Id} registered. " +
                "If someone claims it, they must answer your secret question.";
            return RedirectToPage("Details", new { kind = "found", id = Found.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Saving found item failed");
            ModelState.AddModelError("", "We could not save your report. " +
                "Please check the values and try again.");
            return Page();
        }
    }
}
