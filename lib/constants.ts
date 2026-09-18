// Single source of truth for MAP Fitness site copy, sourced verbatim from
// MAP FITNESS DOSSIER 2026, the pricing flyer, and MAP Brand Guidelines 2026.

export const BRAND = {
  name: "MAP",
  fullName: "Muscle and Performance",
  tagline: "YOUR LIMIT IS YOU",
  campaignLine: "TRAIN BETTER. RECOVER BETTER. PERFORM BETTER.",
  story: [
    "MAP stands for Muscle and Performance, and the mark is built on a simple physical truth: a body under real training lives between two forces — rigidity and range.",
    "MAP is built for people who train seriously — not for one thing, but for the two things that actually make training work: strength and flexibility.",
    "Most gyms pick a side. MAP doesn’t. Here, power and range are treated as the same goal, not competing priorities, because a body that’s only strong or only flexible eventually breaks down.",
    "MAP is where muscle and performance are built together, on purpose.",
  ],
  logoMeaning:
    "The M and P are made of hard, straight lines with sharp corners — solid and strong. The A has a soft curve, like an arch — the flexibility, the stretch and movement. The whole word leans forward a bit, like it’s in motion — mid-workout, not standing still.",
} as const;

export const CONTACT = {
  addressLines: [
    "4th Floor, MAP Fitness Club",
    "No. 5AC, 722–723, 8th Main Road",
    "HRBR Layout 1st Block, Kalyan Nagar",
    "Bengaluru – 560043",
  ],
  mapQuery: "MAP Fitness Club HRBR Layout Kalyan Nagar Bengaluru",
  phones: [
    { label: "MAP Office", number: "+91 97400 63730" },
    { label: "Preran", number: "+91 96834 03069" },
    { label: "Monish", number: "+91 99014 95555" },
  ],
  instagram: "@map.blr",
  instagramUrl: "https://instagram.com/map.blr",
  /** The number the site's WhatsApp button opens a chat with — the MAP
   * office line, the same one listed first under `phones`. Digits only and
   * country code included, which is the format wa.me requires: it rejects
   * spaces, a leading +, and anything without a country code. */
  whatsappNumber: "919740063730",
  whatsappMessage: "Hi MAP, I'd like to know more about membership.",
} as const;

/** wa.me rather than api.whatsapp.com/send: it is the short link WhatsApp
 * documents for exactly this, and it resolves to the native app on a phone
 * and to WhatsApp Web on a desktop without the caller choosing. */
export const whatsappUrl = () =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`;

export const RECOVERY_INTRO =
  "Your membership now includes a significantly upgraded recovery floor — built to make rest as deliberate as training.";

export const RECOVERY_FEATURES = [
  {
    index: "01",
    title: "Sauna",
    description: "Relax, reset and make recovery part of your routine.",
    image: "/images/recovery/sauna.png",
  },
  {
    index: "02",
    title: "Steam Room",
    description: "A dedicated wellness experience to unwind and refresh.",
    image: "/images/recovery/steam.png",
  },
  {
    index: "03",
    title: "Ice Plunge",
    description: "Cold recovery designed for a powerful post-training reset.",
    image: "/images/recovery/ice-plunge.png",
  },
  {
    index: "04",
    title: "Red Light Therapy",
    description: "A premium recovery addition to your fitness routine.",
    image: "/images/recovery/red-light-therapy.png",
  },
] as const;

export const TRAINING_MODALITIES = [
  {
    index: "01",
    title: "Calisthenics",
    description: "Bodyweight strength, skill work and athletic movement.",
    animation: "calisthenics",
    href: "/programs/calisthenics",
  },
  {
    index: "02",
    title: "HYROX / Functional",
    description: "Conditioning, endurance and functional performance.",
    animation: "hyrox",
    href: "/programs/hyrox",
  },
  {
    index: "03",
    title: "MMA & Grappling",
    description: "Dedicated combat-sport and grappling training.",
    animation: "mma",
    href: "/programs/mma",
  },
  {
    index: "04",
    title: "Pilates",
    description: "Strength, control, mobility and alignment.",
    animation: "pilates",
    href: "/programs/pilates",
  },
  {
    index: "05",
    title: "New Equipment",
    description: "More variety and better training options across the club.",
    animation: "equipment",
    href: "/programs/equipment",
  },
  {
    index: "06",
    title: "Group Classes",
    description: "Train together and bring more energy into your routine.",
    animation: "group-classes",
    href: "/programs/group-classes",
  },
] as const;

// Per-discipline detail-page content — keyed by the same slug as the
// TRAINING_MODALITIES href/animation, one source of truth for /programs/[slug].
export const PROGRAM_DETAILS = {
  calisthenics: {
    title: "Calisthenics",
    tagline: "Bodyweight strength, built from the ground up.",
    heroImage: "/images/training/calisthenics.jpg",
    stats: [
      { label: "Level", description: "All Levels" },
      { label: "Format", description: "Open Gym + Coached" },
      { label: "Focus", description: "Strength & Control" },
    ],
    overview:
      "Calisthenics trains using nothing but your own bodyweight — pull-ups, dips, muscle-ups, handstands, levers — building strength, control and body awareness that machines can't teach. It's the foundation discipline at MAP: the same rigidity-and-range philosophy the brand is built on, expressed one rep at a time.",
    benefits: [
      "Builds real, transferable strength and joint control",
      "Develops balance, coordination and body awareness",
      "No equipment required to start — progress at your own pace",
      "Skills carry over into every other discipline at MAP",
    ],
    atMap:
      "A dedicated calisthenics rig and performance space, coached progressions from your first pull-up to your first muscle-up, and open-gym access to practice anytime your membership is active.",
  },
  hyrox: {
    title: "HYROX / Functional",
    tagline: "Conditioning built for real-world performance.",
    heroImage: "/images/training/hyrox.jpg",
    stats: [
      { label: "Level", description: "Beginner–Competitive" },
      { label: "Format", description: "Programmed Sessions" },
      { label: "Focus", description: "Conditioning & Endurance" },
    ],
    overview:
      "HYROX and functional training combine running with functional work stations — sleds, rowing, farmers carries, wall balls — built to test and build total conditioning, not isolated muscles. It's for anyone training for endurance, competition, or a body that performs under fatigue.",
    benefits: [
      "Builds engine (cardio) and strength together",
      "Trains movement patterns you actually use",
      "Structured programming toward HYROX-style competition, if you want it",
      "Scales from first-timer to competitive athlete",
    ],
    atMap:
      "A dedicated HYROX and functional zone with sleds, rowers and the full station lineup, plus programmed conditioning sessions built around the same standards used in competition.",
  },
  mma: {
    title: "MMA & Grappling",
    tagline: "Dedicated combat-sport and grappling training.",
    heroImage: "/images/training/mma.jpg",
    stats: [
      { label: "Level", description: "Beginner–Competitive" },
      { label: "Format", description: "Coached Classes" },
      { label: "Focus", description: "Striking & Grappling" },
    ],
    overview:
      "Striking, clinch work and grappling — MMA & Grappling at MAP is coached combat-sport training for anyone from complete beginner to competitor, focused on technique, timing and conditioning over anything flashy.",
    benefits: [
      "Full-body conditioning that builds real skill",
      "Technical striking and grappling instruction",
      "Live sparring for those who want to test it",
      "A disciplined, respectful training culture",
    ],
    atMap:
      "Specialist MMA and grappling coaching, dedicated mat space, and a training community built around the sport — for casual training or serious competition prep.",
  },
  pilates: {
    title: "Pilates",
    tagline: "Strength, control, mobility and alignment.",
    heroImage: "/images/training/pilates.jpg",
    stats: [
      { label: "Level", description: "All Levels" },
      { label: "Format", description: "Coached Sessions" },
      { label: "Focus", description: "Core & Mobility" },
    ],
    overview:
      "Pilates at MAP is controlled, precise movement work built to develop core strength, mobility and postural alignment — the range half of MAP's strength-and-flexibility philosophy, and the ideal counterbalance to heavier training.",
    benefits: [
      "Builds deep core and postural strength",
      "Improves mobility and joint range of motion",
      "Low-impact — a great fit for recovery days",
      "Complements strength training instead of competing with it",
    ],
    atMap:
      "Dedicated Pilates sessions on the class schedule, with one free trial session included for founding members.",
  },
  equipment: {
    title: "New Equipment",
    tagline: "More variety and better training options across the club.",
    heroImage: "/images/training/equipment.jpg",
    stats: [
      { label: "Level", description: "All Levels" },
      { label: "Format", description: "Open Access" },
      { label: "Focus", description: "Strength & Variety" },
    ],
    overview:
      "A fully upgraded equipment floor — more racks, more machines, more specialty tools — built so every training style at MAP has what it actually needs, without the wait.",
    benefits: [
      "Expanded free-weight and machine selection",
      "Specialty equipment for strength, conditioning and mobility work",
      "More stations means less waiting, more training",
      "Built to support every discipline under one roof",
    ],
    atMap: "Full access included in every membership — no separate booking, no extra cost.",
  },
  "group-classes": {
    title: "Group Classes",
    tagline: "Train together and bring more energy into your routine.",
    heroImage: "/images/training/group-classes.jpg",
    stats: [
      { label: "Level", description: "All Levels" },
      { label: "Format", description: "Scheduled Classes" },
      { label: "Focus", description: "Community & Energy" },
    ],
    overview:
      "Group Classes bring MAP's disciplines together in a coached, high-energy format — for members who train better with people around them than alone.",
    benefits: [
      "Coached sessions across multiple disciplines",
      "Built-in accountability and community",
      "A structured way to try new training styles",
      "All fitness levels welcome",
    ],
    atMap: "The full class schedule is included in membership, with access to every group class across the week.",
  },
} as const;

export type ProgramSlug = keyof typeof PROGRAM_DETAILS;

export const COMMUNITY_ZONES = [
  { title: "Cardio", image: "/images/community/cardio.jpg" },
  { title: "Strength", image: "/images/community/strength.jpg" },
  { title: "Reception", image: "/images/community/reception.jpg" },
] as const;

export const COMMUNITY_COPY =
  "From group classes and Pilates to HYROX, calisthenics, MMA and grappling, MAP brings different training communities together under one roof. Members have more reasons to connect, stay motivated and keep showing up.";

export const COMMUNITY_BANNER = "ONE MEMBERSHIP. MORE WAYS TO TRAIN. MORE REASONS TO BELONG.";

export const MEMBERSHIP_ECOSYSTEM = [
  { label: "UNLIMITED TRAINING", description: "Access to MAP’s upgraded gym and training spaces." },
  { label: "PERFORMANCE SPACES", description: "Dedicated calisthenics and HYROX functional zones." },
  { label: "MMA & GRAPPLING", description: "Specialist combat-sport and grappling training." },
  { label: "PILATES", description: "A focused movement experience for strength and mobility." },
  { label: "RECOVERY & WELLNESS", description: "Sauna, steam room, ice plunge and red light therapy." },
  { label: "GROUP ENERGY", description: "Group classes and shared fitness experiences." },
  { label: "STRONGER COMMUNITY", description: "A club built to create connection and belonging." },
] as const;

export const MEMBERSHIP_CTA = {
  headline: "JOIN THE MAP COMMUNITY",
  subline: "Train with purpose. Move with confidence. Recover with intention.",
} as const;

export const GST_NOTE = "All prices are exclusive of GST.";

/** What every membership carries, and what the wellness tiers add on top.
 * The recovery list is derived from RECOVERY_FEATURES rather than retyped,
 * so the floor's contents are stated in exactly one place — add a service
 * there and every price card that includes it follows. */
const MEMBERSHIP_BASE = ["Unlimited gym access", "Strength & conditioning floor"];
const MEMBERSHIP_WITH_WELLNESS = [
  ...MEMBERSHIP_BASE,
  ...RECOVERY_FEATURES.map((feature) => feature.title),
];

/** The membership grid. Split by whether the recovery floor is included,
 * not by when you joined: the individual and couple prices each come in a
 * strength-and-conditioning tier and a tier that adds wellness. */
export const MEMBERSHIPS = [
  {
    id: "individual",
    name: "Individual",
    note: "Strength & conditioning",
    price: 20000,
    features: MEMBERSHIP_BASE,
  },
  {
    id: "individual-wellness",
    name: "Individual + Wellness",
    note: "Strength & conditioning, plus the recovery floor",
    price: 25000,
    features: MEMBERSHIP_WITH_WELLNESS,
    highlight: true,
  },
  {
    id: "couple",
    name: "Couple",
    note: "Two people · strength & conditioning",
    price: 40000,
    features: MEMBERSHIP_BASE,
  },
  {
    id: "couple-wellness",
    name: "Couple + Wellness",
    note: "Two people, plus the recovery floor",
    price: 50000,
    features: MEMBERSHIP_WITH_WELLNESS,
  },
] as const;

/** One-to-one coaching, sold as a block of sessions. The per-session rate
 * the page shows beside each block is divided out of these two numbers
 * rather than written down, so the two can never disagree. */
export const PRIVATE_TRAINING = [
  { sessions: 12, price: 15000 },
  { sessions: 20, price: 20000 },
] as const;

/** Recovery for non-members, and for members on a strength-only tier:
 * any one service, or the whole floor in a single visit. */
export const RECOVERY_SESSION_PRICING = {
  single: 500,
  allAccess: 1799,
} as const;

/** Drop-in rates, per class. */
export const CLASS_PRICING = [
  { name: "Boxing", price: 1000 },
  { name: "HYROX", price: 1000 },
  { name: "Calisthenics", price: 1000 },
  { name: "Yoga", price: 1000 },
  { name: "Pilates", price: 1500 },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "The Philosophy", href: "/about" },
  { label: "The Path", href: "/programs" },
  { label: "The Commitment", href: "/pricing" },
  { label: "Begin Your Story", href: "/contact" },
] as const;

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
