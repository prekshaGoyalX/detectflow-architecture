import { useState } from "react";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────
const C = {
  midnight: "#0B132B",
  midnightLight: "#101B38",
  midnightLighter: "#162042",
  cream: "#F6F4EF",
  creamDim: "rgba(246,244,239,0.06)",
  creamMid: "rgba(246,244,239,0.12)",
  amber: "#E5A54B",
  amberDim: "rgba(229,165,75,0.10)",
  amberMid: "rgba(229,165,75,0.22)",
  rust: "#D4654A",
  rustDim: "rgba(212,101,74,0.10)",
  rustMid: "rgba(212,101,74,0.22)",
  slate: "#6B8ADB",
  slateDim: "rgba(107,138,219,0.10)",
  slateMid: "rgba(107,138,219,0.20)",
  sage: "#6EAA78",
  sageDim: "rgba(110,170,120,0.10)",
  mauve: "#A78BCA",
  mauveDim: "rgba(167,139,202,0.10)",
  mauveMid: "rgba(167,139,202,0.20)",
  sky: "#5BA4CF",
  skyDim: "rgba(91,164,207,0.10)",
  text: "#C8CDD5",
  textMuted: "#717D92",
  textBright: "#E8ECF1",
  border: "rgba(255,255,255,0.07)",
  borderLight: "rgba(255,255,255,0.11)",
};

const FONT = "'DM Sans', 'Geist', system-ui, sans-serif";
const MONO = "'Helvetica', 'Source Code Pro', monospace";

// ─── DATA ────────────────────────────────────────────────────────────────────
const sections = [
  {
    id: "overview",
    icon: "◎",
    title: "What Is DetectFlow?",
    subtitle: "A no-code computer vision platform for industry SMEs",
    content: {
      headline: "A no-code visual detection platform",
      description:
        "DetectFlow lets domain experts, like quality engineers, safety managers, operations teams, build custom image classifiers without writing code or training models. Upload examples, define categories, detect anything.",
      analogy:
        "Canva democratized design by removing Photoshop complexity. DetectFlow democratizes computer vision by removing the need for ML engineers. A factory floor manager who knows what a weld crack looks like can turn that knowledge into an automated detection system in minutes.",
      matroidConnection:
        "This is my take, as a Product Engineer, on a Palo-Alto based computer vision startup called Matroid. Matroid does exactly this at enterprise scale across manufacturing defect detection, security monitoring, and compliance checking. DetectFlow demonstrates the core product loop: Upload → Label → Detect → Iterate.",
      keyInsight:
        "The magic isn't the ML model. It's the workflow. The product value is in making domain expertise directly encodable into an automated system without an ML team as intermediary.",
      corePrinciples: [
        { name: "Zero ML Knowledge Required", detail: "Users think in their domain language ('cracked weld', 'missing PPE') not ML language ('fine-tune a ResNet-50 with cross-entropy loss'). The system translates between these worlds." },
        { name: "Data Collection ≠ Inference", detail: "Architecture separates image collection from model execution. Users upload training images today; the ML backend can be swapped, upgraded, or fine-tuned independently." },
        { name: "Progressive Complexity", detail: "Start with zero-shot (CLIP). Graduate to few-shot fine-tuning. Scale to custom trained models. Same user flow at every level." },
      ],
    },
  },
  {
    id: "user-journey",
    icon: "⟡",
    title: "The User Journey",
    subtitle: "From signup to automated detection in 5 steps",
    content: {
      steps: [
        { step: "1", name: "Create a Detector", description: 'User names their detector (e.g., "Safety Helmet Detector") and describes what it should find. This creates a workspace for their detection task.', productWhy: "Naming creates ownership and mental model. The user is building THEIR tool, not configuring someone else's. Description becomes metadata for discoverability in team environments.", techWhat: "POST /api/detectors → creates row with status='active'. UUID primary key prevents enumeration. Detector scoped to user_id for multi-tenancy." },
        { step: "2", name: "Upload Training Images", description: "User uploads images that contain examples of what they want to detect. Supports batch upload (multi-file select) and folder upload for bulk ingestion.", productWhy: "Low barrier. Start with 5-10 images, not 10,000. Training images serve dual purpose: (1) define categories for zero-shot today, (2) become fine-tuning data for V2.", techWhat: "POST /api/detectors/:id/images → multipart/form-data. Image saved to local filesystem at /public/uploads/:uuid.:ext. Metadata + labels persisted as JSONB in training_images table." },
        { step: "3", name: "Define Labels", description: "User assigns text labels to uploaded images: 'person wearing helmet', 'person without helmet'. Labels become the vocabulary for zero-shot classification.", productWhy: "This is where domain expertise gets encoded. The quality engineer knows what matters, and the system just needs to be told. Descriptive phrases > single words for CLIP accuracy.", techWhat: "Labels stored as JSONB array on TrainingImage: [{label: string}]. Unique labels extracted at query time for inference. Label chips UI enables quick re-selection." },
        { step: "4", name: "Run Detection", description: "User uploads a new image. System runs CLIP zero-shot classification against all defined labels, returns confidence scores for each category.", productWhy: "Instant gratification: results in seconds, not hours. This is the 'aha moment' that proves the system works. Confidence scores build trust through transparency.", techWhat: "POST /api/detectors/:id/detect → async pipeline. Image embedding via CLIP (Replicate API). Cosine similarity against cached text embeddings. Softmax with temperature scaling → probabilities." },
        { step: "5", name: "Evaluate & Iterate", description: "User reviews results, optionally provides ground truth ('actual label') for accuracy tracking. Adds more training images to improve coverage.", productWhy: "Feedback loop drives retention. Every correction teaches the user how to improve their detector. Ground truth annotations enable accuracy metrics for V2.", techWhat: "Detection.actualLabel stored alongside results. Enables precision/recall calculation per label. Training image additions expand the label vocabulary automatically." },
      ],
    },
  },
  { id: "architecture", icon: "⬡", title: "System Architecture", subtitle: "How the pieces fit together", content: {} },
  { id: "database", icon: "⊞", title: "Database Design", subtitle: "4 tables that power everything", content: {} },
  { id: "ml-pipeline", icon: "◈", title: "ML Pipeline", subtitle: "How detection works under the hood", content: {} },
  { id: "product-strategy", icon: "△", title: "Product Strategy", subtitle: "Why this product wins", content: {} },
  { id: "api-design", icon: "◇", title: "API Design", subtitle: "RESTful API with clear resource hierarchy", content: {} },
];

// ─── SVG DIAGRAMS ────────────────────────────────────────────────────────────

function ArchDiagramProduction() {
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox="0 0 800 520" style={{ width: "100%", maxWidth: 800, height: "auto", fontFamily: MONO }}>
        <rect width="800" height="520" fill={C.midnight} rx="4" />
        <text x="400" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.textBright}>Production Architecture: Full System</text>

        <rect x="20" y="50" width="760" height="80" rx="3" fill="none" stroke={C.sage} strokeWidth="1" strokeDasharray="4" opacity="0.5" />
        <text x="40" y="68" fontSize="9" fontWeight="700" fill={C.sage} letterSpacing="0.1em">CLIENT LAYER</text>
        {["React SPA", "Canvas Annotation", "WebSocket Client", "Auth (OAuth/JWT)"].map((t, i) => (
          <g key={i}>
            <rect x={40 + i * 185} y="78" width="165" height="36" rx="3" fill={C.midnightLight} stroke={C.sage} strokeWidth="1" />
            <text x={40 + i * 185 + 82} y="101" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.textBright}>{t}</text>
          </g>
        ))}

        <line x1="400" y1="130" x2="400" y2="155" stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrP2)" />
        <text x="418" y="148" fontSize="8" fill={C.textMuted}>HTTPS / WSS</text>

        <rect x="20" y="160" width="760" height="80" rx="3" fill="none" stroke={C.slate} strokeWidth="1" strokeDasharray="4" opacity="0.5" />
        <text x="40" y="178" fontSize="9" fontWeight="700" fill={C.slate} letterSpacing="0.1em">API LAYER</text>
        {["API Gateway", "Auth Service", "Detector CRUD", "Detection API", "Upload Service"].map((t, i) => (
          <g key={i}>
            <rect x={40 + i * 148} y="188" width="128" height="36" rx="3" fill={C.midnightLight} stroke={C.slate} strokeWidth="1" />
            <text x={40 + i * 148 + 64} y="211" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.textBright}>{t}</text>
          </g>
        ))}

        <line x1="250" y1="240" x2="250" y2="270" stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrP2)" />
        <line x1="560" y1="240" x2="560" y2="270" stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrP2)" />

        <rect x="20" y="275" width="370" height="100" rx="3" fill="none" stroke={C.amber} strokeWidth="1" strokeDasharray="4" opacity="0.5" />
        <text x="40" y="293" fontSize="9" fontWeight="700" fill={C.amber} letterSpacing="0.1em">DATA LAYER</text>
        {[{ n: "PostgreSQL", s1: "Users, Detectors", s2: "Images, Detections", w: 110 }, { n: "S3 / CDN", s1: "Training Images", s2: "Detection Inputs", w: 100 }, { n: "Redis", s1: "Cache, Sessions", s2: "Embedding Store", w: 90 }].map((d, i) => (
          <g key={i}>
            <rect x={40 + i * 120 + (i === 2 ? 10 : 0)} y="303" width={d.w} height="56" rx="3" fill={C.midnightLight} stroke={C.amber} strokeWidth="1" />
            <text x={40 + i * 120 + (i === 2 ? 10 : 0) + d.w / 2} y="324" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.textBright}>{d.n}</text>
            <text x={40 + i * 120 + (i === 2 ? 10 : 0) + d.w / 2} y="340" textAnchor="middle" fontSize="8" fill={C.textMuted}>{d.s1}</text>
            <text x={40 + i * 120 + (i === 2 ? 10 : 0) + d.w / 2} y="352" textAnchor="middle" fontSize="8" fill={C.textMuted}>{d.s2}</text>
          </g>
        ))}

        <rect x="410" y="275" width="370" height="100" rx="3" fill="none" stroke={C.rust} strokeWidth="1" strokeDasharray="4" opacity="0.5" />
        <text x="430" y="293" fontSize="9" fontWeight="700" fill={C.rust} letterSpacing="0.1em">PROCESSING LAYER</text>
        {[{ n: "Task Queue", s1: "BullMQ / SQS", s2: "Priority + Retry" }, { n: "ML Worker", s1: "Inference Engine", s2: "Auto-scaling" }, { n: "GPU Pool", s1: "NVIDIA T4/A10", s2: "On-demand" }].map((d, i) => (
          <g key={i}>
            <rect x={430 + i * 115} y="303" width={100} height="56" rx="3" fill={C.midnightLight} stroke={C.rust} strokeWidth="1" />
            <text x={430 + i * 115 + 50} y="324" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.textBright}>{d.n}</text>
            <text x={430 + i * 115 + 50} y="340" textAnchor="middle" fontSize="8" fill={C.textMuted}>{d.s1}</text>
            <text x={430 + i * 115 + 50} y="352" textAnchor="middle" fontSize="8" fill={C.textMuted}>{d.s2}</text>
          </g>
        ))}

        <line x1="610" y1="361" x2="610" y2="400" stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrP2)" />

        <rect x="410" y="405" width="370" height="100" rx="3" fill="none" stroke={C.mauve} strokeWidth="1" strokeDasharray="4" opacity="0.5" />
        <text x="430" y="423" fontSize="9" fontWeight="700" fill={C.mauve} letterSpacing="0.1em">ML LAYER</text>
        {[{ n: "CLIP", s1: "Zero-shot", s2: "Classification" }, { n: "Fine-tuned", s1: "MobileNetV2", s2: "Per-detector" }, { n: "YOLO v8", s1: "Object Detection", s2: "+ Localization" }].map((d, i) => (
          <g key={i}>
            <rect x={430 + i * 115} y="433" width={100} height="56" rx="3" fill={C.midnightLight} stroke={C.mauve} strokeWidth="1" />
            <text x={430 + i * 115 + 50} y="454" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.textBright}>{d.n}</text>
            <text x={430 + i * 115 + 50} y="470" textAnchor="middle" fontSize="8" fill={C.textMuted}>{d.s1}</text>
            <text x={430 + i * 115 + 50} y="482" textAnchor="middle" fontSize="8" fill={C.textMuted}>{d.s2}</text>
          </g>
        ))}

        <rect x="20" y="405" width="370" height="100" rx="3" fill="none" stroke={C.sky} strokeWidth="1" strokeDasharray="4" opacity="0.5" />
        <text x="40" y="423" fontSize="9" fontWeight="700" fill={C.sky} letterSpacing="0.1em">OBSERVABILITY</text>
        {[{ n: "Prometheus", s: "Metrics" }, { n: "Grafana", s: "Dashboards" }, { n: "Sentry", s: "Error Tracking" }].map((d, i) => (
          <g key={i}>
            <rect x={40 + i * 125} y="433" width={90} height="56" rx="3" fill={C.midnightLight} stroke={C.sky} strokeWidth="1" />
            <text x={40 + i * 125 + 45} y="458" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.textBright}>{d.n}</text>
            <text x={40 + i * 125 + 45} y="474" textAnchor="middle" fontSize="8" fill={C.textMuted}>{d.s}</text>
          </g>
        ))}

        <defs><marker id="arrP2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill={C.textMuted} /></marker></defs>
      </svg>
    </div>
  );
}

function ArchDiagramMVP() {
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox="0 0 780 360" style={{ width: "100%", maxWidth: 780, height: "auto", fontFamily: MONO }}>
        <rect width="780" height="360" fill={C.midnight} rx="4" />
        <text x="390" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.textBright}>MVP Architecture: What's Actually Built</text>

        <rect x="260" y="48" width="260" height="44" rx="3" fill={C.midnightLight} stroke={C.sage} strokeWidth="1.5" />
        <text x="390" y="72" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.textBright}>Browser (Next.js Client)</text>
        <text x="390" y="86" textAnchor="middle" fontSize="9" fill={C.textMuted}>React + Tailwind CSS</text>

        <line x1="390" y1="92" x2="390" y2="120" stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrM2)" />
        <text x="408" y="112" fontSize="8" fill={C.textMuted}>fetch()</text>

        <rect x="130" y="125" width="520" height="60" rx="3" fill={C.midnightLight} stroke={C.slate} strokeWidth="1.5" />
        <text x="390" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.textBright}>Next.js 16 API Routes (App Router)</text>
        <text x="390" y="163" textAnchor="middle" fontSize="9" fill={C.textMuted}>/api/detectors • /api/detectors/:id/images • /api/detectors/:id/detect</text>
        <text x="390" y="178" textAnchor="middle" fontSize="9" fill={C.textMuted}>Prisma ORM • formidable (multipart) • async processing</text>

        <line x1="280" y1="185" x2="170" y2="225" stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrM2)" />
        <line x1="390" y1="185" x2="390" y2="225" stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrM2)" />
        <line x1="500" y1="185" x2="600" y2="225" stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrM2)" />

        <rect x="60" y="230" width="210" height="50" rx="3" fill={C.midnightLight} stroke={C.amber} strokeWidth="1.5" />
        <text x="165" y="255" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.textBright}>PostgreSQL</text>
        <text x="165" y="270" textAnchor="middle" fontSize="9" fill={C.textMuted}>4 tables • JSONB labels + results</text>

        <rect x="290" y="230" width="200" height="50" rx="3" fill={C.midnightLight} stroke={C.amber} strokeWidth="1.5" />
        <text x="390" y="255" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.textBright}>Local Filesystem</text>
        <text x="390" y="270" textAnchor="middle" fontSize="9" fill={C.textMuted}>/public/uploads/</text>

        <rect x="510" y="230" width="220" height="50" rx="3" fill={C.midnightLight} stroke={C.mauve} strokeWidth="1.5" />
        <text x="620" y="255" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.textBright}>Replicate API</text>
        <text x="620" y="270" textAnchor="middle" fontSize="9" fill={C.textMuted}>openai/clip • 768-dim embeddings</text>

        <rect x="510" y="296" width="220" height="32" rx="3" fill="none" stroke={C.textMuted} strokeWidth="1" strokeDasharray="4" />
        <text x="620" y="317" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.textMuted}>.embedding-cache/</text>
        <line x1="620" y1="280" x2="620" y2="296" stroke={C.textMuted} strokeWidth="1" markerEnd="url(#arrM2)" />

        <rect x="60" y="300" width="420" height="32" rx="3" fill={C.rustDim} stroke={C.rust} strokeWidth="1" />
        <text x="270" y="321" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.rust}>MVP cuts: No auth • No queue • No GPU • Polling instead of WebSocket</text>

        <defs><marker id="arrM2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill={C.textMuted} /></marker></defs>
      </svg>
    </div>
  );
}

function DataFlowDiagram() {
  const steps = [
    { x: 20, label: "Upload Image", sub: "multipart/form-data", color: C.sage },
    { x: 160, label: "Save to Disk", sub: "/public/uploads/", color: C.amber },
    { x: 300, label: "Create Detection", sub: "status: processing", color: C.slate },
    { x: 440, label: "CLIP Inference", sub: "image → 768-dim vec", color: C.mauve },
    { x: 580, label: "Score & Rank", sub: "cosine sim → softmax", color: C.rust },
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox="0 0 750 200" style={{ width: "100%", maxWidth: 750, height: "auto", fontFamily: MONO }}>
        <rect width="750" height="200" fill={C.midnight} rx="4" />
        <text x="375" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.textBright}>Detection Data Flow</text>
        {steps.map((s, i) => (
          <g key={i}>
            <rect x={s.x} y="45" width="130" height="55" rx="3" fill={C.midnightLight} stroke={s.color} strokeWidth="1.5" />
            <text x={s.x + 65} y="68" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.textBright}>{s.label}</text>
            <text x={s.x + 65} y="84" textAnchor="middle" fontSize="9" fill={C.textMuted}>{s.sub}</text>
            {i < 4 && <line x1={s.x + 130} y1={72} x2={s.x + 160} y2={72} stroke={C.textMuted} strokeWidth="1.5" markerEnd="url(#arrF2)" />}
          </g>
        ))}
        <path d="M 645,100 L 645,145 L 85,145 L 85,120" fill="none" stroke={C.sage} strokeWidth="1.5" strokeDasharray="5" markerEnd="url(#arrF2)" />
        <text x="365" y="162" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.sage}>Results: [{`{label, confidence}`}] → Poll via GET /api/detections/:id</text>
        <rect x="440" y="115" width="130" height="28" rx="3" fill="none" stroke={C.textMuted} strokeWidth="1" strokeDasharray="3" />
        <text x="505" y="134" textAnchor="middle" fontSize="9" fontWeight="600" fill={C.textMuted}>Text embedding cache</text>
        <line x1="505" y1="100" x2="505" y2="115" stroke={C.textMuted} strokeWidth="1" strokeDasharray="3" />
        <defs><marker id="arrF2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill={C.textMuted} /></marker></defs>
      </svg>
    </div>
  );
}

// ─── SHARED UI COMPONENTS ────────────────────────────────────────────────────

function MVPSection({ children }) {
  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: `2px solid ${C.rust}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ background: C.rust, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 3, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO }}>MVP Implementation</span>
        <span style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT }}>What's actually built today</span>
      </div>
      {children}
    </div>
  );
}


function Label({ children, color }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: color || C.amber, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: MONO }}>{children}</div>;
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: "7px 16px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 3, cursor: "pointer", transition: "all 0.15s", fontFamily: FONT, background: active ? C.amber : C.midnightLighter, color: active ? C.midnight : C.text, flexShrink: 0 }}>
      {children}
    </button>
  );
}

function CodeBlock({ children }) {
  return <div style={{ background: "#141414", border: `1px solid ${C.border}`, borderRadius: 4, padding: 16, overflowX: "auto" }}><pre style={{ fontSize: 12, fontFamily: MONO, color: C.text, lineHeight: 1.6, whiteSpace: "pre", margin: 0 }}>{children}</pre></div>;
}

// ─── SECTION RENDERERS ──────────────────────────────────────────────────────

function OverviewSection({ content }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text, fontFamily: FONT }}>{content.description}</p>

      <div style={{ borderLeft: `3px solid ${C.amber}`, paddingLeft: 16 }}>
        <Label>The Analogy</Label>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: 0 }}>{content.analogy}</p>
      </div>

      <div style={{ borderLeft: `3px solid ${C.sage}`, paddingLeft: 16 }}>
        <Label color={C.sage}>Why This Project</Label>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: 0 }}>{content.matroidConnection}</p>
      </div>

      <div style={{ background: C.amberDim, border: `1px solid ${C.amberMid}`, borderRadius: 4, padding: 20 }}>
        <Label color={C.cream}>Core Insight</Label>
        <p style={{ fontSize: 15, color: C.cream, lineHeight: 1.7, fontFamily: FONT, fontWeight: 500, margin: 0 }}>{content.keyInsight}</p>
      </div>

      <div>
        <Label>Design Principles</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          {content.corePrinciples.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", paddingBottom: 12, borderBottom: i < content.corePrinciples.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 22, fontWeight: 300, color: C.textMuted, fontFamily: MONO, minWidth: 28 }}>0{i + 1}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.textBright, fontFamily: FONT, marginBottom: 4 }}>{p.name}</div>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, fontFamily: FONT, margin: 0 }}>{p.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserJourneySection({ content }) {
  const [a, setA] = useState(0);
  const s = content.steps[a];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingBottom: 4 }}>
        {content.steps.map((st, i) => <Pill key={i} active={i === a} onClick={() => setA(i)}>{st.step}. {st.name}</Pill>)}
      </div>

      <div>
        <h4 style={{ fontSize: 20, fontWeight: 700, color: C.textBright, fontFamily: FONT, margin: "0 0 8px" }}>{s.name}</h4>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: "0 0 16px" }}>{s.description}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ borderLeft: `3px solid ${C.sage}`, paddingLeft: 14 }}>
            <Label color={C.sage}>Product: Why</Label>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontFamily: FONT, margin: 0 }}>{s.productWhy}</p>
          </div>
          <div style={{ borderLeft: `3px solid ${C.slate}`, paddingLeft: 14 }}>
            <Label color={C.slate}>Tech: What</Label>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontFamily: MONO, margin: 0 }}>{s.techWhat}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
        {content.steps.map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div onClick={() => setA(i)} style={{ width: 28, height: 28, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: MONO, cursor: "pointer", background: i === a ? C.amber : i < a ? C.midnightLighter : "transparent", color: i === a ? C.midnight : C.textMuted, border: i === a ? "none" : `1px solid ${C.border}` }}>{i + 1}</div>
            {i < content.steps.length - 1 && <div style={{ width: 20, height: 2, background: i < a ? C.amber : C.border }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureSection() {
  const layers = [
    { name: "Frontend: React SPA", tech: "Next.js / React + TailwindCSS", color: C.sage, why: "Server components for SEO, client components for interactivity. App Router enables colocated API routes. Tailwind for rapid iteration without CSS bloat.", components: ["Image upload with drag-and-drop + batch/folder support", "Canvas-based bounding box annotation tool (V2)", "Real-time detection status via WebSocket", "Dashboard with detection history, accuracy metrics"] },
    { name: "API Server: RESTful + WebSocket", tech: "Node.js + Express / Next.js API Routes", color: C.slate, why: "TypeScript end-to-end for shared types between client and server. REST for CRUD, WebSocket for real-time detection status. Stateless design for horizontal scaling.", components: ["Resource-oriented REST API with validation", "JWT auth with refresh tokens + OAuth providers", "multipart/form-data handling for image upload", "WebSocket gateway for push notifications"] },
    { name: "Database: PostgreSQL + JSONB", tech: "PostgreSQL 16 + Prisma ORM", color: C.amber, why: "Relational structure (users → detectors → images → detections) with JSONB flexibility for labels and detection results. GIN indexes on JSONB for fast label queries. ACID transactions for data integrity.", components: ["4 core tables with UUID primary keys", "JSONB columns for labels, results, config", "Composite indexes: (detector_id, created_at)", "Connection pooling via PgBouncer for production"] },
    { name: "ML Infrastructure: Model Serving", tech: "CLIP + MobileNetV2 + YOLO v8", color: C.mauve, why: "Tiered model strategy: CLIP for zero-shot (instant, any label), fine-tuned MobileNetV2 for accuracy (user's data), YOLO for localization (bounding boxes). Models selected per-detector based on training data availability.", components: ["CLIP: 768-dim embeddings, cosine similarity scoring", "Transfer learning pipeline: freeze backbone, train classifier head", "Model registry with versioning per detector", "A/B testing framework for model comparison"] },
    { name: "Task Queue: Async Processing", tech: "BullMQ + Redis / AWS SQS", color: C.rust, why: "ML inference takes 2-30s and can't block the HTTP response. Queue decouples request from processing. Enables retry with exponential backoff, priority queues for paid tiers, and horizontal scaling of workers.", components: ["Detection jobs enqueued on POST /detect", "Worker pool with concurrency control", "Dead letter queue for failed jobs", "Priority lanes: free (low) vs. pro (high) vs. enterprise (critical)"] },
    { name: "Object Storage: S3 / CDN", tech: "AWS S3 + CloudFront", color: C.sky, why: "Images are large binary blobs that should never be stored in the database. S3 gives 99.999999999% durability. Pre-signed URLs for direct client → S3 upload (bypass API server). CloudFront CDN for low-latency image serving.", components: ["Pre-signed URL generation for direct upload", "Lifecycle policies: move to Glacier after 90 days", "Organized: /users/{id}/detectors/{id}/images/", "Thumbnail generation via Lambda on upload"] },
  ];
  const compTable = [
    ["Frontend", "React SPA + WebSocket", "Next.js App Router (SSR + client)", "Single framework, zero config deploy"],
    ["API", "Dedicated API service", "Next.js API Routes", "Colocated with frontend, no separate server"],
    ["Auth", "JWT + OAuth + RBAC", "Hardcoded USER_ID", "Auth is a commodity that adds zero demo value"],
    ["Database", "PostgreSQL + PgBouncer + Redis", "PostgreSQL (local, direct)", "Single connection sufficient for demo"],
    ["Storage", "S3 + CloudFront CDN", "Local filesystem (/public/uploads/)", "No AWS account needed, images served by Next.js"],
    ["Queue", "BullMQ + Redis workers", "In-process async (fire-and-forget)", "Single user, single request at a time"],
    ["ML", "GPU pool + model registry", "Replicate API (CLIP)", "Free tier, no GPU provisioning"],
    ["Cache", "Redis embedding store", ".embedding-cache/ on disk", "Text embeddings cached as JSON files"],
    ["Monitoring", "Prometheus + Grafana + Sentry", "Console.log + processing_time_ms", "Dev mode, latency tracked in DB"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div><Label>Production System Diagram</Label><ArchDiagramProduction /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {layers.map((l, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${l.color}`, paddingLeft: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textBright, fontFamily: FONT }}>{l.name}</div>
            <div style={{ fontSize: 11, color: l.color, fontFamily: MONO, marginTop: 2 }}>{l.tech}</div>
            <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, fontFamily: FONT, margin: "10px 0" }}>{l.why}</p>
            {l.components.map((c, j) => (
              <div key={j} style={{ display: "flex", gap: 8, fontSize: 11, color: C.textMuted, fontFamily: MONO, marginTop: 3 }}>
                <span style={{ color: l.color, flexShrink: 0 }}>›</span><span>{c}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <MVPSection>
        <ArchDiagramMVP />
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright, fontFamily: FONT, marginBottom: 12 }}>What's actually running</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: MONO }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Component", "Production", "MVP", "Why the cut"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compTable.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: C.textBright, fontFamily: FONT, fontSize: 12 }}>{row[0]}</td>
                    <td style={{ padding: "8px 12px", color: C.textMuted, fontSize: 11 }}>{row[1]}</td>
                    <td style={{ padding: "8px 12px", color: C.rust, fontSize: 11 }}>{row[2]}</td>
                    <td style={{ padding: "8px 12px", color: C.textMuted, fontSize: 11, fontFamily: FONT }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, borderLeft: `3px solid ${C.amber}`, paddingLeft: 16 }}>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: 0 }}>
              <span style={{ fontWeight: 700, color: C.amber }}>Key principle:</span> Every MVP simplification has a clear upgrade path. Local filesystem → S3 (change one upload function). Hardcoded user → JWT (add middleware). In-process async → BullMQ (extract to worker). The architecture is designed so each component can be upgraded independently.
            </p>
          </div>
        </div>
      </MVPSection>
    </div>
  );
}

function DatabaseSection() {
  const [at, setAt] = useState(0);
  const tables = [
    { name: "users", color: C.sage, fields: [{ col: "id", type: "UUID", constraint: "PRIMARY KEY, DEFAULT uuid_generate_v4()" }, { col: "email", type: "VARCHAR(255)", constraint: "UNIQUE, NOT NULL" }, { col: "name", type: "VARCHAR(255)", constraint: "NOT NULL" }, { col: "password_hash", type: "VARCHAR(255)", constraint: "NOT NULL" }, { col: "created_at", type: "TIMESTAMPTZ", constraint: "DEFAULT NOW()" }, { col: "updated_at", type: "TIMESTAMPTZ", constraint: "DEFAULT NOW()" }], indexes: ["UNIQUE INDEX ON email"], why: "UUID over auto-increment prevents user enumeration. Email uniqueness enforced at DB level, not just application. password_hash uses bcrypt with cost factor 12." },
    { name: "detectors", color: C.slate, fields: [{ col: "id", type: "UUID", constraint: "PRIMARY KEY" }, { col: "user_id", type: "UUID", constraint: "FK → users.id, NOT NULL" }, { col: "name", type: "VARCHAR(255)", constraint: "NOT NULL" }, { col: "description", type: "TEXT", constraint: "NULLABLE" }, { col: "status", type: "VARCHAR(20)", constraint: "DEFAULT 'active'" }, { col: "config", type: "JSONB", constraint: "DEFAULT '{}'" }, { col: "created_at", type: "TIMESTAMPTZ", constraint: "DEFAULT NOW()" }, { col: "updated_at", type: "TIMESTAMPTZ", constraint: "DEFAULT NOW()" }], indexes: ["INDEX ON (user_id)", "INDEX ON (user_id, created_at DESC)"], why: "Central entity. Config is JSONB because ML parameters evolve (confidence threshold, model version, temperature scaling) and you don't want schema migrations every time you add a tuning knob. Status enables lifecycle tracking: active → training → ready → archived." },
    { name: "training_images", color: C.amber, fields: [{ col: "id", type: "UUID", constraint: "PRIMARY KEY" }, { col: "detector_id", type: "UUID", constraint: "FK → detectors.id, NOT NULL" }, { col: "image_url", type: "TEXT", constraint: "NOT NULL" }, { col: "labels", type: "JSONB", constraint: "NOT NULL, DEFAULT '[]'" }, { col: "file_size_bytes", type: "INTEGER", constraint: "NULLABLE" }, { col: "dimensions", type: "JSONB", constraint: "NULLABLE, {width, height}" }, { col: "created_at", type: "TIMESTAMPTZ", constraint: "DEFAULT NOW()" }], indexes: ["INDEX ON (detector_id)", "GIN INDEX ON (labels)"], why: "JSONB for labels is critical. Labels structure: [{label: string, bbox?: {x, y, w, h}}]. Bounding boxes are inherently variable (0-N per image). A normalized labels table would require complex JOINs for every read. GIN index enables fast queries like: SELECT * WHERE labels @> '[{\"label\": \"helmet\"}]'" },
    { name: "detections", color: C.mauve, fields: [{ col: "id", type: "UUID", constraint: "PRIMARY KEY" }, { col: "detector_id", type: "UUID", constraint: "FK → detectors.id, NOT NULL" }, { col: "input_image_url", type: "TEXT", constraint: "NOT NULL" }, { col: "results", type: "JSONB", constraint: "NULLABLE, [{label, confidence, bbox?}]" }, { col: "actual_label", type: "VARCHAR(255)", constraint: "NULLABLE, ground truth" }, { col: "status", type: "VARCHAR(20)", constraint: "DEFAULT 'pending'" }, { col: "processing_time_ms", type: "INTEGER", constraint: "NULLABLE" }, { col: "model_version", type: "VARCHAR(50)", constraint: "NULLABLE" }, { col: "created_at", type: "TIMESTAMPTZ", constraint: "DEFAULT NOW()" }, { col: "processed_at", type: "TIMESTAMPTZ", constraint: "NULLABLE" }], indexes: ["INDEX ON (detector_id, created_at DESC)", "INDEX ON (status) WHERE status = 'pending'"], why: "Results as JSONB because output structure is model-dependent. CLIP returns [{label, confidence}], YOLO returns [{label, confidence, bbox}]. actual_label enables precision/recall tracking. Partial index on pending status accelerates worker polling. processing_time_ms for P50/P99 latency monitoring." },
  ];
  const t = tables[at];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Label>Entity Relationship</Label>
        <div style={{ overflowX: "auto" }}>
          <svg viewBox="0 0 700 120" style={{ width: "100%", maxWidth: 700, height: "auto", fontFamily: MONO }}>
            <rect width="700" height="120" fill={C.midnight} rx="4" />
            {[{ x: 30, name: "User", c: C.sage }, { x: 200, name: "Detector", c: C.slate }, { x: 390, name: "TrainingImage", c: C.amber }, { x: 560, name: "Detection", c: C.mauve }].map((e, i) => (
              <g key={i}>
                <rect x={e.x} y="20" width={i === 2 ? 140 : 120} height="48" rx="3" fill={C.midnightLight} stroke={e.c} strokeWidth="1.5" />
                <text x={e.x + (i === 2 ? 70 : 60)} y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.textBright}>{e.name}</text>
                <text x={e.x + (i === 2 ? 70 : 60)} y="58" textAnchor="middle" fontSize="8" fill={C.textMuted}>{["email, name", "name, config", "image_url, labels", "results, status"][i]}</text>
              </g>
            ))}
            {[[150, 200], [320, 390], [530, 560]].map(([x1, x2], i) => (
              <g key={i}>
                <line x1={x1} y1={44} x2={x2} y2={44} stroke={C.textMuted} strokeWidth="1" />
                <text x={(x1 + x2) / 2} y={82} textAnchor="middle" fontSize="9" fill={C.textMuted}>1 → N</text>
              </g>
            ))}
            <path d="M 260,68 L 260,100 L 620,100 L 620,68" fill="none" stroke={C.textMuted} strokeWidth="1" strokeDasharray="4" />
            <text x="440" y="114" textAnchor="middle" fontSize="9" fill={C.textMuted}>1:N (Detector → Detection)</text>
          </svg>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingBottom: 4 }}>
        {tables.map((tb, i) => <Pill key={i} active={i === at} onClick={() => setAt(i)}>{tb.name}</Pill>)}
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, color: C.textBright, fontFamily: MONO }}>{t.name}</div>

      <div style={{ background: C.midnightLight, borderRadius: 4, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.borderLight}`, background: C.midnightLighter }}>
              {["Column", "Type", "Constraints"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.fields.map((f, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "9px 16px", fontWeight: 600, color: t.color, fontSize: 13 }}>{f.col}</td>
                <td style={{ padding: "9px 16px", color: C.amber, fontSize: 12 }}>{f.type}</td>
                <td style={{ padding: "9px 16px", color: C.textMuted, fontSize: 12 }}>{f.constraint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {t.indexes.map((idx, i) => (
          <span key={i} style={{ fontSize: 11, fontFamily: MONO, color: C.sage, background: C.sageDim, padding: "4px 12px", borderRadius: 3 }}>{idx}</span>
        ))}
      </div>

      <div style={{ borderLeft: `3px solid ${t.color}`, paddingLeft: 16 }}>
        <Label color={t.color}>Design Rationale</Label>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: 0 }}>{t.why}</p>
      </div>
    </div>
  );
}

function MLPipelineSection() {
  const [a, setA] = useState(0);
  const stages = [
    { name: "Model Tiers", detail: "DetectFlow uses a tiered ML strategy. The right model depends on how much training data the user has provided, not on engineering preference.", tiers: [
      { tier: "Tier 1: Zero-Shot (CLIP)", when: "0-49 labeled images (MVP)", how: "CLIP encodes both images and text labels into the same 768-dimensional vector space. Classification = cosine similarity between image embedding and each text label embedding. No training data needed. Works immediately with any English text label.", accuracy: "Good for visually distinct categories (85%+). Poor for fine-grained distinctions.", latency: "~3-5s per image (with cached text embeddings)", color: C.sage },
      { tier: "Tier 2: Few-Shot Fine-Tuning", when: "50-500 labeled images per category", how: "Transfer learning on MobileNetV2. Freeze pre-trained backbone (ImageNet features), replace classifier head with user's labels, train on their images. Gets domain-specific accuracy without massive data requirements.", accuracy: "Significantly better than zero-shot for similar classes. 90%+ for well-defined categories.", latency: "~50-100ms per image (optimized model)", color: C.amber },
      { tier: "Tier 3: Object Detection (YOLO v8)", when: "200+ images with bounding box annotations", how: "YOLO provides localization, not just 'this image contains a crack' but 'the crack is at coordinates (x, y, w, h)'. Fine-tuned on user's bounding box annotations.", accuracy: "State-of-the-art for real-time detection. mAP 0.7+ typical with good training data.", latency: "~20-50ms per image (optimized for real-time)", color: C.rust },
    ] },
    { name: "CLIP Deep Dive", detail: "CLIP (Contrastive Language-Image Pre-training) is the foundation of DetectFlow's zero-shot capability. Trained by OpenAI on 400M image-text pairs scraped from the internet.", technical: [{ label: "Architecture", value: "Vision Transformer (ViT-L/14) + Text Transformer. Both encode into shared 768-dim space." }, { label: "Training Objective", value: "Contrastive loss: maximize cosine similarity between matching (image, text) pairs, minimize for non-matching pairs across batch." }, { label: "Zero-Shot Flow", value: "Image → ViT → 768-dim vector. Label text → Transformer → 768-dim vector. Classification = argmax(cosine_similarity(image_vec, text_vec)) over all labels." }, { label: "Temperature Scaling", value: "Raw cosine similarities are narrow (0.15-0.35 typical). Multiply by temperature (τ=100) before softmax to get discriminative probabilities." }, { label: "Prompt Engineering", value: "Descriptive phrases outperform single words. 'a photo of a person wearing a safety helmet' >> 'helmet'. CLIP was trained on image captions, not category labels." }], code: `// Core inference logic (simplified)\nasync function classifyImage(imageUrl, labels) {\n  const imageEmb = await getEmbedding(imageUrl, "image");  // 768-dim\n  const textEmbs = await Promise.all(\n    labels.map(l => getCachedEmbedding(l, "text"))  // 768-dim each\n  );\n  const scores = textEmbs.map(t => cosineSimilarity(imageEmb, t));\n  const T = 100;\n  const exps = scores.map(s => Math.exp(s * T));\n  const sum = exps.reduce((a, b) => a + b, 0);\n  const probs = exps.map(e => e / sum);\n  return labels.map((l, i) => ({\n    label: l, confidence: probs[i]\n  })).sort((a, b) => b.confidence - a.confidence);\n}` },
    { name: "Embedding Cache", detail: "The embedding cache is a critical optimization. Without it, every detection requires N+1 API calls (1 image + N text labels). With caching, text embeddings are computed once and reused, reducing subsequent detections to a single API call.", technical: [{ label: "Problem", value: "Replicate free tier: 6 requests/min, burst of 1. A detector with 5 labels = 6 API calls = guaranteed rate limiting." }, { label: "Solution", value: "Cache text embeddings to disk. Key = SHA-256(label_text). Value = 768-dim float array serialized as JSON." }, { label: "Cache Strategy", value: "Write-through: compute embedding → save to cache → return. Read-first: check cache → if miss, compute and save. Text embeddings are deterministic (same input = same output), so cache never goes stale." }, { label: "Performance Impact", value: "First detection: ~36s (1 image + N text calls with rate limit delays). Subsequent detections: ~3-5s (1 image call, text embeddings from cache). 90%+ API cost reduction." }], code: `// Cache implementation\nconst CACHE_DIR = ".embedding-cache";\n\nasync function getCachedEmbedding(text, type) {\n  const key = crypto.createHash("sha256")\n    .update(text).digest("hex");\n  const cachePath = path.join(CACHE_DIR, \`\${key}.json\`);\n  if (fs.existsSync(cachePath)) {\n    return JSON.parse(fs.readFileSync(cachePath, "utf-8"));\n  }\n  const embedding = await getEmbeddingWithRetry(text, type);\n  fs.writeFileSync(cachePath, JSON.stringify(embedding));\n  return embedding;\n}` },
    { name: "Async Pipeline", detail: "Detection is inherently asynchronous. Inference takes 3-30 seconds depending on model complexity and queue depth. The client should never block waiting for results.", technical: [{ label: "Request Flow", value: "POST /detect → save image → create Detection (status: pending) → enqueue job → return detection ID immediately (HTTP 202)." }, { label: "Worker Flow", value: "Dequeue job → load image → run inference → update Detection (status: complete, results: [...]) → notify client." }, { label: "Client Notification", value: "Production: WebSocket push. MVP: Client polls GET /api/detections/:id every 2 seconds until status != processing." }, { label: "Error Handling", value: "Retry 3x with exponential backoff (2s, 4s, 8s). After 3 failures: mark status = 'failed' with error details in results JSONB. User can re-run." }, { label: "Idempotency", value: "Each detection gets a UUID on creation. Re-submitting the same image creates a new detection (intentional since results may differ as models update)." }] },
  ];
  const s = stages[a];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {stages.map((st, i) => <Pill key={i} active={i === a} onClick={() => setA(i)}>{st.name}</Pill>)}
      </div>
      <div>
        <h4 style={{ fontSize: 18, fontWeight: 700, color: C.textBright, fontFamily: FONT, margin: "0 0 8px" }}>{s.name}</h4>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: "0 0 16px" }}>{s.detail}</p>
        {s.tiers && s.tiers.map((t, i) => (
          <div key={i} style={{ marginTop: 12, borderLeft: `3px solid ${t.color}`, paddingLeft: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.textBright, fontFamily: FONT }}>{t.tier}</span>
              <span style={{ fontSize: 11, fontFamily: MONO, background: C.midnightLighter, color: C.textMuted, padding: "2px 8px", borderRadius: 3 }}>{t.when}</span>
            </div>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontFamily: FONT, margin: "0 0 8px" }}>{t.how}</p>
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.textMuted, fontFamily: MONO }}><span>{t.latency}</span><span>{t.accuracy}</span></div>
          </div>
        ))}
        {s.technical && s.technical.map((t, i) => (
          <div key={i} style={{ marginTop: 8, background: C.midnightLighter, borderRadius: 4, padding: 12 }}>
            <Label color={C.textMuted}>{t.label}</Label>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, fontFamily: FONT, margin: 0 }}>{t.value}</p>
          </div>
        ))}
        {s.code && <div style={{ marginTop: 12 }}><CodeBlock>{s.code}</CodeBlock></div>}
      </div>

      <MVPSection>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright, fontFamily: FONT, marginBottom: 12 }}>What's actually running: CLIP via Replicate</div>
          {[{ label: "Model", value: "openai/clip (ViT-L/14) hosted on Replicate" }, { label: "Cost", value: "Free tier with $10 initial credits, ~$0.002 per embedding" }, { label: "Rate Limit", value: "6 requests/min, burst of 1. Mitigated by text embedding cache." }, { label: "Latency", value: "First detection: ~36s (rate limit delays). Cached: ~3-5s." }, { label: "Accuracy", value: "Excellent for distinct categories (helmet vs no helmet). Poor for similar classes (dog breeds)." }].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, fontSize: 12, marginTop: 6, fontFamily: MONO }}>
              <span style={{ fontWeight: 700, color: C.rust, flexShrink: 0, width: 90 }}>{item.label}</span>
              <span style={{ color: C.text }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}><DataFlowDiagram /></div>
        <div style={{ marginTop: 12, borderLeft: `3px solid ${C.amber}`, paddingLeft: 16 }}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: 0 }}>
            <span style={{ fontWeight: 700, color: C.amber }}>Upgrade path:</span> Replace <span style={{ fontFamily: MONO, color: C.amber }}>classifyWithCLIP()</span> in <span style={{ fontFamily: MONO, color: C.amber }}>src/lib/inference.ts</span> with fine-tuned model endpoint. Same function signature: <span style={{ fontFamily: MONO, color: C.amber }}>(imageUrl, labels) → [{"{label, confidence}"}]</span>. The rest of the application doesn't change.
          </p>
        </div>
      </MVPSection>
    </div>
  );
}

function ProductStrategySection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ background: `linear-gradient(135deg, ${C.midnight}, ${C.midnightLighter})`, padding: "20px 24px", borderRadius: 4, marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: MONO, marginBottom: 4 }}>Product Requirements Document</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.textBright, fontFamily: FONT }}>DetectFlow: No-Code Visual Detection Platform</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, fontFamily: MONO }}>Author: Preksh Goyal • Status: MVP Built • Last Updated: Feb 2026</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={C.textMuted}>Problem Statement</Label>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: 0 }}>Organizations generate millions of images daily (manufacturing lines, security cameras, field inspections) but extracting actionable intelligence requires ML expertise that 99% of domain experts lack. The current path (file a ticket with the ML team, wait 3-6 months, get a model that might not work) is broken.</p>
          </div>
          <div>
            <Label color={C.textMuted}>Target Persona</Label>
            <div style={{ fontWeight: 700, color: C.textBright, fontFamily: FONT, fontSize: 14 }}>Sarah Chen, Quality Engineer at a Mid-Size Manufacturer</div>
            <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, fontFamily: FONT, margin: "8px 0 0" }}>Inspects 500 parts/day visually. Knows exactly what weld cracks, surface scratches, and missing bolts look like. Can't code. Frustrated that the ML team has a 6-month backlog. Needs something she can set up herself, TODAY. Willing to pay $99/month if it saves her 2 hours/day.</p>
          </div>
          <div>
            <Label color={C.textMuted}>Jobs To Be Done</Label>
            <p style={{ fontSize: 14, color: C.text, fontStyle: "italic", lineHeight: 1.7, fontFamily: FONT, margin: 0, borderLeft: `3px solid ${C.amber}`, paddingLeft: 14 }}>"When I'm inspecting products on the production line, I want to automate detection of known defect types, so I can focus on edge cases and process improvement instead of repetitive visual checks."</p>
          </div>
          <div>
            <Label color={C.textMuted}>Success Metrics</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[{ metric: "North Star: Weekly Active Detections", target: "> 100 WAD per active user", why: "Measures real usage, not vanity signups." }, { metric: "Time to First Detection (TTFD)", target: "< 10 minutes", why: "Activation metric. Determines whether onboarding works." }, { metric: "Detection Accuracy (user-reported)", target: "> 80% correct (top-1)", why: "Below 70% → users churn." }, { metric: "30-Day Retention", target: "> 40%", why: "If TTFD is fast but retention low, the product isn't solving a recurring need." }].map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textBright, fontFamily: FONT }}>{m.metric}</div>
                  <div style={{ fontSize: 11, fontFamily: MONO, color: C.sage, marginTop: 3 }}>Target: {m.target}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontFamily: FONT }}>{m.why}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label color={C.textMuted}>Scope: MVP vs V2</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sage, fontFamily: MONO, textTransform: "uppercase", marginBottom: 8 }}>MVP (Shipped)</div>
                {["Create/edit detectors with name + description", "Upload training images (batch + folder)", "Assign text labels to images", "Run CLIP zero-shot classification", "View detection results with confidence bars", "Ground truth annotation (actualLabel)", "Label filtering in training view"].map((s, i) => <div key={i} style={{ fontSize: 12, color: C.text, fontFamily: FONT, marginTop: 4 }}>• {s}</div>)}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, fontFamily: MONO, textTransform: "uppercase", marginBottom: 8 }}>V2 (Roadmap)</div>
                {["Authentication + team workspaces", "Canvas-based bounding box annotation", "Fine-tuning pipeline (MobileNetV2)", "Real-time video stream monitoring", "Webhook alerts on detection events", "Accuracy dashboard (precision/recall/F1)", "Model A/B testing framework"].map((s, i) => <div key={i} style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT, marginTop: 4 }}>• {s}</div>)}
              </div>
            </div>
          </div>
          <div>
            <Label color={C.textMuted}>Competitive Moat</Label>
            {[{ moat: "Data Flywheel", detail: "Every detection generates training data. User corrections feed back into model improvement. More usage → better models → more usage." }, { moat: "Switching Cost", detail: "Trained detectors, labeled datasets, and institutional knowledge encoded in the platform. Migrating means re-labeling thousands of images." }, { moat: "Domain Templates", detail: "Pre-built detector templates for common use cases. New users get 80% accuracy in 60 seconds, then customize." }].map((m, i) => (
              <div key={i} style={{ marginTop: 10, paddingBottom: 10, borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}><div style={{ fontSize: 13, fontWeight: 700, color: C.textBright, fontFamily: FONT }}>{m.moat}</div><p style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT, margin: "4px 0 0", lineHeight: 1.6 }}>{m.detail}</p></div>
            ))}
          </div>
          <div>
            <Label color={C.textMuted}>Pricing Model</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[{ tier: "Free", price: "$0", features: "3 detectors, 100 detections/mo, CLIP only" }, { tier: "Pro", price: "$99/mo", features: "Unlimited detectors, unlimited detections, fine-tuning, priority inference" }, { tier: "Enterprise", price: "Custom", features: "On-prem deployment, SLA, RBAC, SSO, dedicated GPU, custom model training" }].map((p, i) => (
                <div key={i} style={{ background: i === 1 ? C.amber : C.midnightLighter, borderRadius: 4, padding: 14, border: `1px solid ${i === 1 ? C.amber : C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", fontFamily: MONO, color: i === 1 ? C.midnight : C.textMuted }}>{p.tier}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: i === 1 ? C.midnight : C.textBright, fontFamily: FONT, marginTop: 4 }}>{p.price}</div>
                  <div style={{ fontSize: 11, color: i === 1 ? "rgba(11,19,43,0.7)" : C.textMuted, marginTop: 8, lineHeight: 1.5, fontFamily: FONT }}>{p.features}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MVPSection>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright, fontFamily: FONT, marginBottom: 12 }}>MVP Validation Strategy</div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, fontFamily: FONT, margin: "0 0 12px" }}>The MVP validates one core hypothesis: <span style={{ fontWeight: 700, color: C.amber }}>can a non-ML user create a working image classifier in under 10 minutes using only text labels and example images?</span></p>
          {[{ hypothesis: "Zero-shot is good enough for initial value", validation: "CLIP correctly classifies visually distinct categories (helmet vs no helmet) at 85%+ accuracy without any training." }, { hypothesis: "Users understand the label → detect workflow", validation: "Time to First Detection < 10 min. Upload 5 images, add 2 labels, run detection. No documentation needed."}, { hypothesis: "Training images add value even without fine-tuning", validation: "Users feel more confident when they've uploaded examples. Images define categories and will become training data for V2." }].map((h, i) => (
            <div key={i} style={{ paddingBottom: 10, marginTop: 10, borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textBright, fontFamily: FONT }}>{h.hypothesis}</span>
              </div>
              <p style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT, margin: "4px 0 0" }}>{h.validation}</p>
            </div>
          ))}
        </div>
      </MVPSection>
    </div>
  );
}

function APISection() {
  const endpoints = [
    { method: "POST", path: "/api/detectors", purpose: "Create new detector" },
    { method: "GET", path: "/api/detectors", purpose: "List user's detectors" },
    { method: "GET", path: "/api/detectors/:id", purpose: "Get detector details" },
    { method: "PATCH", path: "/api/detectors/:id", purpose: "Update name/description" },
    { method: "DELETE", path: "/api/detectors/:id", purpose: "Delete detector + data" },
    { method: "POST", path: "/api/detectors/:id/images", purpose: "Upload training image" },
    { method: "GET", path: "/api/detectors/:id/images", purpose: "List training images" },
    { method: "DELETE", path: "/api/images/:id", purpose: "Delete training image" },
    { method: "POST", path: "/api/detectors/:id/detect", purpose: "Run detection" },
    { method: "GET", path: "/api/detections/:id", purpose: "Poll detection result" },
    { method: "GET", path: "/api/detectors/:id/detections", purpose: "Detection history" },
  ];
  const methodColor = { GET: C.sage, POST: C.slate, PATCH: C.amber, DELETE: C.rust };
  const principles = [
    { name: "Resource-Oriented", detail: "/detectors/:id/images not /uploadImage. Resources map to database entities. Nested routes express ownership hierarchy." },
    { name: "Async-First", detail: "POST /detect returns immediately with status: 'processing'. Client polls or listens via WebSocket. Never block on inference." },
    { name: "Consistent Error Format", detail: "{ error: { code: 'DETECTOR_NOT_FOUND', message: '...', status: 404 } }. Machine-readable codes + human-readable messages." },
    { name: "Pagination", detail: "All list endpoints support ?page=1&limit=20. Returns { data[], total, page, limit, hasMore }. Default limit: 20, max: 100." },
    { name: "Idempotency", detail: "POST requests accept Idempotency-Key header. Same key = same response. Critical for retry safety." },
    { name: "Content Negotiation", detail: "Image uploads: multipart/form-data. Everything else: application/json. Responses always JSON." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Label>Endpoint Map</Label>
        <div style={{ background: "#141414", borderRadius: 4, padding: 16, overflowX: "auto" }}>
          {endpoints.map((ep, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 12, padding: "4px 0" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: methodColor[ep.method], background: `${methodColor[ep.method]}15`, padding: "2px 8px", borderRadius: 3, minWidth: 52, textAlign: "center" }}>{ep.method}</span>
              <span style={{ color: C.text, minWidth: 260 }}>{ep.path}</span>
              <span style={{ color: C.textMuted, fontSize: 11 }}>{ep.purpose}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Design Principles</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {principles.map((p, i) => (
            <div key={i}><div style={{ fontSize: 13, fontWeight: 700, color: C.textBright, fontFamily: FONT }}>{p.name}</div><p style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT, margin: "4px 0 0", lineHeight: 1.6 }}>{p.detail}</p></div>
          ))}
        </div>
      </div>
      <div>
        <Label>Request / Response Examples</Label>
        <CodeBlock>{`POST /api/detectors
Content-Type: application/json
Authorization: Bearer <jwt>

{ "name": "Safety Helmet Detector", "description": "Detect PPE compliance" }

→ 201 Created
{
  "detector": {
    "id": "96d7d755-99e9-4661-b6e8-6a5b2fcb99ad",
    "name": "Safety Helmet Detector",
    "status": "active",
    "createdAt": "2026-02-22T10:30:00Z"
  }
}`}</CodeBlock>
        <div style={{ marginTop: 10 }}>
          <CodeBlock>{`POST /api/detectors/96d7d755/detect
Content-Type: multipart/form-data
  image: <binary>
  actualLabel: "person wearing helmet"

→ 202 Accepted
{ "detection": { "id": "abc123", "status": "processing" } }

GET /api/detections/abc123  →  200 OK
{
  "detection": {
    "id": "abc123", "status": "complete",
    "actualLabel": "person wearing helmet",
    "results": [
      { "label": "person wearing helmet", "confidence": 0.87 },
      { "label": "person without helmet", "confidence": 0.13 }
    ],
    "processingTimeMs": 4200
  }
}`}</CodeBlock>
        </div>
      </div>

      <MVPSection>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright, fontFamily: FONT, marginBottom: 12 }}>MVP API: What's actually implemented</div>
          <CodeBlock>{`src/app/api/
├── detectors/
│   ├── route.ts              // GET (list) + POST (create)
│   └── [id]/
│       ├── route.ts          // PATCH (update name/desc)
│       ├── images/
│       │   └── route.ts      // GET (list) + POST (upload)
│       ├── detect/
│       │   └── route.ts      // POST (run detection)
│       └── detections/
│           └── route.ts      // GET (detection history)
└── detections/
    └── [id]/
        └── route.ts          // GET (poll single detection)`}</CodeBlock>
        </div>
        <div style={{ marginTop: 16, borderLeft: `3px solid ${C.rust}`, paddingLeft: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.rust, fontFamily: FONT, marginBottom: 8 }}>MVP API simplifications</div>
          {["No auth middleware, userId hardcoded as constant", "No pagination. All results returned, fine for demo data volumes", "No idempotency keys. Single user, no concurrent requests", "No DELETE endpoints. Not needed for demo flow", "Returns 200 for detect (not 202) for simpler client handling", "No rate limiting. Single user, Replicate has its own limits"].map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: C.textMuted, fontFamily: MONO, marginTop: 4, display: "flex", gap: 8 }}>
              <span style={{ color: C.rust }}>•</span><span>{s}</span>
            </div>
          ))}
        </div>
      </MVPSection>
    </div>
  );
}

// ─── RENDERER MAP ────────────────────────────────────────────────────────────
const renderers = { overview: OverviewSection, "user-journey": UserJourneySection, architecture: ArchitectureSection, database: DatabaseSection, "ml-pipeline": MLPipelineSection, "product-strategy": ProductStrategySection, "api-design": APISection };

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function DetectFlowExplainer() {
  const [active, setActive] = useState("overview");
  const section = sections.find(s => s.id === active);
  const Renderer = renderers[active];

  return (
    <div style={{ minHeight: "100vh", background: C.midnight, fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer;border:none;outline:none}::selection{background:rgba(229,165,75,0.25)}`}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "24px 24px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 4, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: C.midnight, fontFamily: MONO }}>DF</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: MONO }}>DetectFlow</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.cream, fontFamily: FONT }}>Architecture & Product Deep Dive</h1>
          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4, fontFamily: FONT }}>Technical architecture, ML pipeline, database design, product strategy, and API reference.</p>
          <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center" }}>
            {[{ l: "SWE", c: C.slate }, { l: "ML", c: C.mauve }, { l: "Product", c: C.sage }].map(t => (
              <span key={t.l} style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: t.c, padding: "3px 10px", borderRadius: 3, fontFamily: MONO }}>{t.l}</span>
            ))}
            <span style={{ width: 1, height: 16, background: C.border, marginLeft: 6, marginRight: 6 }} />
            <a href="https://github.com/prekshaGoyalX/DetectFlow" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.textMuted, textDecoration: "none", fontFamily: MONO, padding: "3px 10px", borderRadius: 3, border: `1px solid ${C.border}`, transition: "all 0.15s" }} onMouseOver={e => { e.currentTarget.style.color = C.amber; e.currentTarget.style.borderColor = C.amber; }} onMouseOut={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              View Source
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 60px" }}>
        {/* Tab nav */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", paddingBottom: 16, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600, fontFamily: FONT, flexShrink: 0, transition: "all 0.15s", background: active === s.id ? C.amber : "transparent", color: active === s.id ? C.midnight : C.textMuted, border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Section header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.cream, fontFamily: FONT }}>{section.title}</h2>
          <p style={{ fontSize: 15, color: C.textMuted, marginTop: 4, fontFamily: FONT }}>{section.subtitle}</p>
        </div>

        <Renderer content={section.content} />

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => { const i = sections.findIndex(s => s.id === active); if (i > 0) setActive(sections[i - 1].id); }} disabled={active === sections[0].id} style={{ padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, fontFamily: FONT, background: C.midnightLighter, color: active === sections[0].id ? C.textMuted : C.text, border: "none", cursor: active === sections[0].id ? "default" : "pointer", opacity: active === sections[0].id ? 0.3 : 1 }}>← Previous</button>
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: MONO }}>{sections.findIndex(s => s.id === active) + 1} / {sections.length}</span>
          <button onClick={() => { const i = sections.findIndex(s => s.id === active); if (i < sections.length - 1) setActive(sections[i + 1].id); }} disabled={active === sections[sections.length - 1].id} style={{ padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, fontFamily: FONT, background: active === sections[sections.length - 1].id ? C.midnightLighter : C.amber, color: active === sections[sections.length - 1].id ? C.textMuted : C.midnight, border: "none", cursor: active === sections[sections.length - 1].id ? "default" : "pointer", opacity: active === sections[sections.length - 1].id ? 0.3 : 1 }}>Next →</button>
        </div>
      </div>
    </div>
  );
}