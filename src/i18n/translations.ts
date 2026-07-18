export type Lang = "id" | "en";

export type Translations = {
  // Common
  appName: string;
  loading: string;
  retry: string;
  cancel: string;
  save: string;
  delete: string;
  undo: string;
  close: string;
  back: string;
  search: string;
  or: string;
  done: string;
  log: string;
  noData: string;
  error: string;
  ok: string;
  setGoals: string;
  monthlyBudget: string;

  // Tab bar
  tabCompass: string;
  tabActivity: string;
  tabProfile: string;

  // Compass
  knowThyself: string;
  attributes: string;
  roadmap: string;
  yourJourneyStarts: string;
  tapToLog: string;
  logYourFirst: string;
  loggedToday: string;
  dayStreak: string;
  ptsToNext: string;
  maxRank: string;
  synergy: string;

  // Pillars
  soul: string;
  vessel: string;
  impact: string;
  stewardship: string;
  soulHint: string;
  vesselHint: string;
  impactHint: string;
  stewardshipHint: string;

  // Activity
  activity: string;
  entries: string;
  all: string;
  today: string;
  week: string;
  month: string;
  year: string;
  noActivity: string;
  tapToLogFirst: string;
  deleteEntry: string;
  deleteTransaction: string;
  deletedEntry: string;

  // Profile
  profile: string;
  setUsername: string;
  edit: string;
  appearance: string;
  darkMode: string;
  lightMode: string;
  switchToDark: string;
  switchToLight: string;
  notifications: string;
  notifSettings: string;
  privacy: string;
  shareActivity: string;
  signOut: string;
  signOutConfirm: string;
  data: string;
  exportData: string;
  exportDesc: string;
  achievements: string;
  unlocked: string;
  locked: string;
  dailyChallenge: string;
  fellowship: string;
  shareProgress: string;
  shareProgressDesc: string;
  language: string;
  bahasaIndonesia: string;
  english: string;
  couldntSave: string;
  usernameSaved: string;
  usernameNow: string;
  couldntUpdatePrivacy: string;
  exportFailed: string;
  couldntExport: string;

  // Notifications
  prayerAlerts: string;
  prayerDesc: string;
  dailyReminder: string;
  reminderDesc: string;
  streakWarning: string;
  streakDesc: string;
  settingsSaved: string;
  permissionDenied: string;
  enableNotifInSettings: string;
  couldntSaveNotif: string;
  disableAll: string;
  disableAllConfirm: string;
  allScheduledCancelled: string;

  // Soul
  daily: string;
  dua: string;
  dzikir: string;
  asmaul: string;
  quran: string;
  hafalan: string;

  // Hafalan
  hafalanTitle: string;
  hafalanDesc: string;
  startHafalan: string;
  resetProgress: string;
  resetConfirm: string;
  replace: string;
  start: string;
  notYet: string;
  memorizing: string;
  memorized: string;

  // Salah
  sholatToday: string;
  timePeriods: string;
  xpToday: string;
  complete: string;
  upcoming: string;
  passed: string;

  // Vessel
  myProfile: string;
  myPlan: string;
  muscleGroups: string;
  exercises: string;
  strength: string;
  cardio: string;
  sets: string;
  reps: string;
  duration: string;
  distance: string;
  totalVolume: string;
  addToPlan: string;
  howToPerform: string;
  logged: string;
  addedToPlan: string;
  fullBodyA: string;
  fullBodyB: string;
  push: string;
  pull: string;
  legs: string;
  chest: string;
  backMuscle: string;
  shoulders: string;
  arms: string;
  core: string;
  coreCardio: string;
  incomplete: string;
  fillRequired: string;
  selectEquipment: string;
  target: string;
  rest: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;

  // Stewardship
  invested: string;
  spent: string;
  leaked: string;
  netBalance: string;
  monthlyTrend: string;
  budgetGoals: string;
  zakat: string;
  investment: string;
  consumption: string;
  leak: string;
  healthScore: string;
  reckless: string;
  fragile: string;
  careful: string;
  stable: string;
  disciplined: string;
  frugal: string;
  overTarget: string;
  toGo: string;
  overLimit: string;
  remaining: string;
  tapSetGoals: string;

  // Goals
  addGoal: string;
  todo: string;
  inProgress: string;
  total: string;
  toLearn: string;
  learning: string;
  learned: string;

  // Impact
  workOutput: string;
  score: string;
  avgEffort: string;
  thisWeek: string;
  career: string;
  jobRoadmaps: string;
  goals: string;
  trackGoals: string;
  newEntry: string;
  couldntLoad: string;
  foundation: string;
  advanced: string;
  optional: string;
  beginner: string;
  intermediate: string;

  // Log form
  activityLabel: string;
  durationMinutes: string;
  evidenceLink: string;
  exerciseName: string;
  type: string;
  weight: string;
  category: string;
  note: string;
  code: string;
  design: string;
  write: string;
  manage: string;
  learn: string;
  other: string;
  codeHint: string;
  designHint: string;
  writeHint: string;
  manageHint: string;
  learnHint: string;
  otherHint: string;

  // Ranks
  novice: string;
  apprentice: string;
  adept: string;
  journeyman: string;
  expert: string;
  master: string;
  grandmaster: string;
  legend: string;

  // Badges
  awakened: string;
  initiate: string;
  seeker: string;
  devoted: string;
  enlightened: string;
  athlete: string;
  warrior: string;
  producer: string;
  architect: string;
  frugalBadge: string;
  stewardBadge: string;
  logger: string;
  chronicler: string;
  historian: string;
  spark: string;
  flame: string;
  inferno: string;
  eternalFire: string;
};

export const translations: Record<Lang, Translations> = {
  id: {
    // Common
    appName: "The Mirror",
    loading: "Memuat…",
    retry: "Coba lagi",
    cancel: "Batal",
    save: "Simpan",
    delete: "Hapus",
    undo: "Urungkan",
    close: "Tutup",
    back: "Kembali",
    search: "Cari…",
    or: "atau",
    done: "Selesai",
    log: "Log",
    noData: "Belum ada data",
    error: "Kesalahan",
    ok: "OK",
    setGoals: "Atur Tujuan",
    monthlyBudget: "Anggaran Bulanan",

    // Tab bar
    tabCompass: "Kompas",
    tabActivity: "Aktivitas",
    tabProfile: "Profil",

    // Compass
    knowThyself: "Kenali dirimu.",
    attributes: "ATRIBUT",
    roadmap: "Roadmap ›",
    yourJourneyStarts: "Perjalananmu dimulai di sini",
    tapToLog: "Ketuk + untuk mencatat aktivitas pertamamu dan mulai bangun skor Sinergi.",
    logYourFirst: "+ Catat aktivitas pertama",
    loggedToday: "✓ Sudah hari ini",
    dayStreak: "hari berturut",
    ptsToNext: "pts →",
    maxRank: "Peringkat maks 🏆",
    synergy: "SINERGI",

    // Pillars
    soul: "Soul",
    vessel: "Vessel",
    impact: "Impact",
    stewardship: "Stewardship",
    soulHint: "Doa, meditasi, syukur",
    vesselHint: "Olahraga, lari, pemulihan",
    impactHint: "Pekerjaan selesai, tugas ditutup",
    stewardshipHint: "Investasi, pengeluaran, kebocoran",

    // Activity
    activity: "Aktivitas",
    entries: "entri",
    all: "Semua",
    today: "Hari ini",
    week: "Minggu",
    month: "Bulan",
    year: "Tahun",
    noActivity: "Belum ada aktivitas.",
    tapToLogFirst: "Ketuk tombol + untuk mencatat entri pertama.",
    deleteEntry: "Hapus entri?",
    deleteTransaction: "Hapus transaksi?",
    deletedEntry: "Dihapus",

    // Profile
    profile: "Profil",
    setUsername: "atur username",
    edit: "Edit",
    appearance: "TAMPILAN",
    darkMode: "🌙 Mode gelap",
    lightMode: "☀️ Mode terang",
    switchToDark: "Beralih ke tema gelap",
    switchToLight: "Beralih ke tema terang",
    notifications: "NOTIFIKASI",
    notifSettings: "🔔 Pengaturan notifikasi",
    privacy: "PRIVASI",
    shareActivity: "Bagikan aktivitas olahraga",
    signOut: "Keluar",
    signOutConfirm: "Kamu perlu masuk lagi untuk mengakses datamu.",
    data: "DATA",
    exportData: "📤 Ekspor data",
    exportDesc: "Unduh log, transaksi, dan tujuanmu sebagai JSON",
    achievements: "PENCAPAIAN",
    unlocked: "terbuka",
    locked: "TERKUNCI",
    dailyChallenge: "TANTANGAN HARIAN",
    fellowship: "PERSEKUTUAN",
    shareProgress: "📤 Bagikan progresmu",
    shareProgressDesc: "Bagikan statistikmu dengan teman",
    language: "BAHASA",
    bahasaIndonesia: "🇮🇩 Bahasa Indonesia",
    english: "🇬🇧 English",
    couldntSave: "Tidak dapat menyimpan.",
    usernameSaved: "Username tersimpan ✓",
    usernameNow: "Username-mu sekarang @",
    couldntUpdatePrivacy: "Tidak dapat memperbarui pengaturan privasi.",
    exportFailed: "Ekspor gagal",
    couldntExport: "Tidak dapat mengekspor data.",

    // Notifications
    prayerAlerts: "Peringatan waktu sholat",
    prayerDesc: "Dapatkan notifikasi di setiap waktu sholat. Waktu berdasarkan lokasi Anda.",
    dailyReminder: "Pengingat harian",
    reminderDesc: "Pengingat untuk mencatat Soul, Vessel, Impact, dan Stewardship hari ini.",
    streakWarning: "Peringatan streak",
    streakDesc: "Notifikasi saat streak-mu dalam bahaya putus.",
    settingsSaved: "Pengaturan tersimpan ✓",
    permissionDenied: "Izin ditolak",
    enableNotifInSettings: "Aktifkan notifikasi di pengaturan perangkat untuk menggunakan fitur ini.",
    couldntSaveNotif: "Tidak dapat menyimpan notifikasi.",
    disableAll: "Nonaktifkan semua",
    disableAllConfirm: "Nonaktifkan semua notifikasi?",
    allScheduledCancelled: "Semua notifikasi terjadwal akan dibatalkan.",

    // Soul
    daily: "Harian",
    dua: "Doa",
    dzikir: "Dzikir",
    asmaul: "Asmaul",
    quran: "Al-Qur'an",
    hafalan: "Hafalan",

    // Hafalan
    hafalanTitle: "Hafalan Al-Qur'an",
    hafalanDesc: "Pilih surah dan tentukan berapa ayat per sesi. Kami akan membuat timeline hafalan untukmu.",
    startHafalan: "Mulai Hafalan",
    resetProgress: "Reset progres?",
    resetConfirm: "Semua sesi akan dikembalikan ke awal. Surah tetap sama.",
    replace: "Ganti",
    start: "Mulai",
    notYet: "Belum",
    memorizing: "Dihafal",
    memorized: "Hafal ✓",

    // Salah
    sholatToday: "Sholat Hari Ini",
    timePeriods: "waktu",
    xpToday: "XP hari ini",
    complete: "✓ Lengkap",
    upcoming: "Belum",
    passed: "Lewat",

    // Vessel
    myProfile: "Profil Saya",
    myPlan: "Rencana Saya",
    muscleGroups: "OTOT",
    exercises: "Latihan",
    strength: "Kekuatan",
    cardio: "Kardio",
    sets: "SET",
    reps: "REPS",
    duration: "DURASI (menit)",
    distance: "JARAK (km)",
    totalVolume: "Total volume",
    addToPlan: "⚡ Tambah ke Rencana",
    howToPerform: "📋 Cara melakukan",
    logged: "Tercatat! 💪",
    addedToPlan: "Ditambahkan ke rencana ✓",
    fullBodyA: "Full Body A",
    fullBodyB: "Full Body B",
    push: "Push",
    pull: "Pull",
    legs: "Legs",
    chest: "Dada",
    backMuscle: "Punggung",
    shoulders: "Bahu",
    arms: "Lengan",
    core: "Core",
    coreCardio: "Core & Kardio",
    incomplete: "Tidak lengkap",
    fillRequired: "Isi berat, tinggi, dan usia.",
    selectEquipment: "Pilih minimal satu opsi peralatan.",
    target: "Target",
    rest: "Istirahat",
    mon: "Sen",
    tue: "Sel",
    wed: "Rab",
    thu: "Kam",
    fri: "Jum",
    sat: "Sab",
    sun: "Min",

    // Stewardship
    invested: "Investasi",
    spent: "Pengeluaran",
    leaked: "Kebocoran",
    netBalance: "Saldo bersih",
    monthlyTrend: "Tren Bulanan",
    budgetGoals: "Tujuan Anggaran",
    zakat: "Zakat",
    investment: "Investasi",
    consumption: "Konsumsi",
    leak: "Kebocoran",
    healthScore: "SKOR KESEHATAN",
    reckless: "Boros",
    fragile: "Rapuh",
    careful: "Hati-hati",
    stable: "Stabil",
    disciplined: "Disiplin",
    frugal: "Hemat",
    overTarget: "melampaui target 🎉",
    toGo: "lagi",
    overLimit: "melampaui batas ⚠️",
    remaining: "tersisa",
    tapSetGoals: 'Ketuk "Atur Tujuan" untuk menambahkan target dan batas bulanan.',

    // Goals
    addGoal: "+ Tujuan",
    todo: "Belum",
    inProgress: "Sedang",
    total: "Total",
    toLearn: "Belajar",
    learning: "Belajar",
    learned: "Sudah ✓",

    // Impact
    workOutput: "Pekerjaan & Output",
    score: "Skor",
    avgEffort: "Rata-rata",
    thisWeek: "Minggu ini",
    career: "Karir",
    jobRoadmaps: "Roadmap karir",
    goals: "Tujuan",
    trackGoals: "Lacak tujuan",
    newEntry: "Entri baru",
    couldntLoad: "Tidak dapat memuat log.",
    foundation: "Dasar",
    advanced: "Lanjutan",
    optional: "Opsional",
    beginner: "Pemula",
    intermediate: "Menengah",

    // Log form
    activityLabel: "Aktivitas",
    durationMinutes: "Durasi (menit)",
    evidenceLink: "Bukti tautan (opsional)",
    exerciseName: "Nama latihan / sesi",
    type: "Tipe",
    weight: "Berat (kg)",
    category: "Kategori",
    note: "Catatan",
    code: "Kode",
    design: "Desain",
    write: "Tulis",
    manage: "Kelola",
    learn: "Belajar",
    other: "Lainnya",
    codeHint: "PR, commit, bug fix",
    designHint: "UI, mockup, prototipe",
    writeHint: "Dokumen, artikel, laporan",
    manageHint: "Rapat, perencanaan, review",
    learnHint: "Kursus, buku, riset",
    otherHint: "Apapun selain itu",

    // Ranks
    novice: "Pemula",
    apprentice: "Peserta",
    adept: "Mahir",
    journeyman: "Penjelajah",
    expert: "Ahli",
    master: "Master",
    grandmaster: "Grandmaster",
    legend: "Legenda",

    // Badges
    awakened: "Bangkit",
    initiate: "Inisiasi",
    seeker: "Pencari",
    devoted: "Berbakti",
    enlightened: " tercerahkan",
    athlete: "Atlet",
    warrior: "Pejuang",
    producer: "Produser",
    architect: "Arsitek",
    frugalBadge: "Hemat",
    stewardBadge: "Pengelola",
    logger: "Pencatat",
    chronicler: "Kronikus",
    historian: "Sejarawan",
    spark: "Percikan",
    flame: "Api",
    inferno: "Kobaran",
    eternalFire: "Api Abadi",
  },

  en: {
    // Common
    appName: "The Mirror",
    loading: "Loading…",
    retry: "Retry",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    undo: "Undo",
    close: "Close",
    back: "Back",
    search: "Search…",
    or: "or",
    done: "Done",
    log: "Log",
    noData: "No data yet",
    error: "Error",
    ok: "OK",
    setGoals: "Set Goals",
    monthlyBudget: "Monthly Budget",

    // Tab bar
    tabCompass: "Compass",
    tabActivity: "Activity",
    tabProfile: "Profile",

    // Compass
    knowThyself: "Know thyself.",
    attributes: "ATTRIBUTES",
    roadmap: "Roadmap ›",
    yourJourneyStarts: "Your journey starts here",
    tapToLog: "Tap + to log your first activity and start building your Synergy score.",
    logYourFirst: "+ Log your first activity",
    loggedToday: "✓ Logged today",
    dayStreak: "day streak",
    ptsToNext: "pts →",
    maxRank: "Max rank 🏆",
    synergy: "SYNERGY",

    // Pillars
    soul: "Soul",
    vessel: "Vessel",
    impact: "Impact",
    stewardship: "Stewardship",
    soulHint: "Prayer, meditation, gratitude",
    vesselHint: "Workouts, runs, recovery",
    impactHint: "Work shipped, tasks closed",
    stewardshipHint: "Investments, expenses, leaks",

    // Activity
    activity: "Activity",
    entries: "entries",
    all: "All",
    today: "Today",
    week: "Week",
    month: "Month",
    year: "Year",
    noActivity: "No activity yet.",
    tapToLogFirst: "Tap the + button to log your first entry.",
    deleteEntry: "Delete entry?",
    deleteTransaction: "Delete transaction?",
    deletedEntry: "Deleted",

    // Profile
    profile: "Profile",
    setUsername: "set username",
    edit: "Edit",
    appearance: "APPEARANCE",
    darkMode: "🌙 Dark mode",
    lightMode: "☀️ Light mode",
    switchToDark: "Switch to dark theme",
    switchToLight: "Switch to light theme",
    notifications: "NOTIFICATIONS",
    notifSettings: "🔔 Notification settings",
    privacy: "PRIVACY",
    shareActivity: "Share workout activity",
    signOut: "Sign out",
    signOutConfirm: "You'll need to sign in again to access your data.",
    data: "DATA",
    exportData: "📤 Export data",
    exportDesc: "Download your logs, transactions, and goals as JSON",
    achievements: "ACHIEVEMENTS",
    unlocked: "unlocked",
    locked: "LOCKED",
    dailyChallenge: "DAILY CHALLENGE",
    fellowship: "FELLOWSHIP",
    shareProgress: "📤 Share your progress",
    shareProgressDesc: "Share your stats with friends",
    language: "LANGUAGE",
    bahasaIndonesia: "🇮🇩 Bahasa Indonesia",
    english: "🇬🇧 English",
    couldntSave: "Couldn't save.",
    usernameSaved: "Username saved ✓",
    usernameNow: "Your username is now @",
    couldntUpdatePrivacy: "Couldn't update privacy setting.",
    exportFailed: "Export failed",
    couldntExport: "Could not export data.",

    // Notifications
    prayerAlerts: "Prayer time alerts",
    prayerDesc: "Get notified at each of the 5 daily prayer times. Times are based on your location.",
    dailyReminder: "Daily log reminder",
    reminderDesc: "A nudge to log your Soul, Vessel, Impact, and Stewardship for the day.",
    streakWarning: "Streak at-risk warning",
    streakDesc: "Get notified when your streak is about to break.",
    settingsSaved: "Settings saved ✓",
    permissionDenied: "Permission denied",
    enableNotifInSettings: "Enable notifications in your device settings to use this feature.",
    couldntSaveNotif: "Couldn't save notifications.",
    disableAll: "Disable all",
    disableAllConfirm: "Disable all notifications?",
    allScheduledCancelled: "All scheduled notifications will be cancelled.",

    // Soul
    daily: "Daily",
    dua: "Doa",
    dzikir: "Dzikir",
    asmaul: "Asmaul",
    quran: "Al-Qur'an",
    hafalan: "Hafalan",

    // Hafalan
    hafalanTitle: "Hafalan Al-Qur'an",
    hafalanDesc: "Pick a surah and set how many ayat per session. We'll build a memorization timeline for you.",
    startHafalan: "Start Memorization",
    resetProgress: "Reset progress?",
    resetConfirm: "All sessions will be reset. The surah stays the same.",
    replace: "Replace",
    start: "Start",
    notYet: "Not yet",
    memorizing: "Memorizing",
    memorized: "Memorized ✓",

    // Salah
    sholatToday: "Prayers Today",
    timePeriods: "periods",
    xpToday: "XP today",
    complete: "✓ Complete",
    upcoming: "Not yet",
    passed: "Missed",

    // Vessel
    myProfile: "My Profile",
    myPlan: "My Plan",
    muscleGroups: "MUSCLE GROUPS",
    exercises: "Exercises",
    strength: "Strength",
    cardio: "Cardio",
    sets: "SETS",
    reps: "REPS",
    duration: "DURATION (min)",
    distance: "DISTANCE (km)",
    totalVolume: "Total volume",
    addToPlan: "⚡ Add to My Plan",
    howToPerform: "📋 How to perform",
    logged: "Logged! 💪",
    addedToPlan: "Added to plan ✓",
    fullBodyA: "Full Body A",
    fullBodyB: "Full Body B",
    push: "Push",
    pull: "Pull",
    legs: "Legs",
    chest: "Chest",
    backMuscle: "Back",
    shoulders: "Shoulders",
    arms: "Arms",
    core: "Core",
    coreCardio: "Core & Cardio",
    incomplete: "Incomplete",
    fillRequired: "Please fill in weight, height, and age.",
    selectEquipment: "Select at least one equipment option.",
    target: "Target",
    rest: "Rest",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",

    // Stewardship
    invested: "Invested",
    spent: "Spent",
    leaked: "Leaked",
    netBalance: "Net balance",
    monthlyTrend: "Monthly Trend",
    budgetGoals: "Budget Goals",
    zakat: "Zakat",
    investment: "Investment",
    consumption: "Consumption",
    leak: "Leak",
    healthScore: "HEALTH SCORE",
    reckless: "Reckless",
    fragile: "Fragile",
    careful: "Careful",
    stable: "Stable",
    disciplined: "Disciplined",
    frugal: "Frugal",
    overTarget: "over target 🎉",
    toGo: "to go",
    overLimit: "over limit ⚠️",
    remaining: "remaining",
    tapSetGoals: 'Tap "Set Goals" to add monthly targets and limits.',

    // Goals
    addGoal: "+ Goal",
    todo: "Todo",
    inProgress: "In Progress",
    total: "Total",
    toLearn: "To Learn",
    learning: "Learning",
    learned: "Learned ✓",

    // Impact
    workOutput: "Work & Output",
    score: "Score",
    avgEffort: "Avg effort",
    thisWeek: "This week",
    career: "Career",
    jobRoadmaps: "Job roadmaps",
    goals: "Goals",
    trackGoals: "Track goals",
    newEntry: "New entry",
    couldntLoad: "Couldn't load logs.",
    foundation: "Foundation",
    advanced: "Advanced",
    optional: "Optional",
    beginner: "Beginner",
    intermediate: "Intermediate",

    // Log form
    activityLabel: "Activity",
    durationMinutes: "Duration (minutes)",
    evidenceLink: "Evidence link (optional)",
    exerciseName: "Exercise / session name",
    type: "Type",
    weight: "Weight (kg)",
    category: "Category",
    note: "Note",
    code: "Code",
    design: "Design",
    write: "Write",
    manage: "Manage",
    learn: "Learn",
    other: "Other",
    codeHint: "PR, commit, bug fix",
    designHint: "UI, mockup, prototype",
    writeHint: "Docs, article, report",
    manageHint: "Meeting, planning, review",
    learnHint: "Course, book, research",
    otherHint: "Anything else",

    // Ranks
    novice: "Novice",
    apprentice: "Apprentice",
    adept: "Adept",
    journeyman: "Journeyman",
    expert: "Expert",
    master: "Master",
    grandmaster: "Grandmaster",
    legend: "Legend",

    // Badges
    awakened: "Awakened",
    initiate: "Initiate",
    seeker: "Seeker",
    devoted: "Devoted",
    enlightened: "Enlightened",
    athlete: "Athlete",
    warrior: "Warrior",
    producer: "Producer",
    architect: "Architect",
    frugalBadge: "Frugal",
    stewardBadge: "Steward",
    logger: "Logger",
    chronicler: "Chronicler",
    historian: "Historian",
    spark: "Spark",
    flame: "Flame",
    inferno: "Inferno",
    eternalFire: "Eternal Fire",
  },
};
