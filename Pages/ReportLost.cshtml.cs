using LostLink.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LostLink.Pages;

public class ReportLostModel : PageModel
{
    [BindProperty]
    public LostItem Lost { get; set; } = new();

    public void OnGet() => Lost.DateLost = DateTime.Today;

    public IActionResult OnPost()
    {
        if (!ModelState.IsValid) return Page();      // server-side validation

        try
        {
            Repository.AddLost(Lost);
            TempData["Success"] =
                $"Lost report #{Lost.Id} registered. We will score it against every found item.";
            return RedirectToPage("Details", new { kind = "lost", id = Lost.Id });
        }
        catch (Exception)
        {
            ModelState.AddModelError("", "We could not save your report. " +
                "Please check the values and try again.");
            return Page();
        }
    }
}
