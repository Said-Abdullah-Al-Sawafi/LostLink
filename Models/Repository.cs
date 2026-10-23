namespace LostLink.Models;

// Rubric 7: pages maintain "collections of the three classes" - one static
// repository holds the lists, hands out IDs, and seeds a demo pair.
public static class Repository
{
    public static List<LostItem>  LostItems  { get; } = new();
    public static List<FoundItem> FoundItems { get; } = new();
    public static List<Claim>     Claims     { get; } = new();

    static Repository()                             // seed data: a matching pair + two extras
    {
        AddLost(new LostItem("Salim Al-Balushi", "salim@university.edu.om",
                ItemCategory.Electronics, "Blue", "Apple", "Main Library",
                new DateTime(2026, 10, 20),
                "iPhone in a blue case with a cat sticker on the back, near the study desks", 350));

        AddFound(new FoundItem("Library Security Desk", "security@university.edu.om",
                ItemCategory.Electronics, "Blue", "Apple", "Main Library",
                new DateTime(2026, 10, 21),
                "Smartphone with a cat sticker on the back, handed in at the front desk",
                "What is the lock-screen wallpaper?", "cat",
                "Security Office, Building 12, 8am-3pm"));

        AddLost(new LostItem("Maryam Al-Zadjali", "maryam@university.edu.om",
                ItemCategory.Keys, "Silver", "", "Science Block car park",
                new DateTime(2026, 10, 18),
                "Bunch of keys with a red Omani flag keyring and a small torch", 0));

        AddFound(new FoundItem("Ahmed Al-Habsi", "ahmed@university.edu.om",
                ItemCategory.Wallets, "Brown", "Nike", "Cafeteria",
                new DateTime(2026, 10, 22),
                "Small brown wallet with a student ID card inside",
                "Which bank card is in the leftmost slot?", "bank muscat",
                "Student Affairs desk, Student Centre"));
    }

    public static LostItem AddLost(LostItem item)
    {
        item.Id = LostItems.Count == 0 ? 1 : LostItems.Max(x => x.Id) + 1;
        LostItems.Add(item);
        return item;
    }

    public static FoundItem AddFound(FoundItem item)
    {
        item.Id = FoundItems.Count == 0 ? 1 : FoundItems.Max(x => x.Id) + 1;
        FoundItems.Add(item);
        return item;
    }

    public static Claim AddClaim(Claim claim)
    {
        claim.Id = Claims.Count == 0 ? 1 : Claims.Max(x => x.Id) + 1;
        Claims.Add(claim);
        return claim;
    }

    public static LostItem?  GetLost(int id)  => LostItems.FirstOrDefault(x => x.Id == id);
    public static FoundItem? GetFound(int id) => FoundItems.FirstOrDefault(x => x.Id == id);
}
