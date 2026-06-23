# -*- coding: utf-8 -*-
"""Builds the La Liga Sombra 18-Week Spanish 1 Course Guide PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether, ListFlowable, ListItem,
)
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "course_guide.pdf"

# ── Palette ───────────────────────────────────────────────────────────────────
INK     = colors.HexColor("#1a1a1a")
GOLD    = colors.HexColor("#8b5e10")
GOLDLT  = colors.HexColor("#c9933a")
GRAY    = colors.HexColor("#5f5e5a")
LGRAY   = colors.HexColor("#efece4")
BORDER  = colors.HexColor("#1a1a1a")
PANEL   = colors.HexColor("#f6f3ec")

styles = getSampleStyleSheet()

def S(name, **kw):
    base = kw.pop("parent", styles["Normal"])
    return ParagraphStyle(name, parent=base, **kw)

H1   = S("H1", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=GOLD, spaceAfter=4, spaceBefore=2)
H2   = S("H2", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=INK, spaceBefore=14, spaceAfter=4)
H3   = S("H3", fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=GOLD, spaceBefore=10, spaceAfter=2)
BODY = S("Body", fontName="Times-Roman", fontSize=10.5, leading=15, textColor=INK, spaceAfter=6)
BODYI= S("BodyI", parent=BODY, fontName="Times-Italic")
LABEL= S("Label", fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=GRAY)
KICK = S("Kick", fontName="Courier-Bold", fontSize=8, leading=11, textColor=GRAY)
KICKW= S("KickW", fontName="Courier-Bold", fontSize=8, leading=11, textColor=colors.white)
WSMONO = S("WSMono", fontName="Courier", fontSize=8.5, leading=12, textColor=INK)
WSMONOB= S("WSMonoB", fontName="Courier-Bold", fontSize=8.5, leading=12, textColor=INK)
WSSERIF= S("WSSerif", fontName="Times-Roman", fontSize=9, leading=12.5, textColor=INK)
WHY  = S("Why", fontName="Times-Roman", fontSize=9.5, leading=13.5, textColor=INK)
SMALL= S("Small", fontName="Times-Roman", fontSize=8.5, leading=11.5, textColor=GRAY)
COVERT = S("CoverT", fontName="Helvetica-Bold", fontSize=40, leading=42, textColor=INK, alignment=TA_CENTER)
COVERS = S("CoverS", fontName="Courier", fontSize=11, leading=16, textColor=GRAY, alignment=TA_CENTER)

# ── Document with header/footer ───────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont("Courier", 7)
        canvas.setFillColor(GRAY)
        canvas.drawString(0.75*inch, 0.55*inch, "LA LIGA SOMBRA  ·  18-WEEK SPANISH 1 COURSE GUIDE")
        canvas.drawRightString(7.75*inch, 0.55*inch, f"{doc.page}")
        canvas.setStrokeColor(colors.HexColor("#d3d1c7"))
        canvas.setLineWidth(0.5)
        canvas.line(0.75*inch, 0.7*inch, 7.75*inch, 0.7*inch)
    canvas.restoreState()

doc = BaseDocTemplate(
    OUT, pagesize=letter,
    leftMargin=0.75*inch, rightMargin=0.75*inch, topMargin=0.7*inch, bottomMargin=0.8*inch,
    title="La Liga Sombra — 18-Week Spanish 1 Course Guide",
    author="La Liga Sombra",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=on_page)])

story = []

def rule(color=GOLD, w=1.2, sb=2, sa=6):
    story.append(HRFlowable(width="100%", thickness=w, color=color, spaceBefore=sb, spaceAfter=sa))

def bullets(items, style=BODY, gap=2):
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=10, value="•") for t in items],
        bulletType="bullet", start="•", leftIndent=12, spaceBefore=0, spaceAfter=4,
    )

def panel(flowables, pad=8, bg=PANEL, border=None):
    t = Table([[flowables]], colWidths=[doc.width])
    cmds = [
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("LEFTPADDING",(0,0),(-1,-1),pad), ("RIGHTPADDING",(0,0),(-1,-1),pad),
        ("TOPPADDING",(0,0),(-1,-1),pad), ("BOTTOMPADDING",(0,0),(-1,-1),pad),
    ]
    if border:
        cmds.append(("BOX",(0,0),(-1,-1),border[0],border[1]))
    t.setStyle(TableStyle(cmds))
    return t

def why(text):
    """A 'why it works' pedagogy callout with a left rule."""
    inner = [Paragraph('<font name="Courier-Bold" size=7 color="#8b5e10">WHY IT WORKS</font>', LABEL),
             Spacer(1,2), Paragraph(text, WHY)]
    t = Table([[inner]], colWidths=[doc.width])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1), colors.HexColor("#faf6ec")),
        ("LINEBEFORE",(0,0),(0,-1), 3, GOLDLT),
        ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),8),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
    ]))
    return t

# ══ COVER ═════════════════════════════════════════════════════════════════════
story.append(Spacer(1, 1.4*inch))
story.append(Paragraph("LA LIGA SOMBRA", S("c1", fontName="Courier-Bold", fontSize=13, leading=16, textColor=GRAY, alignment=TA_CENTER)))
story.append(Paragraph("Agencia Internacional de Detectives", COVERS))
story.append(Spacer(1, 0.35*inch))
story.append(Paragraph("18-Week<br/>Course Guide", COVERT))
story.append(Spacer(1, 0.18*inch))
story.append(Paragraph("Spanish 1  ·  Novice Low &#8594; Intermediate Low  ·  ACTFL-aligned", COVERS))
story.append(Spacer(1, 0.5*inch))
story.append(HRFlowable(width="55%", thickness=1.4, color=GOLD, hAlign="CENTER"))
story.append(Spacer(1, 0.25*inch))
story.append(Paragraph(
    "A full-semester course where students play a detective game two days a week and "
    "build their Spanish through detective-themed worksheets, culture projects, and "
    "presentations the other days &mdash; chasing a ring of thieves across ten Spanish-"
    "speaking countries while they learn.",
    S("covbody", fontName="Times-Italic", fontSize=11, leading=16, textColor=INK, alignment=TA_CENTER)))
story.append(Spacer(1, 0.6*inch))
story.append(Paragraph("&#9646; &#9646; &#9646;  Teacher Edition  &#9646; &#9646; &#9646;", COVERS))
story.append(PageBreak())

# ══ 1. HOW THE COURSE WORKS ═══════════════════════════════════════════════════
story.append(Paragraph("How the course works", H1))
rule()
story.append(Paragraph(
    "La Liga Sombra turns Spanish 1 into a season-long detective story. Students are "
    "rookie agents of an international agency; each unit is a case set in a different "
    "Spanish-speaking country, and the only way to catch the thief is to understand the "
    "Spanish clues. The game supplies rich, low-anxiety input; the worksheets, culture "
    "days, and presentations turn that input into real, durable language.", BODY))

story.append(Paragraph("The three ACTFL communication modes", H3))
story.append(Paragraph(
    "Every week touches all three modes of the ACTFL World-Readiness Standards, and the "
    "teacher dashboard reports proficiency in each:", BODY))
story.append(bullets([
    "<b>Interpretive</b> &mdash; reading case files and listening to witness audio in the game.",
    "<b>Interpersonal</b> &mdash; choosing responses in witness interviews and pair work.",
    "<b>Presentational</b> &mdash; writing on the worksheets and the three milestone presentations.",
]))

story.append(Paragraph("The learning ladder: recognize &#8594; produce &#8594; present", H3))
story.append(Paragraph(
    "The whole semester climbs one ladder, repeated ten times with spiraling vocabulary. "
    "This sequence mirrors how proficiency is actually built &mdash; comprehensible input "
    "first, then pushed output:", BODY))
ladder = Table([
    [Paragraph("<b>1 · Recognize</b><br/>The game", WSSERIF),
     Paragraph("Students meet each word inside a story, match it, and hear it. High-volume, "
               "low-stakes exposure &mdash; Krashen&rsquo;s comprehensible input.", SMALL)],
    [Paragraph("<b>2 · Produce</b><br/>The worksheets", WSSERIF),
     Paragraph("Students write the same words and grammar by hand, away from the screen. "
               "Retrieval practice + the generation effect move language into long-term memory.", SMALL)],
    [Paragraph("<b>3 · Present</b><br/>Milestones &amp; capstone", WSSERIF),
     Paragraph("Students say it to an audience. Swain&rsquo;s output hypothesis: speaking forces "
               "learners to test and consolidate what they know.", SMALL)],
], colWidths=[1.5*inch, doc.width-1.5*inch])
ladder.setStyle(TableStyle([
    ("BOX",(0,0),(-1,-1),0.8,BORDER), ("INNERGRID",(0,0),(-1,-1),0.5,colors.HexColor("#d3d1c7")),
    ("VALIGN",(0,0),(-1,-1),"TOP"), ("BACKGROUND",(0,0),(0,-1),PANEL),
    ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
    ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
]))
story.append(ladder)
story.append(Spacer(1,6))
story.append(Paragraph(
    "Because vocabulary <b>spirals</b> &mdash; Unit 4 family words return when students "
    "describe a suspect in Unit 7; Unit 8 preterite resurfaces in the capstone &mdash; "
    "students aren&rsquo;t cramming and forgetting. Over the 72 instructional days, an "
    "engaged class realistically moves from <b>Novice Low to Intermediate Low</b>.", BODY))

# ══ 2. THE 4-DAY ENGINE ═══════════════════════════════════════════════════════
story.append(Paragraph("The 4-day weekly engine", H2))
story.append(Paragraph(
    "Every unit week runs the same dependable rhythm, so students and substitutes always "
    "know the shape of the day. Two days in the field (the game), one day at HQ "
    "(worksheets), one culture day.", BODY))

engine = Table([
    [Paragraph("DAY", KICKW), Paragraph("WHERE", KICKW), Paragraph("WHAT", KICKW), Paragraph("THE SKILL IT BUILDS", KICKW)],
    [Paragraph("1 &amp; 2", WSMONO), Paragraph("Field<br/>(computer)", WSSERIF),
     Paragraph("Play the case: Academia warm-up, briefing, evidence, interviews, capture the suspect.", WSSERIF),
     Paragraph("Interpretive input + interpersonal; recognition and meaning.", WSSERIF)],
    [Paragraph("3", WSMONO), Paragraph("HQ<br/>(paper)", WSSERIF),
     Paragraph("Vocabulary + Grammar worksheets &mdash; the same words and grammar, off-screen.", WSSERIF),
     Paragraph("Production: handwriting the language aids retention.", WSSERIF)],
    [Paragraph("4", WSMONO), Paragraph("Culture<br/>(paper / together)", WSSERIF),
     Paragraph("Culture file (the three P&rsquo;s) + a creative product; Pasaporte page; work toward the milestone.", WSSERIF),
     Paragraph("Presentational + cultural competence (the 5 C&rsquo;s).", WSSERIF)],
], colWidths=[0.5*inch, 1.1*inch, 3.0*inch, doc.width-0.5*inch-1.1*inch-3.0*inch])
engine.setStyle(TableStyle([
    ("BOX",(0,0),(-1,-1),0.8,BORDER), ("INNERGRID",(0,0),(-1,-1),0.5,colors.HexColor("#d3d1c7")),
    ("VALIGN",(0,0),(-1,-1),"TOP"), ("BACKGROUND",(0,0),(-1,0),INK),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
    ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
]))
# recolor header text cells (Paragraphs already gray; override with white via row bg + style)
story.append(engine)
story.append(Spacer(1,4))
story.append(why(
    "Routine lowers cognitive load and anxiety, freeing working memory for language. The "
    "screen days deliver input at scale; the paper days force the retrieval and output that "
    "screens make too easy to skip. Alternating the two is interleaving &mdash; proven to "
    "beat massed practice for long-term retention."))
story.append(PageBreak())

# ══ 3. THE 18-WEEK PACING PLAN ════════════════════════════════════════════════
story.append(Paragraph("The 18-week pacing plan", H1))
rule()
story.append(Paragraph(
    "Three six-week arcs. Ten unit weeks run the 4-day engine; review and prep weeks, the "
    "Oper&#225;ci&#243;n Eclipse boss mission, two presentation milestones, and a two-week "
    "capstone fill out the rest. This same plan is a check-off tab in the teacher dashboard.", BODY))

ARC_DATA = [
    ("ARC 1 · Foundations", "Weeks 1–6 · Novice Low → Mid", [
        ("1", "Orientation + Unit 1 · México", "Set up accounts, hand out Pasaportes, play ¿Quién soy yo? (greetings, numbers)."),
        ("2", "Unit 2 · Puerto Rico", "El robo en la escuela. Classroom vocab, ser + adjectives, -AR verbs."),
        ("3", "Unit 3 · España", "Persecución por Madrid. Places, transport, the verb ir."),
        ("4", "Review & culture catch-up", "Re-teach weak vocab/grammar (Inbox + Units tabs); finish culture pages."),
        ("5", "Milestone 1 prep", "Hand out the Field Report sheet; draft 60-second scripts from frames; practice."),
        ("6", "Milestone 1 presentations", "60-second Field Report. Score with the rubric (target: Novice Mid)."),
    ]),
    ("ARC 2 · Daily life & description", "Weeks 7–12 · Novice Mid → High", [
        ("7", "Unit 4 · Costa Rica", "La Familia Sospechosa. Family, emotions, ser vs estar."),
        ("8", "Unit 5 · Argentina", "Hackeo en Buenos Aires. Tech, numbers, dates, tener-expressions."),
        ("9", "Operación Eclipse · boss", "A five-country chase synthesizing Units 1–5; debrief the ethical decision."),
        ("10", "Unit 6 · Colombia", "El Chef Misterioso. Food, stem-changing verbs, demonstratives."),
        ("11", "Milestone 2 prep", "Hand out the Case Briefing sheet; build note cards; practice in pairs."),
        ("12", "Milestone 2 presentations", "2-minute Case Briefing + culture comparison (target: Novice High)."),
    ]),
    ("ARC 3 · Culture & future", "Weeks 13–18 · Novice High → Intermediate Low", [
        ("13", "Unit 7 · Chile", "Sabotaje en el Festival. Arts, weather, stem-changers, ordinals."),
        ("14", "Unit 8 · Perú", "El Mercado Robado. Markets, the preterite, comparatives."),
        ("15", "Unit 9 · Rep. Dominicana", "El Taíno Robado. Body, health, the verb doler."),
        ("16", "Unit 10 · Ecuador + Capstone launch", "La Expo del Futuro. Careers, the future. Begin capstone research."),
        ("17", "Capstone · build & practice", "Design an original case (suspect with ser/estar, Spanish clues); rehearse."),
        ("18", "Capstone presentations + reflection", "Present Diseña Tu Propio Caso; class solves each; Pasaporte reflection."),
    ]),
]

for arc_title, arc_sub, weeks in ARC_DATA:
    rows = [[Paragraph("WK", KICK), Paragraph("FOCUS", KICK), Paragraph("THIS WEEK", KICK)]]
    for wk, title, desc in weeks:
        rows.append([Paragraph(wk, WSMONOB), Paragraph(f"<b>{title}</b>", WSSERIF), Paragraph(desc, WSSERIF)])
    t = Table(rows, colWidths=[0.4*inch, 1.95*inch, doc.width-0.4*inch-1.95*inch])
    t.setStyle(TableStyle([
        ("BOX",(0,0),(-1,-1),0.7,BORDER), ("INNERGRID",(0,0),(-1,-1),0.4,colors.HexColor("#d3d1c7")),
        ("VALIGN",(0,0),(-1,-1),"TOP"), ("BACKGROUND",(0,0),(-1,0),LGRAY),
        ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
    ]))
    # Keep each arc's heading + table on the same page (no orphan rows)
    story.append(KeepTogether([
        Paragraph(arc_title, H3),
        Paragraph(arc_sub, S("arcsub", fontName="Courier", fontSize=8, textColor=GRAY, spaceAfter=3)),
        t,
        Spacer(1,8),
    ]))

story.append(PageBreak())

# ══ 4. THE WORKSHEET SYSTEM ═══════════════════════════════════════════════════
story.append(Paragraph("The worksheet system", H1))
rule()
story.append(Paragraph(
    "Each unit auto-generates a print-ready, black-and-white packet from that unit&rsquo;s "
    "real vocabulary and grammar, in the same detective voice as the game. On the HQ day "
    "(Day 3) you print the Vocabulary + Grammar files; on the culture day (Day 4) you print "
    "the Culture file. Below is a representative sample of each &mdash; using Unit 2 (Puerto "
    "Rico) &mdash; with the pedagogy behind every section.", BODY))

# Helper: a worksheet "sheet" frame
def ws_frame(title_label, inner):
    head = Table([[Paragraph("LA LIGA SOMBRA · CONFIDENTIAL", KICK),
                   Paragraph(title_label, S("wr", fontName="Courier-Bold", fontSize=8, textColor=INK, alignment=2))]],
                 colWidths=[doc.width*0.6-16, doc.width*0.4-16])
    head.setStyle(TableStyle([("LINEBELOW",(0,0),(-1,-1),1,BORDER),
        ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
        ("BOTTOMPADDING",(0,0),(-1,-1),3),("TOPPADDING",(0,0),(-1,-1),0)]))
    content = [head, Spacer(1,5)] + inner
    box = Table([[content]], colWidths=[doc.width])
    box.setStyle(TableStyle([
        ("BOX",(0,0),(-1,-1),1.1,BORDER), ("BACKGROUND",(0,0),(-1,-1),colors.white),
        ("LEFTPADDING",(0,0),(-1,-1),14),("RIGHTPADDING",(0,0),(-1,-1),14),
        ("TOPPADDING",(0,0),(-1,-1),12),("BOTTOMPADDING",(0,0),(-1,-1),12),
    ]))
    return box

def numbered(n, es, en):
    return Paragraph(
        f'<font name="Courier-Bold" size=9>[{n}]</font>&nbsp;&nbsp;'
        f'<font name="Helvetica-Bold" size=10>{es}</font>&nbsp;'
        f'<font name="Courier" size=8>/ {en}</font>', WSSERIF)

# ── 4a. Vocabulary File ───────────────────────────────────────────────────────
story.append(Paragraph("File 1 &mdash; the Vocabulary File", H2))
story.append(Paragraph("Printed Day 3. Three activities move from recognition to recall to spelling.", BODYI))

match_tbl = Table([
    [Paragraph("A. el libro", WSSERIF), Paragraph("___ 1. chair", WSSERIF)],
    [Paragraph("B. la silla", WSSERIF), Paragraph("___ 2. to study", WSSERIF)],
    [Paragraph("C. la mochila", WSSERIF), Paragraph("___ 3. book", WSSERIF)],
    [Paragraph("D. estudiar", WSSERIF), Paragraph("___ 4. backpack", WSSERIF)],
], colWidths=[(doc.width-28)/2]*2)
match_tbl.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),
    ("TOPPADDING",(0,0),(-1,-1),1),("BOTTOMPADDING",(0,0),(-1,-1),1)]))

ws1 = ws_frame("VOCABULARY FILE", [
    numbered(1, "Archivo de Vocabulario", "Match the Evidence"),
    Paragraph("Draw a line from each Spanish word to its English meaning; write the letter in the box.", SMALL),
    Spacer(1,3), match_tbl, Spacer(1,7),
    numbered(2, "Traduce la Evidencia", "Translate the Evidence"),
    Paragraph('<font name="Courier" size=8>ES&#8594;EN</font> &nbsp; la pizarra ________________ &nbsp;&nbsp; '
              '<font name="Courier" size=8>EN&#8594;ES</font> &nbsp; to speak ________________', WSSERIF),
    Spacer(1,7),
    numbered(3, "Pistas Revueltas", "Unscramble the Clues"),
    Paragraph('<font name="Courier-Bold" size=9>ZÁIL PE</font> &nbsp; <i>(pencil)</i> &#8594; ________________', WSSERIF),
])
story.append(ws1)
story.append(Spacer(1,6))
story.append(why(
    "<b>Match</b> is pure recognition &mdash; the lowest-stakes retrieval, ideal for activating "
    "prior knowledge at the start of class. <b>Translate both directions</b> (ES&#8594;EN and "
    "EN&#8594;ES) is harder: EN&#8594;ES is <i>productive</i> recall, where the learner must "
    "generate the Spanish, not just recognize it. <b>Unscramble</b> forces attention to "
    "orthography &mdash; the letter order and accents that students skim past when only reading. "
    "Together they hit a word three different ways, which is exactly what spaced, varied "
    "retrieval research recommends."))

story.append(PageBreak())

# ── 4b. Grammar File ──────────────────────────────────────────────────────────
story.append(Paragraph("File 2 &mdash; the Grammar File", H2))
story.append(Paragraph("Printed Day 3. A reference anchor, then a scaffolded climb from recognition to free production.", BODYI))

ref = Table([
    [Paragraph("Pronombre", KICK), Paragraph("hablar", KICK), Paragraph("ser", KICK)],
    [Paragraph("yo", WSMONO), Paragraph("hablo", WSMONOB), Paragraph("soy", WSMONOB)],
    [Paragraph("tú", WSMONO), Paragraph("hablas", WSMONOB), Paragraph("eres", WSMONOB)],
    [Paragraph("él / ella", WSMONO), Paragraph("habla", WSMONOB), Paragraph("es", WSMONOB)],
    [Paragraph("nosotros", WSMONO), Paragraph("hablamos", WSMONOB), Paragraph("somos", WSMONOB)],
    [Paragraph("ellos / ellas", WSMONO), Paragraph("hablan", WSMONOB), Paragraph("son", WSMONOB)],
], colWidths=[(doc.width-28)/3]*3)
ref.setStyle(TableStyle([("BOX",(0,0),(-1,-1),0.7,BORDER),("INNERGRID",(0,0),(-1,-1),0.4,colors.HexColor("#bdbbb2")),
    ("BACKGROUND",(0,0),(-1,0),LGRAY),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),
    ("LEFTPADDING",(0,0),(-1,-1),5)]))

ws2 = ws_frame("GRAMMAR FILE", [
    Paragraph('<font name="Helvetica-Bold" size=10>Ser + Adjectives &amp; Regular -AR Verbs</font>', WSSERIF),
    Paragraph("To describe a suspect: SER + an adjective (el sospechoso <b>es</b> alto). Adjectives agree: "
              "serio / seria. Regular -AR verbs drop -ar and add -o, -as, -a, -amos, -an.", SMALL),
    Spacer(1,4),
    Paragraph('<font name="Courier" size=7 color="#5f5e5a">REGULAR -AR VERBS (hablar) &amp; SER</font>', LABEL),
    Spacer(1,2), ref, Spacer(1,7),
    numbered(1, "Descifra el Código", "Crack the Code &mdash; word bank"),
    Paragraph('Word bank: <b>es &middot; hablamos &middot; estudio &middot; trabajan</b>', SMALL),
    Paragraph("El sospechoso ______ alto y moreno. &nbsp;&nbsp; Yo ______ espa&#241;ol todos los d&#237;as.", WSSERIF),
    Spacer(1,6),
    numbered(2, "Transformación", "Make the adjective agree"),
    Paragraph("El detective es serio. &#8594; La detective es __________.", WSSERIF),
    Spacer(1,6),
    numbered(3, "Informe de Campo", "Field Report &mdash; write your own"),
    Paragraph("Write three original sentences describing a suspect. Underline the grammar you used.", SMALL),
    Paragraph("1. ______________________________________________", WSSERIF),
])
story.append(ws2)
story.append(Spacer(1,6))
story.append(why(
    "The <b>reference table</b> is a deliberate scaffold &mdash; students keep the full paradigm "
    "beside them so working memory goes to <i>using</i> the verb, not retrieving the ending "
    "(Vygotsky&rsquo;s zone of proximal development). The three drills then <b>release the "
    "scaffold gradually</b>: <b>Crack the Code</b> is recognition with a word bank; "
    "<b>Transformation</b> is supported production (change one form); <b>Write your own</b> is "
    "free production. That gradual-release arc (I do &#8594; we do &#8594; you do) is how "
    "controlled practice becomes spontaneous use."))

story.append(PageBreak())

# ── 4c. Culture File ──────────────────────────────────────────────────────────
story.append(Paragraph("File 3 &mdash; the Culture File", H2))
story.append(Paragraph("Printed Day 4. Built on ACTFL&rsquo;s three P&rsquo;s; students analyze culture, then create.", BODYI))

ws3 = ws_frame("CULTURE FILE", [
    Paragraph('<font name="Helvetica-Bold" size=11>School Life in Puerto Rico</font>', WSSERIF),
    Spacer(1,3),
    Paragraph('<font name="Courier" size=7 color="#5f5e5a">PRODUCTS / PRODUCTOS</font>', LABEL),
    Paragraph("Students use la mochila, el cuaderno, el l&#225;piz, la computadora. Many schools require "
              "uniforms (uniformes)&hellip;", SMALL),
    Spacer(1,3),
    Paragraph('<font name="Courier" size=7 color="#5f5e5a">PRACTICES / PRÁCTICAS</font>', LABEL),
    Paragraph("Classes are taught in Spanish, and English (ingl&#233;s) is required because of strong ties "
              "to the United States&hellip;", SMALL),
    Spacer(1,3),
    Paragraph('<font name="Courier" size=7 color="#5f5e5a">PERSPECTIVES / PERSPECTIVAS</font>', LABEL),
    Paragraph("Being bilingual is seen as an advantage and a source of pride, connecting students to two "
              "cultures at once.", SMALL),
    Spacer(1,6),
    numbered(1, "Comprensión", "Check the Evidence"),
    Paragraph("What required subject connects Puerto Rico to the US? ________________", WSSERIF),
    Spacer(1,5),
    numbered(2, "Compara las Culturas", "Compare Cultures"),
    Paragraph("Compare a school day in Puerto Rico to your own &mdash; what is the same, what is different? "
              "(2&ndash;3 sentences, in Spanish + English.)", SMALL),
    Spacer(1,5),
    numbered(3, "Proyecto Cultural", "Mi Día Escolar — comparison chart"),
    Paragraph("Build a T-chart comparing your school day to Puerto Rico; label 6 supplies in Spanish; "
              "write 3 sentences using -AR verbs.", SMALL),
])
story.append(ws3)
story.append(Spacer(1,6))
story.append(why(
    "The reading is <b>English with the unit&rsquo;s Spanish terms woven in</b> &mdash; the right "
    "level for Novices, who can&rsquo;t yet read dense Spanish but can absorb target vocabulary in "
    "a meaningful context. Framing it as <b>Products, Practices, Perspectives</b> teaches culture "
    "as analysis, not trivia (ACTFL &lsquo;Cultures&rsquo;). <b>Compara</b> is the ACTFL "
    "&lsquo;Comparisons&rsquo; standard &mdash; students reflect on their own culture through the "
    "new one. The <b>creative project</b> makes culture <i>student-produced</i>, not consumed, and "
    "feeds directly into the Pasaporte and the presentations."))

# ══ 5. PASAPORTE ══════════════════════════════════════════════════════════════
story.append(PageBreak())
story.append(Paragraph("El Pasaporte Cultural", H1))
rule()
story.append(Paragraph(
    "Each student keeps a printed passport for the whole semester. It is the connective "
    "tissue between the weekly culture days and the source material for every presentation.", BODY))
story.append(bullets([
    "<b>Cover + Agent ID</b> &mdash; agent name, self-portrait, languages, mission.",
    "<b>Mapa de la Liga</b> &mdash; a progress map; students earn a &lsquo;visa stamp&rsquo; per case solved (goal: 10/10).",
    "<b>One page per country</b> &mdash; the case solved, a culture fact in Spanish, the project they made, a favorite new word, and a teacher stamp box.",
    "<b>Final reflection</b> &mdash; an end-of-semester reflection and an &lsquo;Agente Graduado&rsquo; certificate.",
]))
story.append(why(
    "A semester-long artifact gives culture days continuity and gives students a tangible record "
    "of growth &mdash; powerful for motivation and for showing parents and administrators concrete "
    "evidence of learning. Because every page is written in simple Spanish, the passport doubles "
    "as a cumulative writing portfolio. A printable class tracking grid lets you record "
    "culture-participation at report time."))

# ══ 6. PRESENTATIONS & RUBRIC ═════════════════════════════════════════════════
story.append(Paragraph("Presentations &amp; the capstone", H2))
story.append(Paragraph(
    "Three speaking milestones, one per arc, each scaffolded a little less, moving students up "
    "the ACTFL presentational scale. One rubric grades all three; only the target band rises.", BODY))
mile = Table([
    [Paragraph("WHEN", KICK), Paragraph("MILESTONE", KICK), Paragraph("TASK", KICK), Paragraph("SCAFFOLD", KICK), Paragraph("TARGET", KICK)],
    [Paragraph("Week 6", WSMONO), Paragraph("Informe de Campo", WSSERIF), Paragraph("Introduce your agent + one culture fact (~60s).", SMALL), Paragraph("Memorized; full sentence frames.", SMALL), Paragraph("Novice Mid", SMALL)],
    [Paragraph("Week 12", WSMONO), Paragraph("Informe del Caso", WSSERIF), Paragraph("Brief a solved case + culture comparison (~2 min).", SMALL), Paragraph("Note cards.", SMALL), Paragraph("Novice High", SMALL)],
    [Paragraph("Weeks 17–18", WSMONO), Paragraph("Diseña Tu Propio Caso", WSSERIF), Paragraph("Research a real city; design &amp; present an original case (3–4 min).", SMALL), Paragraph("Student-built from research.", SMALL), Paragraph("Interm. Low", SMALL)],
], colWidths=[0.85*inch, 1.4*inch, 2.3*inch, 1.3*inch, doc.width-0.85*inch-1.4*inch-2.3*inch-1.3*inch])
mile.setStyle(TableStyle([
    ("BOX",(0,0),(-1,-1),0.7,BORDER),("INNERGRID",(0,0),(-1,-1),0.4,colors.HexColor("#d3d1c7")),
    ("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(-1,0),LGRAY),
    ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
]))
story.append(mile)
story.append(Spacer(1,5))
story.append(why(
    "Spacing the milestones lets you and the students <i>see</i> the climb. Decreasing the "
    "scaffold each time (memorized &#8594; notes &#8594; improvised from research) follows the "
    "gradual-release model at the level of the whole semester. The <b>capstone</b> &mdash; "
    "students write and perform their own case while the class solves it &mdash; is the highest "
    "form of the work: research, culture, creativity, and spontaneous speech at once, and it "
    "doubles as the final assessment."))

RCRIT = S("RCrit", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=INK)
rub = Table([
    [Paragraph("CRITERION", KICKW), Paragraph("1 · Needs support", KICKW), Paragraph("2 · Approaching", KICKW), Paragraph("3 · Meets", KICKW), Paragraph("4 · Exceeds", KICKW)],
    [Paragraph("Contenido", RCRIT), Paragraph("Missing parts; very short.", SMALL), Paragraph("Some parts; incomplete.", SMALL), Paragraph("All required parts.", SMALL), Paragraph("All parts + extra detail.", SMALL)],
    [Paragraph("Vocabulario", RCRIT), Paragraph("Few unit words; leans on English.", SMALL), Paragraph("Some unit words; gaps.", SMALL), Paragraph("Unit vocab used correctly.", SMALL), Paragraph("Rich, varied vocabulary.", SMALL)],
    [Paragraph("Gramática", RCRIT), Paragraph("Errors block meaning.", SMALL), Paragraph("Errors; meaning mostly clear.", SMALL), Paragraph("Unit structures correct; minor slips.", SMALL), Paragraph("Accurate; some complex sentences.", SMALL)],
    [Paragraph("Comprensibilidad", RCRIT), Paragraph("Hard to understand.", SMALL), Paragraph("Understandable with effort.", SMALL), Paragraph("Clear; good pronunciation.", SMALL), Paragraph("Confident, natural delivery.", SMALL)],
    [Paragraph("Presentación", RCRIT), Paragraph("Reads everything; switches to English.", SMALL), Paragraph("Some prep; some eye contact.", SMALL), Paragraph("Prepared; in Spanish &amp; in character.", SMALL), Paragraph("Polished; fully in role.", SMALL)],
], colWidths=[1.2*inch] + [(doc.width-1.2*inch)/4]*4)
rub.setStyle(TableStyle([
    ("BOX",(0,0),(-1,-1),0.7,BORDER),("INNERGRID",(0,0),(-1,-1),0.4,colors.HexColor("#d3d1c7")),
    ("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(-1,0),INK),
    ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
    ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
]))
story.append(KeepTogether([
    Paragraph("The ACTFL presentational rubric", H3),
    Paragraph("One scalable rubric grades every presentation. Five criteria &times; four levels (1&ndash;4 = Novice Low &#8594; Intermediate Low); /20 total.", BODY),
    rub,
]))

# ══ 7. QUICK START ════════════════════════════════════════════════════════════
story.append(PageBreak())
story.append(Paragraph("Quick-start for teachers", H1))
rule()
story.append(Paragraph("Everything is generated from the teacher dashboard &mdash; no prep beyond printing.", BODY))
qs = [
    "<b>Week 0:</b> Create your class in Setup; give students the class code + PIN. Print one Pasaporte per student (Dashboard &#8594; Pasaporte).",
    "<b>Each unit week:</b> Days 1&ndash;2, students play the case at la-liga-sombra.vercel.app. Day 3, print the unit&rsquo;s Vocabulary + Grammar files (Dashboard &#8594; Worksheets). Day 4, print the Culture file and add the Pasaporte page.",
    "<b>Track progress:</b> The Pacing tab is this plan as a check-off list; the Inbox flags students who need support; the Units tab reports ACTFL bands per mode.",
    "<b>Milestones (weeks 6, 12, 17&ndash;18):</b> Print the matching planning sheet + the rubric (Dashboard &#8594; Presentations).",
    "<b>Differentiate:</b> Struggling agents can replay the in-game Academia or use the worksheet Vocabulary Bank; the grammar reference table stays beside them while they work.",
]
story.append(ListFlowable(
    [ListItem(Paragraph(t, BODY), leftIndent=10) for t in qs],
    bulletType="1", bulletFormat="%s.", leftIndent=16, spaceAfter=5))

story.append(Spacer(1,10))
story.append(panel([
    Paragraph('<font name="Helvetica-Bold" size=10 color="#8b5e10">The whole picture</font>', LABEL),
    Spacer(1,3),
    Paragraph("Ten playable cases + a boss mission give the input. The worksheets turn it into "
              "production. The culture files and Pasaporte build intercultural competence. The three "
              "milestones and capstone grow real speaking. The pacing plan and dashboard run it all. "
              "Students chase thieves across the Spanish-speaking world &mdash; and learn a year of "
              "Spanish doing it.", BODY),
], bg=PANEL, border=(0.8, GOLDLT)))

doc.build(story)
print("WROTE", OUT)
