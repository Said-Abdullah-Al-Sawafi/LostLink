// Models/Enums.cs
namespace LostLink.Models;

public enum ItemCategory
{
    Electronics, Keys, Wallets, Bags, Clothing,
    Documents, Accessories, Jewellery, Other
}

public enum ItemStatus { Active, Matched, Resolved, Withdrawn }

public enum MatchLevel { High, Medium, None }

public enum ClaimStatus { Pending, Approved, Rejected }
