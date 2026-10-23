using System.ComponentModel.DataAnnotations;

namespace LostLink.Models;

public class LostItem
{
    public int Id { get; set; }

    [Required, StringLength(60, MinimumLength = 2)]
    [Display(Name = "Your name")]
    public string OwnerName { get; set; } = "";

    [Required, EmailAddress]
    [Display(Name = "Contact email")]
    public string ContactEmail { get; set; } = "";

    [Required]
    public ItemCategory Category { get; set; }

    [Required, StringLength(30)]
    public string Colour { get; set; } = "";

    [StringLength(30)]
    public string? Brand { get; set; }              // not every item has one

    [Required, StringLength(60)]
    [Display(Name = "Where you lost it")]
    public string Location { get; set; } = "";

    [Required, DataType(DataType.Date)]
    [Display(Name = "Date lost")]
    public DateTime DateLost { get; set; } = DateTime.Today;

    [Required, StringLength(400, MinimumLength = 10)]
    public string Description { get; set; } = "";

    [Range(0, 5000)]
    [Display(Name = "Estimated value (OMR)")]
    public int? EstimatedValueOmr { get; set; }

    public ItemStatus Status { get; set; } = ItemStatus.Active;
    public DateTime ReportedAt { get; set; } = DateTime.Now;

    public LostItem() { }                           // required for model binding

    public LostItem(string owner, string email, ItemCategory category, string colour,
                    string brand, string location, DateTime dateLost,
                    string description, int? value = null)
    {
        OwnerName = owner;        ContactEmail = email;
        Category = category;      Colour = colour;
        Brand = brand;            Location = location;
        DateLost = dateLost;      Description = description;
        EstimatedValueOmr = value;
    }

    // ---- business logic lives with the data ----
    public int DaysSinceLost() => (DateTime.Today - DateLost).Days;

    public string Summary() =>
        $"{Colour} {Brand} {Category} lost at {Location} on {DateLost:dd MMM}".Trim();

    public bool IsStillFindable() =>
        Status == ItemStatus.Active && DaysSinceLost() <= 90;
}
