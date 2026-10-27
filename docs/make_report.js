// Generates LostLink_PartA_Report.docx — cover page + TOC + Part A sections 1-5.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, LevelFormat, TableOfContents, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageBreak, Footer, PageNumber, ExternalHyperlink,
} = require("docx");

const TEAL = "0F766E", DARK = "134E4A", HEADFILL = "E6F4F1", RED = "C0392B";
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "9CA3AF" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };
const CW = 9026; // A4 content width with 1" margins (DXA)

// ---------- helpers ----------
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const P = (t, opts = {}) => new Paragraph({
  spacing: { after: 160, line: 276 },
  alignment: AlignmentType.JUSTIFIED,
  children: Array.isArray(t) ? t : [new TextRun(t)], ...opts,
});
const NOTE = (t) => P([new TextRun({ text: t, italics: true, color: RED, size: 22 })]);
const RUNS = (...runs) => new Paragraph({ spacing: { after: 160, line: 276 }, children: runs });
const R = (t, o = {}) => new TextRun({ text: t, ...o });
const B = (t) => new TextRun({ text: t, bold: true });
const bullet = (t) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 100, line: 276 },
  children: Array.isArray(t) ? t : [new TextRun(t)],
});
const numbered = (ref, t) => new Paragraph({
  numbering: { reference: ref, level: 0 },
  spacing: { after: 100, line: 276 },
  children: Array.isArray(t) ? t : [new TextRun(t)],
});
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
const img = (file, w, h, alt) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 80 },
  children: [new ImageRun({
    type: "png", data: fs.readFileSync(file),
    transformation: { width: w, height: h },
    altText: { title: alt, description: alt, name: alt },
  })],
});
const caption = (t) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 240 },
  children: [new TextRun({ text: t, italics: true, size: 20, color: "6B7280" })],
});

function table(headers, rows, widths) {
  const head = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: BORDERS, margins: MARGINS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: HEADFILL, type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: DARK, size: 22 })] })],
    })),
  });
  const body = rows.map((cells) => new TableRow({
    children: cells.map((c, i) => new TableCell({
      borders: BORDERS, margins: MARGINS,
      width: { size: widths[i], type: WidthType.DXA },
      children: [new Paragraph({
        children: Array.isArray(c) ? c : [new TextRun({ text: c, size: 21 })],
      })],
    })),
  }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...body] });
}
const gap = () => new Paragraph({ spacing: { after: 120 }, children: [] });

// ---------- document ----------
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 23 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: TEAL },
        paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "objectives", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "questions", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "frs", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "FR%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 900, hanging: 540 } } } }] },
      { reference: "nfrs", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "NFR%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1000, hanging: 640 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },          // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "LostLink · COMP4701 Phase 1 · page ", size: 18, color: "6B7280" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "6B7280" }),
          ],
        })],
      }),
    },
    children: [
      // ================= COVER =================
      new Paragraph({ spacing: { before: 1200, after: 60 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "SULTAN QABOOS UNIVERSITY", bold: true, size: 26 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
        children: [new TextRun({ text: "College of Science — Department of Computer Science", size: 22 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 900 },
        children: [new TextRun({ text: "COMP4701: Web Application Development — Fall 2026", size: 22 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
        children: [new TextRun({ text: "LostLink", bold: true, size: 64, color: TEAL })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 },
        children: [new TextRun({ text: "A Smart Lost & Found Matching and Verification Platform", size: 26, color: DARK })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 },
        children: [new TextRun({ text: "Phase 1 Report — Parts A, B & C", bold: true, size: 28 })] }),
      table(["Team member", "University ID"],
        [["Said Alsawafi", "140004"],
         ["Almutaz Alhadhrami", "134812"]],
        [5636, 3390]),
      gap(),
      P([B("Submission date: "), R("27 October 2026")]),
      pageBreak(),

      // ================= TOC =================
      H1("Table of Contents"),
      new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
      P([new TextRun({ text: "After opening in Word: press Ctrl+A then F9 (Update Field) so the page numbers fill in.", italics: true, color: "6B7280", size: 22 })]),
      pageBreak(),

      // ================= 1. PROJECT INFORMATION =================
      H1("1. Project Information"),
      P([B("Project title: "), R("LostLink — A Smart Lost & Found Matching and Verification Platform.")]),

      H2("1.1 Objectives"),
      numbered("objectives", "Replace the campus notice-board lost & found with structured, searchable reports (category, colour, brand, location, date, description)."),
      numbered("objectives", "Automatically suggest likely lost-found matches using a transparent, explainable 0-100 scoring engine."),
      numbered("objectives", "Protect found items from false claims using a finder-set secret question and an administrator verification workflow."),
      numbered("objectives", "Reveal owner/finder contact details and the pickup point only after a claim is approved."),
      numbered("objectives", "Give administrators moderation tools and live statistics in one dashboard."),

      H2("1.2 Motivation"),
      P("Every week, items go missing on campus — phones in the library, keys in the car park, wallets in the cafeteria. The people who lost them and the people who found them are strangers to each other: each holds half of the same problem, and the two halves never meet. The current solution is a physical notice board and a shelf in the security office, which means the owner must personally scroll through notices and recognise their own item."),
      P("Notice boards fail in two ways. First, discovery is manual: a blue iPhone reported lost yesterday and a blue iPhone handed in today will only be reunited if one of the two people happens to look at the board at the right time. Second, nothing verifies identity: anyone can read a notice and claim the item, so the security office hands over property with no proof of ownership."),
      P("LostLink fixes both failures with three ideas. Structured reports turn each lost or found story into comparable data, so matching becomes computable: a scoring engine proposes the strongest lost/found pairs and explains every point it awards. A verification flow disposes safely: the finder records a secret question only the real owner could answer, an administrator checks each claim, and contact details plus the pickup point are revealed only after approval."),

      H2("1.3 Who benefits"),
      P("Students and visitors who lose things get a searchable system that works from a phone in under two minutes, instead of walking building to building. Honest finders and the security office that stores items get a safe, trackable way to hand items over without mediating disputes in person. Administrators get a single verification desk with an automatic pre-check, so approving the right claimant takes seconds. The same platform serves a university campus unchanged, and the model transfers directly to a mall's customer-service desk or an airport's lost-property office. Locally, the interviewed security-office staff member keeps handed-in items on a shelf and reunites owners only when they come and ask in person — the manual process LostLink is designed to replace."),
      img(path.join(__dirname, "assets", "screenshot-home.png"), 600, 403, "LostLink home page"),
      caption("Figure 1 — The LostLink home page: live counters and the latest reports."),

      // ================= 2. USER INTERVIEWS =================
      H1("2. User Interviews"),
      P("We interviewed two real users with different roles: a student who has lost an item on campus, and a staff member who receives found items. The interviews were conducted in person and took about ten minutes each; the eight questions below map directly onto our requirements list."),

      H2("2.1 Interviewees"),
      table(["Interviewee", "Role"],
        [["A", "A student who lost an item on campus this term"],
         ["B", "A staff member at the campus security office who receives handed-in found items"]],
        [1900, 7126]),
      gap(),

      H2("2.2 Questions asked"),
      numbered("questions", "What did you lose / how do people lose things here most often?"),
      numbered("questions", "What did you do to try to get it back? Did it work?"),
      numbered("questions", "Do you ever check the lost & found notice board or office? Why / why not?"),
      numbered("questions", "How would you feel about describing the item in a form (colour, brand, place) instead of free text?"),
      numbered("questions", "(staff) How many found items do you hold, and how are owners matched to them today?"),
      numbered("questions", "(staff) Has anyone ever tried to claim something that was not theirs? What happened?"),
      numbered("questions", "(staff) How do you verify a claimant is the real owner right now?"),
      numbered("questions", "If a system suggested matches automatically, what would you still want a human to check?"),

      H2("2.3 Findings"),
      table(["What the user said", "Requirement it produced"],
        [["\u201CI never check the notice board — it is too much scrolling, and half the notes are weeks old.\u201D (A)",
          "FR1/FR4: structured reports + automatic match suggestions"],
         ["\u201CA student once claimed a phone that was not his — he had read the notice and repeated what it said.\u201D (B)",
          "FR7/FR8: secret question + admin approval before any handover"],
         ["\u201CWe have no way to contact the owner — we just wait and hope they come to the desk.\u201D (B)",
          "FR9: contact details revealed on approval; owner notified"],
         ["\u201CI would describe the sticker on my laptop, not the model number.\u201D (A)",
          "Keyword scoring in FR4 (description overlap, +5 per shared word)"]],
        [4700, 4326]),
      gap(),
      P("Taken together, the interviews moved the design from \u201Ca lost & found database\u201D to a matching and verification system. Matching solves discovery: users will not scroll, so the system must propose pairs itself, with reasons a human can audit. Verification solves trust: staff cannot prove ownership from an ID card alone, so the secret question plus the word-overlap pre-check gives the administrator evidence before any handover — and the platform, not a stranger, mediates the contact."),

      // ================= 3. PROJECT REQUIREMENTS =================
      H1("3. Project Requirements"),

      H2("3.1 Functional requirements"),
      numbered("frs", [B("Report lost: "), R("a user submits a structured lost report (category, colour, brand, location, date, description, optional value) with contact details.")]),
      numbered("frs", [B("Report found: "), R("a finder registers a found item plus a secret question, its expected answer and a pickup point.")]),
      numbered("frs", [B("Browse: "), R("all reports are listed with live search and category filtering.")]),
      numbered("frs", [B("Matching engine: "), R("every lost/found pair is scored 0-100 (category 30, colour 15, brand 15, location 15, time window 10, keywords 15) with a written reason per awarded point; 75+ = High, 50-74 = Medium.")]),
      numbered("frs", [B("Live preview: "), R("while a finder fills the form, the top matching lost reports update instantly (AJAX).")]),
      numbered("frs", [B("Match Centre: "), R("a dedicated page lists the strongest current pairs with their explanations.")]),
      numbered("frs", [B("Claim: "), R("a user claims a found item by answering the secret question.")]),
      numbered("frs", [B("Verification: "), R("an administrator reviews each claim with expected vs given answer side by side and an automatic word-overlap pre-check, then approves or rejects.")]),
      numbered("frs", [B("Reunion: "), R("approval reveals both parties' contact details and the pickup point, and sets the item statuses to Matched.")]),
      numbered("frs", [B("Dashboard: "), R("the home page shows live counters (lost, found, reunited) and the latest reports.")]),

      H2("3.2 Non-functional requirements"),
      numbered("nfrs", [B("Usability: "), R("responsive Bootstrap 5 UI; a report can be filed in under two minutes from a phone.")]),
      numbered("nfrs", [B("Performance: "), R("the live preview responds within a second; in-memory collections keep every page render instant at campus scale.")]),
      numbered("nfrs", [B("Reliability: "), R("client + server validation on every form; friendly error pages; no crash from bad input or missing records.")]),
      numbered("nfrs", [B("Privacy & security: "), R("owner and finder contact details stay hidden until a claim is approved; the secret question blocks false claims.")]),
      numbered("nfrs", [B("Maintainability: "), R("shared enums, entity classes with their own business logic, and one reusable matching engine serve every page.")]),

      // ================= 4. APPLICATION DESIGN =================
      H1("4. Application Design"),

      H2("4.1 Architecture layers"),
      P("LostLink is an ASP.NET Core 8 (Razor Pages) web application with three layers:"),
      bullet([B("Presentation layer: "), R("seven Razor Pages (Home, Report Lost, Report Found, Browse, Details, Match Centre, Claims) enhanced with jQuery and styled with a Bootstrap 5 theme; a shared layout provides the menu, TempData alerts and footer on every page.")]),
      bullet([B("Business logic layer: "), R("the entity classes' own methods (Summary, DaysSinceLost, AnswerOverlap) plus the MatchEngine, called by every page that needs scores.")]),
      bullet([B("Data layer: "), R("a static Repository holding collections of the three entity classes (standing in for the four designed tables), with seed data for first run.")]),
      P([B("Interaction: "), R("the browser issues GET/POST requests to page handlers; handlers call the Repository and the MatchEngine, then re-render. One extra path exists for responsiveness: the Report Found page issues AJAX GETs to the Preview handler, which returns JSON that jQuery renders on the fly without a page reload.")]),

      H2("4.2 Pages and their roles"),
      table(["Page", "Role", "Key HTML controls", "jQuery highlight"],
        [["Index (Home)", "Dashboard: counters + latest reports", "cards, links", "animated counters"],
         ["ReportLost", "Owner files a lost report", "text boxes, dropdown (enum), date, textarea, number", "character counter"],
         ["ReportFound", "Finder registers item + secret question", "same as left, plus sticky preview panel", "AJAX live match preview"],
         ["Browse", "All reports, filterable", "search box, dropdown filter, table, badges", "live filtering"],
         ["Details", "One report + its matches + claim form", "cards, form, buttons", "confirm dialog, fade-in"],
         ["MatchCentre", "Engine results for all pairs", "table, badges", "click-to-expand reasons"],
         ["Claims", "Admin verifies pending claims", "table, buttons, alert boxes", "highlight row on decision"]],
        [1650, 2500, 2676, 2200]),
      gap(),

      H2("4.3 Data flow — the life of one item"),
      P("The flow below follows one item end to end. The engine sits in the middle of the story: it scores silently while the finder types, and its High pairs drive both the Match Centre and the claim that follows."),
      img(path.join(__dirname, "assets", "data-flow.png"), 600, 304, "Life of one item: from report to reunion"),
      caption("Figure 2 — The life of one item, from the lost report to the verified reunion."),
      img(path.join(__dirname, "assets", "screenshot-matchcentre.png"), 600, 403, "Match Centre with expanded scoring reasons"),
      caption("Figure 3 — Match Centre: the 97/100 High pair with its scoring reasons."),

      // ================= 5. DATABASE DESIGN =================
      H1("5. Database Design"),

      H2("5.1 Entities and relationships"),
      P("The design has four entities: Locations, LostItems, FoundItems and Claims. Locations exists so that \u201Cnearby zone\u201D scoring and per-building statistics work without repeating zone text inside every report row. The relationships are:"),
      bullet([B("Locations (1) — (N) LostItems: "), R("each lost report is filed at one location.")]),
      bullet([B("Locations (1) — (N) FoundItems: "), R("each found report likewise.")]),
      bullet([B("FoundItems (1) — (N) Claims and LostItems (1) — (0..N) Claims: "), R("a claim is an associative entity linking the person, the found item and (optionally) the matching lost report.")]),
      img(path.join(__dirname, "assets", "er-diagram.png"), 560, 418, "LostLink ER diagram"),
      caption("Figure 4 — ER diagram: four entities, primary and foreign keys, and the three relationship lines with cardinalities."),

      H2("5.2 Table descriptions"),
      P([B("Table LostItems")]),
      table(["Field", "Type", "Constraints"],
        [["LostItemID", "INT IDENTITY", "PRIMARY KEY"],
         ["OwnerName", "NVARCHAR(60)", "NOT NULL, CHECK (LEN(OwnerName) >= 2)"],
         ["ContactEmail", "NVARCHAR(100)", "NOT NULL"],
         ["Category", "TINYINT", "NOT NULL (enum 0-8)"],
         ["Colour", "NVARCHAR(30)", "NOT NULL"],
         ["Brand", "NVARCHAR(30)", "NULL"],
         ["LocationID", "INT", "FOREIGN KEY -> Locations.LocationID"],
         ["DateLost", "DATE", "NOT NULL, CHECK (DateLost <= GETDATE())"],
         ["Description", "NVARCHAR(400)", "NOT NULL, CHECK (LEN(Description) >= 10)"],
         ["EstimatedValueOmr", "INT", "NULL, CHECK (EstimatedValueOmr BETWEEN 0 AND 5000)"],
         ["Status", "TINYINT", "NOT NULL DEFAULT 0 (enum)"],
         ["ReportedAt", "DATETIME", "NOT NULL DEFAULT GETDATE()"]],
        [2600, 2100, 4326]),
      gap(),
      P([B("Table FoundItems")]),
      table(["Field", "Type", "Constraints"],
        [["FoundItemID", "INT IDENTITY", "PRIMARY KEY"],
         ["FinderName", "NVARCHAR(60)", "NOT NULL"],
         ["ContactEmail", "NVARCHAR(100)", "NOT NULL"],
         ["Category", "TINYINT", "NOT NULL (enum 0-8)"],
         ["Colour", "NVARCHAR(30)", "NOT NULL"],
         ["Brand", "NVARCHAR(30)", "NULL"],
         ["LocationID", "INT", "FOREIGN KEY -> Locations.LocationID"],
         ["DateFound", "DATE", "NOT NULL"],
         ["Description", "NVARCHAR(400)", "NOT NULL"],
         ["SecretQuestion", "NVARCHAR(200)", "NOT NULL"],
         ["SecretAnswer", "NVARCHAR(200)", "NOT NULL (never shown to claimants)"],
         ["PickupPoint", "NVARCHAR(100)", "NULL, revealed only after approval"],
         ["Status", "TINYINT", "NOT NULL DEFAULT 0 (enum)"],
         ["ReportedAt", "DATETIME", "NOT NULL DEFAULT GETDATE()"]],
        [2600, 2100, 4326]),
      gap(),
      P([B("Table Claims")]),
      table(["Field", "Type", "Constraints"],
        [["ClaimID", "INT IDENTITY", "PRIMARY KEY"],
         ["FoundItemID", "INT", "NOT NULL, FOREIGN KEY -> FoundItems.FoundItemID"],
         ["LostItemID", "INT", "NULL, FOREIGN KEY -> LostItems.LostItemID"],
         ["ClaimantName", "NVARCHAR(60)", "NOT NULL"],
         ["ClaimantEmail", "NVARCHAR(100)", "NOT NULL"],
         ["AnswerGiven", "NVARCHAR(200)", "NOT NULL"],
         ["SubmittedAt", "DATETIME", "NOT NULL DEFAULT GETDATE()"],
         ["Status", "TINYINT", "NOT NULL DEFAULT 0 (Pending/Approved/Rejected)"],
         ["AdminNote", "NVARCHAR(300)", "NULL"]],
        [2600, 2100, 4326]),
      gap(),
      P([B("Table Locations")]),
      table(["Field", "Type", "Constraints"],
        [["LocationID", "INT IDENTITY", "PRIMARY KEY"],
         ["Name", "NVARCHAR(60)", "NOT NULL, UNIQUE"],
         ["Zone", "NVARCHAR(40)", "NULL (e.g. Library / Academic Zone)"]],
        [2600, 2100, 4326]),
      gap(),
      P([new TextRun({ text: "In Phase 1 these tables are implemented as in-memory collections of C# entity classes, as specified; the schema above is the design they will be migrated into.", italics: true })]),
      pageBreak(),

      // ================= PART B WALKTHROUGH =================
      H1("Part B — Implementation Walkthrough"),
      P("LostLink is a fully functional ASP.NET Core 8 web application (Razor Pages) integrated with jQuery and Bootstrap 5. This section walks through every implementation requirement of the Phase 1 sheet and states exactly where each feature lives in the code."),

      H2("B6. Enumeration"),
      P([B("Where it lives: "), R("Models/Enums.cs. Four enumerations are defined — ItemCategory (nine values), ItemStatus, MatchLevel and ClaimStatus — and ItemCategory is used consistently across the whole application: it fills the Report Lost and Report Found dropdowns via Html.GetEnumSelectList, the Browse category filter, the seed data, the matching engine's first comparison, and the badges on three pages. The status enums drive the item life-cycle (Active, Matched, Resolved, Withdrawn) and the claim work-flow (Pending, Approved, Rejected).")]),

      H2("B7. C# classes"),
      P([B("Where it lives: "), R("Models/LostItem.cs, Models/FoundItem.cs and Models/Claim.cs, supported by Models/TextHelpers.cs. Each class mirrors one designed database table and carries validation attributes, a parameterless constructor for form binding, a full constructor used by the seed data, and business-logic methods that live with the data — DaysSinceLost, Summary and IsStillFindable on LostItem; Summary and CanAcceptClaims on FoundItem; and AnswerOverlap, the word-overlap pre-check, on Claim.")]),

      H2("B8. Front-end framework"),
      P([B("Where it lives: "), R("wwwroot/js/site.js. Six distinct jQuery techniques are demonstrated: (1) a debounced AJAX live match preview on Report Found that serialises the form and renders the engine's JSON, (2) fade-in effects on the preview cards, (3) live text search plus category filtering on Browse with no page reloads, (4) a character counter bound to the description textareas, (5) click-to-expand scoring reasons in the Match Centre, and (6) a confirmation dialog before submitting a claim — plus animated statistic counters on the home page and a row highlight on the Claims desk.")]),
      img(path.join(__dirname, "assets", "screenshot-livepreview.png"), 560, 439, "Report Found live match preview"),
      caption("Figure 5 — Report Found: as the finder types, the AJAX live preview scores the draft against every lost report (94/100 High, with reasons) and a character counter tracks the description."),

      H2("B9. Razor pages"),
      P([B("Where it lives: "), R("Pages/Index.cshtml, ReportLost.cshtml, ReportFound.cshtml, Browse.cshtml, Details.cshtml, MatchCentre.cshtml and Claims.cshtml. Seven pages are all reachable from the navbar; each supports form-based input and output with text boxes, enum dropdowns, date pickers, textareas, number inputs, tables, badges and buttons, and every page reads and writes the C# class collections through its page model. The Details page serves both kinds of report via /Details?kind=lost|found&id=...")]),

      H2("B10. Business logic"),
      P([B("Where it lives: "), R("Models/MatchEngine.cs plus the claim approval flow in Claims.cshtml.cs. The engine scores every lost/found pair out of 100 — category 30, colour family 15, brand 15, location 15 (8 nearby), time window 10, shared keywords 15 — and returns a written reason for every awarded point; 75+ is High, 50-74 Medium. The Claims handlers apply the verification work-flow: approval reveals the contact details and pickup point and flips both item statuses to Matched.")]),

      H2("B11. Custom layout"),
      P([B("Where it lives: "), R("Pages/Shared/_Layout.cshtml. One shared layout renders the teal navbar with links to all seven pages and a live lost/found counter, TempData success/error alerts, and the footer on every page. Two named sections (Styles and Scripts) are defined and used: form pages fill Scripts with the validation partial, and the Details page fills Styles with page-scoped CSS.")]),

      H2("B12. Error handling"),
      P([B("Where it lives: "), R("try/catch blocks in every OnPost handler with a friendly ModelState fallback, NotFound() guards on the Details and Claims handlers for bad ids, a customised Pages/Error.cshtml that explains each status code, and app.UseStatusCodePagesWithReExecute(\"/Error\", \"?code={0}\") in Program.cs so 404/403 responses land on the styled page.")]),
      img(path.join(__dirname, "assets", "screenshot-404.png"), 560, 394, "Styled 404 page"),
      caption("Figure 6 — A missing item id renders the branded 404 page instead of a blank server error."),

      H2("B13. Bootstrap styling"),
      P([B("Where it lives: "), R("wwwroot/css/site.css — a theme layer appended over the untouched Bootstrap 5 library. It defines the LostLink palette as CSS variables (teal, dark teal, amber), the gradient navbar, pill-shaped brand buttons, brand focus rings on form controls, soft-header hover tables, and High/Medium match badge colours; the same classes style forms, buttons, tables and navigation on all pages, and the navbar collapses responsively on narrow windows.")]),

      H2("B14. Form validation"),
      P([B("Where it lives: "), R("DataAnnotations on all three entity classes plus the _ValidationScriptsPartial on every form page. Five validator types are applied — Required, StringLength (with MinimumLength), Range (0-5000 on the estimated value), EmailAddress, and DataType.Date — each rendering styled field messages; validation runs instantly on the client via jQuery unobtrusive validation and is re-checked server-side in every handler.")]),

      // ================= PART C =================
      pageBreak(),
      H1("Part C — Collaboration and Submission"),

      H2("C1. Teamwork"),
      P("Tasks were distributed evenly between the two team members:"),
      table(["Member", "Tasks", "Work %"],
        [["Said Alsawafi (140004)",
          "Part A sections 1-3 and user interviews; entity classes, enums, repository and matching engine; ReportLost and Browse pages; form validation pass; GitHub setup", "50%"],
         ["Almutaz Alhadhrami (134812)",
          "Shared layout and Bootstrap theme; Home, ReportFound with live preview, Details, MatchCentre and Claims pages; jQuery features and error handling; report sections 4-5; video editing", "50%"]],
        [2360, 5366, 1300]),
      gap(),

      H2("C2. GitHub repository"),
      P([R("The complete source code is publicly available at "), ]),
      P([new ExternalHyperlink({
        children: [new TextRun({ text: "github.com/Said-Abdullah-Al-Sawafi/lostlink-comp4701", style: "Hyperlink" })],
        link: "https://github.com/Said-Abdullah-Al-Sawafi/lostlink-comp4701",
      })]),
      P("The repository contains the full solution (open LostLink.sln in Visual Studio 2022 and press F5), a README describing the stack and the rubric mapping, and this report in the docs folder. Every commit in the history documents the build step it delivered."),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(path.join(__dirname, "LostLink_Phase1_Report.docx"), buf);
  console.log("written", path.join(__dirname, "LostLink_Phase1_Report.docx"));
});
