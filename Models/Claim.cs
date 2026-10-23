using System.ComponentModel.DataAnnotations;

namespace LostLink.Models;

public class Claim
{
    public int Id { get; set; }

    [Required]
    public int FoundItemId { get; set; }

    public int? LostItemId { get; set; }            // optional link to a lost report

    [Required, StringLength(60, MinimumLength = 2)]
    [Display(Name = "Your name")]
    public string ClaimantName { get; set; } = "";

    [Required, EmailAddress]
    [Display(Name = "Contact email")]
    public string ClaimantEmail { get; set; } = "";

    [Required, StringLength(200, MinimumLength = 2)]
    [Display(Name = "Your answer")]
    public string AnswerGiven { get; set; } = "";

    public ClaimStatus Status { get; set; } = ClaimStatus.Pending;
    public DateTime SubmittedAt { get; set; } = DateTime.Now;

    [StringLength(300)]
    public string? AdminNote { get; set; }

    // word-overlap pre-check shown to the admin next to the expected answer
    public int AnswerOverlap(FoundItem found)
    {
        if (found is null) return 0;
        var expected = TextHelpers.Words(found.SecretAnswer);
        if (expected.Count == 0) return 0;
        var given = TextHelpers.Words(AnswerGiven);
        return (int)Math.Round(100.0 * expected.Intersect(given).Count() / expected.Count);
    }
}
