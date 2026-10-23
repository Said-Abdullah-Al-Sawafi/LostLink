# LostLink

A Smart Lost & Found Matching and Verification Platform — COMP4701 Web Application
Development, Fall 2026 (Phase 1).

LostLink replaces the campus notice board with structured, searchable reports: every
lost/found report is captured as data (category, colour, brand, location, date,
description), a transparent 0-100 scoring engine suggests likely matches with a written
reason for every point, and a finder-set secret question plus an administrator
verification workflow make the handover safe — contact details and the pickup point are
revealed only after a claim is approved.

## Tech stack

- ASP.NET Core 8 (Razor Pages)
- jQuery + AJAX (live match preview, live filtering, animated counters, confirm dialogs)
- Bootstrap 5 with a custom LostLink theme (teal gradient navbar, pill buttons, branded tables)
- In-memory collections of the three entity classes (`LostItem`, `FoundItem`, `Claim`),
  seeded with demo data on startup

## How to run

1. Clone this repository.
2. Open `LostLink.sln` (or the `LostLink` folder) in **Visual Studio 2022** with the
   ".NET 8.0" SDK — or run `dotnet run` from the `LostLink` folder.
3. Press **F5** (or open the shown http URL). The app starts with seeded data: a blue
   iPhone lost/found pair that scores 97/100 in the Match Centre.

## Features (mapped to the Phase 1 rubric)

| # | Requirement | Where it lives |
|---|-------------|----------------|
| 6 | Enumeration | `Models/Enums.cs` — `ItemCategory` drives both form dropdowns, the Browse filter and the engine |
| 7 | C# classes | `Models/LostItem.cs`, `FoundItem.cs`, `Claim.cs` (+ `TextHelpers.cs`) with constructors and business-logic methods |
| 8 | Front-end framework | `wwwroot/js/site.js` — AJAX live preview (debounced), live filtering, character counter, expandable reasons, confirm dialog, row highlight, animated counters |
| 9 | Razor pages | 7 pages: Home, ReportLost, ReportFound, Browse, Details, MatchCentre, Claims |
| 10 | Business logic | `Models/MatchEngine.cs` (scored out of 100 with reasons) + claim approval flow in `Claims.cshtml.cs` |
| 11 | Custom layout | `Pages/Shared/_Layout.cshtml` — navbar with live lost/found counter, TempData alerts, footer, `Styles`/`Scripts` sections |
| 12 | Error handling | `try/catch` in every `OnPost`, `NotFound()` guards, styled `Error.cshtml`, `UseStatusCodePagesWithReExecute` in `Program.cs` |
| 13 | Bootstrap styling | `wwwroot/css/site.css` — theme layer over untouched Bootstrap 5 |
| 14 | Form validation | DataAnnotations on all 3 classes (Required, StringLength, Range, EmailAddress, DataType) + jQuery unobtrusive client-side validation |

## Scoring engine

Every lost/found pair is scored out of 100: category 30, colour family 15, brand 15,
location 15 (exact) / 8 (nearby), time window 10, shared description keywords 15.
**75+ = High**, **50-74 = Medium**, lower stays hidden. Every awarded point comes with a
human-readable reason shown in the UI.

## Verification flow

1. Owner files a **lost** report; a finder registers a **found** item with a secret
   question and sees live matches while typing.
2. The owner answers the secret question on the found item's page to **claim** it.
3. An administrator compares the expected vs given answer (with an automatic
   word-overlap pre-check badge) and **approves** or **rejects**.
4. Approval reveals both parties' contact details and the pickup point, and sets the
   item statuses to Matched.
