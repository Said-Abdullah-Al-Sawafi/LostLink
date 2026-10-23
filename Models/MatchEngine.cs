namespace LostLink.Models;

public class MatchResult
{
    public int Score { get; set; }
    public MatchLevel Level => Score >= 75 ? MatchLevel.High
                             : Score >= 50 ? MatchLevel.Medium
                             : MatchLevel.None;

    public LostItem Lost { get; set; } = null!;
    public FoundItem Found { get; set; } = null!;
    public List<string> Reasons { get; set; } = new();
}

public static class MatchEngine
{
    public static MatchResult Score(LostItem lost, FoundItem found)
    {
        var result = new MatchResult { Lost = lost, Found = found };
        int score = 0;

        // 1) Category ------------------------------------------------ 30
        if (lost.Category == found.Category)
        {
            score += 30;
            result.Reasons.Add($"Same category: {lost.Category} (+30)");
        }

        // 2) Colour (family match) ------------------------------------ 15
        var lc = TextHelpers.ColourFamily(lost.Colour);
        var fc = TextHelpers.ColourFamily(found.Colour);
        if (lc.Length > 0 && lc == fc)
        {
            score += 15;
            result.Reasons.Add($"Same colour family: {lost.Colour}/{found.Colour} (+15)");
        }

        // 3) Brand ----------------------------------------------------- 15
        if (!string.IsNullOrWhiteSpace(lost.Brand) &&
            string.Equals(lost.Brand.Trim(), found.Brand?.Trim(),
                          StringComparison.OrdinalIgnoreCase))
        {
            score += 15;
            result.Reasons.Add($"Same brand: {lost.Brand} (+15)");
        }

        // 4) Location --------------------------------------------------- 15
        if (string.Equals(lost.Location.Trim(), found.Location.Trim(),
                          StringComparison.OrdinalIgnoreCase))
        {
            score += 15;
            result.Reasons.Add($"Same location: {lost.Location} (+15)");
        }
        else if (lost.Location.Contains(found.Location, StringComparison.OrdinalIgnoreCase) ||
                 found.Location.Contains(lost.Location, StringComparison.OrdinalIgnoreCase))
        {
            score += 8;                                     // nearby: partial credit
            result.Reasons.Add($"Nearby location: {lost.Location} / {found.Location} (+8)");
        }

        // 5) Time window ------------------------------------------------- 10
        if (found.DateFound.Date >= lost.DateLost.Date)     // found after it was lost
        {
            int gap = (found.DateFound.Date - lost.DateLost.Date).Days;
            if (gap == 0)       { score += 10; result.Reasons.Add("Found on the same day (+10)"); }
            else if (gap <= 3)  { score += 7;  result.Reasons.Add($"Found {gap} days later (+7)"); }
            else if (gap <= 14) { score += 4;  result.Reasons.Add($"Found {gap} days later (+4)"); }
            else                { result.Reasons.Add($"Found {gap} days later - outside the window (0)"); }
        }
        else
        {
            result.Reasons.Add("Found before it was lost - impossible pair (0)");
        }

        // 6) Keywords in the descriptions --------------------------------- 15
        var shared = TextHelpers.Words(lost.Description)
                    .Intersect(TextHelpers.Words(found.Description)).ToList();
        if (shared.Count > 0)
        {
            int kw = Math.Min(15, shared.Count * 5);
            score += kw;
            result.Reasons.Add($"Shared keywords: {string.Join(", ", shared)} (+{kw})");
        }

        result.Score = Math.Min(100, score);
        return result;
    }
}
