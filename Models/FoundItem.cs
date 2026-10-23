using System.ComponentModel.DataAnnotations;

namespace LostLink.Models;

public class FoundItem
{
    public int Id { get; set; }

    [Required, StringLength(60, MinimumLength = 2)]
    [Display(Name = "Finder name")]
    public string FinderName { get; set; } = "";

    [Required, EmailAddress]
    [Display(Name = "Contact email")]
    public string ContactEmail { get; set; } = "";

    [Required] public ItemCategory Category { get; set; }

    [Required, StringLength(30)]
    public string Colour { get; set; } = "";

    [StringLength(30)]
    public string? Brand { get; set; }

    [Required, StringLength(60)]
    [Display(Name = "Where it was found")]
    public string Location { get; set; } = "";

    [Required, DataType(DataType.Date)]
    [Display(Name = "Date found")]
    public DateTime DateFound { get; set; } = DateTime.Today;

    [Required, StringLength(400, MinimumLength = 10)]
    public string Description { get; set; } = "";

    [Required, StringLength(200, MinimumLength = 8)]
    [Display(Name = "Secret question (only the real owner can answer)")]
    public string SecretQuestion { get; set; } = "";

    [Required, StringLength(200, MinimumLength = 2)]
    [Display(Name = "Expected answer")]
    public string SecretAnswer { get; set; } = "";

    [StringLength(100)]
    [Display(Name = "Pickup point")]
    public string PickupPoint { get; set; } = "";

    public ItemStatus Status { get; set; } = ItemStatus.Active;
    public DateTime ReportedAt { get; set; } = DateTime.Now;

    public FoundItem() { }                          // required for model binding

    public FoundItem(string finder, string email, ItemCategory category, string colour,
                     string brand, string location, DateTime dateFound, string description,
                     string secretQuestion, string secretAnswer, string pickupPoint)
    {
        FinderName = finder;        ContactEmail = email;
        Category = category;        Colour = colour;
        Brand = brand;              Location = location;
        DateFound = dateFound;      Description = description;
        SecretQuestion = secretQuestion;
        SecretAnswer = secretAnswer;
        PickupPoint = pickupPoint;
    }

    public string Summary() =>
        $"{Colour} {Brand} {Category} found at {Location} on {DateFound:dd MMM}".Trim();

    public bool CanAcceptClaims() => Status == ItemStatus.Active;
}
