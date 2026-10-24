"""Generates the ER diagram and the item-lifecycle flow diagram for the Part A report."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Circle
import os

TEAL, DARK, LIGHT, AMBER = "#0F766E", "#134E4A", "#E6F4F1", "#F59E0B"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(OUT, exist_ok=True)


def entity(ax, x, y_top, w, title, rows):
    """Draw an entity box anchored at its top edge. rows = (tag, text) pairs."""
    h_head = 5
    h_row = 3.6
    h = h_head + h_row * len(rows)
    ax.add_patch(FancyBboxPatch((x, y_top - h), w, h, boxstyle="round,pad=0.3,rounding_size=1",
                                fc="white", ec=DARK, lw=1.4, zorder=2))
    ax.add_patch(FancyBboxPatch((x, y_top - h_head), w, h_head,
                                boxstyle="round,pad=0.3,rounding_size=1",
                                fc=TEAL, ec=DARK, lw=1.4, zorder=3))
    ax.text(x + w / 2, y_top - h_head / 2, title, ha="center", va="center",
            color="white", fontsize=11, fontweight="bold", zorder=4)
    for i, (tag, txt) in enumerate(rows):
        cy = y_top - h_head - h_row * (i + 0.5)
        if tag:
            fweight = "bold" if tag == "PK" else "normal"
            fstyle = "normal" if tag == "PK" else "italic"
            color = AMBER if tag == "PK" else "#6B7280"
            ax.text(x + 2.5, cy, tag, ha="left", va="center", fontsize=8.5,
                    fontweight=fweight, fontstyle=fstyle, color=color, zorder=4)
        ax.text(x + 8, cy, txt, ha="left", va="center", fontsize=9,
                color="#1F2937", zorder=4)
    return h


# ---------------- ER diagram ----------------
fig, ax = plt.subplots(figsize=(11, 8.2))
ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis("off")

W = 38
lx, rx = 3, 59
h_loc = entity(ax, lx, 96, W, "Locations", [
    ("PK", "LocationID  (IDENTITY)"),
    ("",   "Name  (UNIQUE)"),
    ("",   "Zone"),
])
h_lost = entity(ax, rx, 96, W, "LostItems", [
    ("PK", "LostItemID  (IDENTITY)"),
    ("FK", "LocationID"),
    ("",   "OwnerName, ContactEmail"),
    ("",   "Category, Colour, Brand"),
    ("",   "DateLost, Description"),
    ("",   "EstimatedValueOmr"),
    ("",   "Status, ReportedAt"),
])
h_found = entity(ax, lx, 44, W, "FoundItems", [
    ("PK", "FoundItemID  (IDENTITY)"),
    ("FK", "LocationID"),
    ("",   "FinderName, ContactEmail"),
    ("",   "Category, Colour, Brand"),
    ("",   "DateFound, Description"),
    ("",   "SecretQuestion, SecretAnswer"),
    ("",   "PickupPoint"),
    ("",   "Status, ReportedAt"),
])
h_claim = entity(ax, rx, 44, W, "Claims", [
    ("PK", "ClaimID  (IDENTITY)"),
    ("FK", "FoundItemID"),
    ("FK", "LostItemID  (nullable)"),
    ("",   "ClaimantName, ClaimantEmail"),
    ("",   "AnswerGiven"),
    ("",   "SubmittedAt, Status"),
    ("",   "AdminNote"),
])

LINE = dict(color=DARK, lw=1.6, zorder=1)


def rel(x1, y1, x2, y2, lab1, lab2, lpos):
    ax.plot([x1, x2], [y1, y2], **LINE)
    for (px, py), lab, ha, va in zip(lpos, (lab1, lab2),
                                     ("right", "left"), ("bottom", "bottom")):
        ax.text(px, py, lab, fontsize=10, fontweight="bold", color=TEAL,
                ha=ha, va=va, zorder=5,
                bbox=dict(fc="white", ec="none", pad=1))


# Locations (1) -- (N) LostItems   (straight horizontal at y=88)
rel(lx + W, 88, rx, 88, "1", "N",
    [(lx + W + 1.5, 88.8), (rx - 1.5, 88.8)])
# Locations (1) -- (N) FoundItems  (vertical on the left)
rel(lx + W / 2, 96 - h_loc, lx + W / 2, 44, "1", "N",
    [(lx + W / 2 + 1.2, 96 - h_loc - 2.5), (lx + W / 2 + 1.2, 44 + 2.5)])
# LostItems (1) -- (0..N) Claims   (vertical on the right)
rel(rx + W / 2, 96 - h_lost, rx + W / 2, 44, "1", "0..N",
    [(rx + W / 2 + 1.2, 96 - h_lost - 2.5), (rx + W / 2 + 1.2, 44 + 2.5)])
# FoundItems (1) -- (N) Claims     (straight horizontal at y=28)
rel(lx + W, 28, rx, 28, "1", "N",
    [(lx + W + 1.5, 28.8), (rx - 1.5, 28.8)])

ax.text(50, 1.5, "A claim is an associative entity: it links the claimant, the found item "
                 "and (optionally) the matching lost report.",
        ha="center", fontsize=9, style="italic", color="#4B5563")
fig.savefig(os.path.join(OUT, "er-diagram.png"), dpi=200, bbox_inches="tight",
            facecolor="white")
plt.close(fig)

# ---------------- Life-of-one-item flow diagram ----------------
fig, ax = plt.subplots(figsize=(12, 6))
ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis("off")

steps = [
    "Owner reports\nthe item lost\n(Report Lost form)",
    "Finder registers\nthe found item + secret\nquestion (live preview\nscores while typing)",
    "Engine scores every\nlost/found pair 0\u2013100\nwith written reasons",
    "Match Centre & Details\nshow High/Medium pairs\nwith explanations",
    "Owner claims by\nanswering the\nsecret question",
    "Admin verifies: expected\nvs given answer +\nword-overlap badge",
    "Approval reveals both\ncontacts and the\npickup point",
    "Statuses become\nMatched \u2014 reunion\ncomplete",
]
BW, BH = 21, 26
xs = [2.5, 27.5, 52.5, 77.5]
y1, y2 = 62, 18
pos = [(xs[0], y1), (xs[1], y1), (xs[2], y1), (xs[3], y1),
       (xs[3], y2), (xs[2], y2), (xs[1], y2), (xs[0], y2)]

for i, ((x, y), txt) in enumerate(zip(pos, steps), start=1):
    ax.add_patch(FancyBboxPatch((x, y), BW, BH, boxstyle="round,pad=0.4,rounding_size=2",
                                fc=LIGHT, ec=TEAL, lw=1.5, zorder=2))
    ax.add_patch(Circle((x + 3.2, y + BH - 3.2), 2.0, fc=TEAL, ec="none", zorder=3))
    ax.text(x + 3.2, y + BH - 3.2, str(i), ha="center", va="center",
            color="white", fontsize=9, fontweight="bold", zorder=4)
    ax.text(x + BW / 2, y + BH / 2 - 1.5, txt, ha="center", va="center",
            fontsize=8.6, color="#1F2937", zorder=4)

def arrow(p1, p2):
    ax.annotate("", xy=p2, xytext=p1,
                arrowprops=dict(arrowstyle="-|>", color=DARK, lw=1.8,
                                shrinkA=2, shrinkB=2))

for i in range(3):                                        # row 1: left -> right
    arrow((xs[i] + BW + 0.6, y1 + BH / 2), (xs[i + 1] - 0.8, y1 + BH / 2))
arrow((xs[3] + BW / 2, y1 - 0.8), (xs[3] + BW / 2, y2 + BH + 0.8))   # 4 -> 5
for i in range(3, 0, -1):                                 # row 2: right -> left
    arrow((xs[i] - 0.8, y2 + BH / 2), (xs[i - 1] + BW + 0.6, y2 + BH / 2))

fig.savefig(os.path.join(OUT, "data-flow.png"), dpi=200, bbox_inches="tight",
            facecolor="white")
plt.close(fig)
print("diagrams written to", OUT)
