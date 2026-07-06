// =============================================================
// Quran API Service
// Uses equran.id (Indonesian) + alquran.cloud (English)
// Both are free and require no API key
// =============================================================

const EQURAN_BASE = "https://equran.id/api/v2";
const ALQURAN_BASE = "https://api.alquran.cloud/v1";
const ALADHAN_BASE = "https://api.aladhan.com/v1";

export type Surah = {
  nomor: number;
  nama: string;         // Arabic name
  namaLatin: string;    // Latin name e.g. "Al-Fatihah"
  jumlahAyat: number;
  tempatTurun: string;  // "Mekah" | "Madinah"
  arti: string;         // Indonesian meaning
};

export type Ayah = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  teksEnglish?: string;
  tafsir?: string;
};

export type SurahDetail = Surah & {
  ayat: Ayah[];
  audioFull?: string;
};

export type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type DailyDua = {
  arabic: string;
  transliteration: string;
  translation_id: string;
  translation_en: string;
  source: string;
};

// Curated daily duas
export const DAILY_DUAS: DailyDua[] = [
  {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina 'adhab an-nar",
    translation_id: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.",
    translation_en: "Our Lord, give us good in this world and good in the hereafter, and protect us from the punishment of the Fire.",
    source: "QS. Al-Baqarah: 201",
  },
  {
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliteration: "Rabbi ishrah li sadri wa yassir li amri",
    translation_id: "Ya Tuhanku, lapangkanlah dadaku dan mudahkanlah urusanku.",
    translation_en: "My Lord, expand for me my breast and ease for me my task.",
    source: "QS. Ta-Ha: 25-26",
  },
  {
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً",
    transliteration: "Rabbana la tuzigh qulubana ba'da idh hadaytana wa hab lana mil-ladunka rahmah",
    translation_id: "Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan sesudah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi Engkau.",
    translation_en: "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy.",
    source: "QS. Ali Imran: 8",
  },
  {
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration: "Allahumma inni as'aluka al-'afiyata fid-dunya wal-akhirah",
    translation_id: "Ya Allah, sesungguhnya aku memohon kepada-Mu keselamatan di dunia dan akhirat.",
    translation_en: "O Allah, I ask You for well-being in this world and the next.",
    source: "HR. Abu Dawud",
  },
  {
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    translation_id: "Ya Tuhanku, tambahkanlah ilmu kepadaku.",
    translation_en: "My Lord, increase me in knowledge.",
    source: "QS. Ta-Ha: 114",
  },
  {
    arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
    translation_id: "Ya Allah, tolonglah aku untuk selalu mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu.",
    translation_en: "O Allah, help me to remember You, to thank You, and to worship You in the best manner.",
    source: "HR. Abu Dawud",
  },
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakil",
    translation_id: "Cukuplah Allah sebagai penolong kami, dan Dialah sebaik-baik pelindung.",
    translation_en: "Allah is sufficient for us, and He is the best disposer of affairs.",
    source: "QS. Ali Imran: 173",
  },
];

// Get today's dua based on day of year
export function getDailyDua(): DailyDua {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_DUAS[dayOfYear % DAILY_DUAS.length];
}

// Fetch list of all surahs
export async function fetchSurahList(): Promise<Surah[]> {
  const res = await fetch(`${EQURAN_BASE}/surat`);
  if (!res.ok) throw new Error("Failed to fetch surah list");
  const json = await res.json();
  return json.data as Surah[];
}

// Fetch a single surah with Indonesian translation
export async function fetchSurahID(number: number): Promise<SurahDetail> {
  const res = await fetch(`${EQURAN_BASE}/surat/${number}`);
  if (!res.ok) throw new Error(`Failed to fetch surah ${number}`);
  const json = await res.json();
  return json.data as SurahDetail;
}

// Fetch English translation from alquran.cloud
export async function fetchSurahEN(number: number): Promise<Record<number, string>> {
  const res = await fetch(`${ALQURAN_BASE}/surah/${number}/en.asad`);
  if (!res.ok) throw new Error(`Failed to fetch English translation for surah ${number}`);
  const json = await res.json();
  const map: Record<number, string> = {};
  for (const ayah of json.data.ayahs) {
    map[ayah.numberInSurah] = ayah.text;
  }
  return map;
}

// Fetch tafsir (Indonesian only — equran.id)
export async function fetchTafsir(number: number): Promise<Record<number, string>> {
  const res = await fetch(`${EQURAN_BASE}/tafsir/${number}`);
  if (!res.ok) throw new Error(`Failed to fetch tafsir for surah ${number}`);
  const json = await res.json();
  const map: Record<number, string> = {};
  for (const item of json.data.tafsir) {
    map[item.ayat] = item.teks;
  }
  return map;
}

// Fetch prayer times by coordinates
export async function fetchPrayerTimes(
  latitude: number,
  longitude: number
): Promise<PrayerTimes> {
  const date = new Date();
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const res = await fetch(
    `${ALADHAN_BASE}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=11`
  );
  if (!res.ok) throw new Error("Failed to fetch prayer times");
  const json = await res.json();
  const t = json.data.timings;
  return {
    Fajr: t.Fajr,
    Sunrise: t.Sunrise,
    Dhuhr: t.Dhuhr,
    Asr: t.Asr,
    Maghrib: t.Maghrib,
    Isha: t.Isha,
  };
}

// Get a random ayah for "ayah of the day"
export async function fetchDailyAyah(): Promise<{
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  translation_id: string;
  translation_en: string;
}> {
  // Pick surah based on day so it changes daily but is consistent within the day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const surahNumber = (dayOfYear % 114) + 1;

  const [surahID, enMap] = await Promise.all([
    fetchSurahID(surahNumber),
    fetchSurahEN(surahNumber),
  ]);

  const ayahIndex = dayOfYear % surahID.ayat.length;
  const ayah = surahID.ayat[ayahIndex];

  return {
    surahName: surahID.namaLatin,
    surahNumber,
    ayahNumber: ayah.nomorAyat,
    arabic: ayah.teksArab,
    translation_id: ayah.teksIndonesia,
    translation_en: enMap[ayah.nomorAyat] ?? "",
  };
}
