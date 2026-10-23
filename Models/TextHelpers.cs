namespace LostLink.Models;

public static class TextHelpers
{
    private static readonly string[] StopWords =
        { "the", "and", "with", "for", "from", "was", "are", "but", "not", "you",
          "his", "her", "its", "has", "had", "have", "this", "that", "there", "their" };

    // splits text into significant lowercase words for keyword comparison
    public static HashSet<string> Words(string? text)
    {
        var parts = (text ?? "").ToLower()
            .Split(new[] { ' ', ',', '.', ';', ':', '-', '/', '(', ')' },
                   StringSplitOptions.RemoveEmptyEntries);
        return parts.Where(w => w.Length > 2 && !StopWords.Contains(w)).ToHashSet();
    }

    // groups similar colours so "navy" and "blue" score as the same family
    public static string ColourFamily(string colour)
    {
        var c = (colour ?? "").Trim().ToLower();
        if (c.Length == 0) return "";
        if (c.Contains("navy") || c.Contains("teal") || c.Contains("sky")) return "blue";
        if (c.Contains("grey") || c.Contains("gray") || c.Contains("silver")) return "grey";
        if (c.Contains("maroon") || c.Contains("pink")) return "red";
        if (c.Contains("beige") || c.Contains("tan")) return "brown";
        return c;
    }
}
