using LostLink.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LostLink.Pages;

public class BrowseModel : PageModel
{
    public List<Row> Rows { get; private set; } = new();

    public class Row
    {
        public bool IsLost { get; init; }
        public int Id { get; init; }
        public string Summary { get; init; } = "";
        public string Location { get; init; } = "";
        public DateTime Date { get; init; }
        public ItemStatus Status { get; init; }
        public ItemCategory Category { get; init; }
    }

    public void OnGet()
    {
        Rows = Repository.LostItems
            .Select(l => new Row
            {
                IsLost = true, Id = l.Id, Summary = l.Summary(),
                Location = l.Location, Date = l.DateLost,
                Status = l.Status, Category = l.Category
            })
            .Concat(Repository.FoundItems.Select(f => new Row
            {
                IsLost = false, Id = f.Id, Summary = f.Summary(),
                Location = f.Location, Date = f.DateFound,
                Status = f.Status, Category = f.Category
            }))
            .OrderByDescending(r => r.Date)
            .ToList();
    }
}
