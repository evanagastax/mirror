// =============================================================
// Dua Library — Organized by category
// All duas with Arabic, transliteration, ID & EN translation
// =============================================================

export type Dua = {
  id: string;
  arabic: string;
  transliteration: string;
  translation_id: string;
  translation_en: string;
  source: string;
};

export type DuaCategory = {
  id: string;
  title_id: string;
  title_en: string;
  icon: string;
  duas: Dua[];
};

export const DUA_CATEGORIES: DuaCategory[] = [
  {
    id: "pagi",
    title_id: "Doa Pagi",
    title_en: "Morning Duas",
    icon: "🌅",
    duas: [
      {
        id: "pagi-1",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        transliteration: "Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah",
        translation_id: "Kami berpagi hari dan kerajaan milik Allah, segala puji bagi Allah, tiada tuhan selain Allah semata, tiada sekutu bagi-Nya.",
        translation_en: "We have reached the morning and so has the dominion of Allah. Praise is to Allah. None has the right to be worshipped except Allah, alone, without partner.",
        source: "HR. Abu Dawud",
      },
      {
        id: "pagi-2",
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        transliteration: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaykan-nushur",
        translation_id: "Ya Allah, dengan-Mu kami memasuki pagi, dengan-Mu kami memasuki sore, dengan-Mu kami hidup, dengan-Mu kami mati, dan kepada-Mu tempat kembali.",
        translation_en: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.",
        source: "HR. Tirmidzi",
      },
      {
        id: "pagi-3",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
        transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduk",
        translation_id: "Ya Allah, Engkau adalah Tuhanku, tidak ada tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu.",
        translation_en: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am your servant.",
        source: "HR. Bukhari",
      },
      {
        id: "pagi-4",
        arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        transliteration: "A'udhu billahi minash-shaytanir-rajim",
        translation_id: "Aku berlindung kepada Allah dari setan yang terkutuk.",
        translation_en: "I seek refuge in Allah from the accursed devil.",
        source: "QS. An-Nahl: 98",
      },
    ],
  },
  {
    id: "petang",
    title_id: "Doa Petang",
    title_en: "Evening Duas",
    icon: "🌇",
    duas: [
      {
        id: "petang-1",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        transliteration: "Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah",
        translation_id: "Kami bersore hari dan kerajaan milik Allah, segala puji bagi Allah, tiada tuhan selain Allah semata, tiada sekutu bagi-Nya.",
        translation_en: "We have reached the evening and so has the dominion of Allah. Praise is to Allah. None has the right to be worshipped except Allah, alone, without partner.",
        source: "HR. Abu Dawud",
      },
      {
        id: "petang-2",
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
        transliteration: "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilaykal-masir",
        translation_id: "Ya Allah, dengan-Mu kami memasuki sore, dengan-Mu kami memasuki pagi, dengan-Mu kami hidup, dengan-Mu kami mati, dan kepada-Mu tempat kembali.",
        translation_en: "O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and to You is the return.",
        source: "HR. Tirmidzi",
      },
      {
        id: "petang-3",
        arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ",
        transliteration: "Allahumma inni amsaytu ushhiduka wa ushhidu hamalata 'arshika wa mala'ikataka wa jami'a khalqika annaka antallahu la ilaha illa ant",
        translation_id: "Ya Allah, sesungguhnya aku di waktu sore ini mempersaksikan-Mu, para malaikat pemikul Arsy-Mu, para malaikat-Mu, dan seluruh makhluk-Mu bahwa Engkau adalah Allah tiada tuhan selain Engkau.",
        translation_en: "O Allah, I have reached the evening and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You.",
        source: "HR. Abu Dawud",
      },
    ],
  },
  {
    id: "tidur",
    title_id: "Doa Tidur & Bangun",
    title_en: "Sleep & Wake Duas",
    icon: "🌙",
    duas: [
      {
        id: "tidur-1",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya",
        translation_id: "Dengan nama-Mu ya Allah, aku mati dan aku hidup.",
        translation_en: "In Your name, O Allah, I die and I live.",
        source: "HR. Bukhari",
      },
      {
        id: "tidur-2",
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
        translation_id: "Ya Allah, peliharalah aku dari azab-Mu pada hari Engkau membangkitkan hamba-hamba-Mu.",
        translation_en: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
        source: "HR. Abu Dawud",
      },
      {
        id: "bangun-1",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration: "Alhamdu lillahil-ladhi ahyaana ba'da ma amaatana wa ilayhin-nushur",
        translation_id: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami dan kepada-Nyalah kami dikembalikan.",
        translation_en: "Praise is to Allah Who gives us life after He has caused us to die and to Him is the return.",
        source: "HR. Bukhari",
      },
    ],
  },
  {
    id: "makan",
    title_id: "Doa Makan & Minum",
    title_en: "Food & Drink Duas",
    icon: "🍽️",
    duas: [
      {
        id: "makan-1",
        arabic: "بِسْمِ اللَّهِ",
        transliteration: "Bismillah",
        translation_id: "Dengan nama Allah.",
        translation_en: "In the name of Allah.",
        source: "HR. Abu Dawud",
      },
      {
        id: "makan-2",
        arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ",
        transliteration: "Allahumma barik lana fihi wa at'imna khayran minh",
        translation_id: "Ya Allah, berkahilah kami padanya dan berilah kami makan yang lebih baik darinya.",
        translation_en: "O Allah, bless us in it and feed us better than it.",
        source: "HR. Tirmidzi",
      },
      {
        id: "makan-3",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
        translation_id: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami muslim.",
        translation_en: "Praise is to Allah Who has fed us and given us drink and made us Muslims.",
        source: "HR. Abu Dawud",
      },
    ],
  },
  {
    id: "keluar",
    title_id: "Doa Keluar & Masuk Rumah",
    title_en: "Leaving & Entering Home",
    icon: "🏠",
    duas: [
      {
        id: "keluar-1",
        arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "Bismillahi tawakkaltu 'alallahi wa la hawla wa la quwwata illa billah",
        translation_id: "Dengan nama Allah, aku bertawakal kepada Allah, dan tiada daya dan kekuatan kecuali dengan Allah.",
        translation_en: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.",
        source: "HR. Abu Dawud",
      },
      {
        id: "masuk-1",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
        transliteration: "Allahumma inni as'aluka khayral mawliji wa khayral makhraji",
        translation_id: "Ya Allah, aku memohon kepada-Mu kebaikan tempat masuk dan kebaikan tempat keluar.",
        translation_en: "O Allah, I ask You for the good of entering and the good of leaving.",
        source: "HR. Abu Dawud",
      },
    ],
  },
  {
    id: "masjid",
    title_id: "Doa Masuk & Keluar Masjid",
    title_en: "Entering & Leaving Mosque",
    icon: "🕌",
    duas: [
      {
        id: "masjid-1",
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allahummaf-tah li abwaba rahmatik",
        translation_id: "Ya Allah, bukalah untukku pintu-pintu rahmat-Mu.",
        translation_en: "O Allah, open the gates of Your mercy for me.",
        source: "HR. Muslim",
      },
      {
        id: "masjid-2",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        transliteration: "Allahumma inni as'aluka min fadlik",
        translation_id: "Ya Allah, aku memohon kepada-Mu dari karunia-Mu.",
        translation_en: "O Allah, I ask You of Your favor.",
        source: "HR. Muslim",
      },
    ],
  },
  {
    id: "safar",
    title_id: "Doa Bepergian",
    title_en: "Travel Duas",
    icon: "✈️",
    duas: [
      {
        id: "safar-1",
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        transliteration: "Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
        translation_id: "Mahasuci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.",
        translation_en: "Glory be to Him Who has subjected this to us, and we could never have it by our efforts, and surely, to our Lord we are returning.",
        source: "QS. Az-Zukhruf: 13-14",
      },
      {
        id: "safar-2",
        arabic: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ",
        transliteration: "Allahumma hawwin 'alayna safarana hadha watwi 'anna bu'dah",
        translation_id: "Ya Allah, mudahkanlah perjalanan kami ini dan dekatkanlah jaraknya bagi kami.",
        translation_en: "O Allah, make this journey easy for us and shorten its distance for us.",
        source: "HR. Muslim",
      },
    ],
  },
  {
    id: "qunut",
    title_id: "Doa Qunut",
    title_en: "Qunut Dua",
    icon: "🤲",
    duas: [
      {
        id: "qunut-1",
        arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ وَبَارِكْ لِي فِيمَا أَعْطَيْتَ",
        transliteration: "Allahummah-dini fiman hadayt, wa 'afini fiman 'afayt, wa tawallani fiman tawallayt, wa barik li fima a'tayt",
        translation_id: "Ya Allah, tunjukilah aku sebagaimana orang-orang yang telah Engkau tunjuki, sehatkanlah aku sebagaimana orang-orang yang telah Engkau sehatkan, pimpinlah aku sebagaimana orang-orang yang telah Engkau pimpin, dan berkahilah untukku apa yang telah Engkau berikan.",
        translation_en: "O Allah, guide me along with those whom You have guided, pardon me along with those whom You have pardoned, be an ally to me along with those whom You are an ally to, and bless for me what You have given me.",
        source: "HR. Abu Dawud",
      },
    ],
  },
  {
    id: "istighfar",
    title_id: "Istighfar & Taubat",
    title_en: "Seeking Forgiveness",
    icon: "💚",
    duas: [
      {
        id: "istighfar-1",
        arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
        transliteration: "Astaghfirullaha al-'azim alladhi la ilaha illa huwal-hayyul-qayyumu wa atubu ilayh",
        translation_id: "Aku memohon ampun kepada Allah Yang Maha Agung, yang tiada tuhan selain Dia, Yang Maha Hidup lagi Maha Berdiri sendiri, dan aku bertaubat kepada-Nya.",
        translation_en: "I seek forgiveness from Allah the Magnificent, whom there is no god except Him, the Ever-Living, the Self-Sustaining, and I repent to Him.",
        source: "HR. Abu Dawud",
      },
      {
        id: "istighfar-2",
        arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
        transliteration: "Rabbigh-firli wa tub 'alayya innaka anta at-tawwabur-rahim",
        translation_id: "Ya Tuhanku, ampunilah aku dan terimalah taubatku, sesungguhnya Engkau Maha Menerima taubat lagi Maha Penyayang.",
        translation_en: "My Lord, forgive me and accept my repentance, You are the Ever-Relenting, the All-Merciful.",
        source: "HR. Tirmidzi",
      },
      {
        id: "istighfar-3",
        arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        transliteration: "Subhanakallahumma wa bihamdika ashhadu an la ilaha illa anta astaghfiruka wa atubu ilayk",
        translation_id: "Maha Suci Engkau ya Allah, dan dengan memuji-Mu aku bersaksi bahwa tiada tuhan selain Engkau, aku memohon ampun kepada-Mu dan bertaubat kepada-Mu.",
        translation_en: "Glory be to You, O Allah, and praise be to You. I bear witness that there is no god but You. I seek Your forgiveness and repent to You.",
        source: "HR. Tirmidzi",
      },
    ],
  },
  {
    id: "kesehatan",
    title_id: "Doa Kesehatan & Penyakit",
    title_en: "Health & Illness Duas",
    icon: "💊",
    duas: [
      {
        id: "kesehatan-1",
        arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
        transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari",
        translation_id: "Ya Allah, sehatkanlah badanku. Ya Allah, sehatkanlah pendengaranku. Ya Allah, sehatkanlah penglihatanku.",
        translation_en: "O Allah, make me healthy in my body. O Allah, make me healthy in my hearing. O Allah, make me healthy in my sight.",
        source: "HR. Abu Dawud",
      },
      {
        id: "kesehatan-2",
        arabic: "أَذْهِبِ الْبَأْسَ رَبَّ النَّاسِ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
        transliteration: "Adh-hibil-ba'sa rabban-nas, ishfi anta ash-shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama",
        translation_id: "Hilangkanlah penyakit wahai Tuhan manusia, sembuhkanlah karena Engkaulah Yang Maha Menyembuhkan, tidak ada kesembuhan kecuali kesembuhan dari-Mu, kesembuhan yang tidak meninggalkan penyakit.",
        translation_en: "Remove the suffering, O Lord of mankind. Heal, for You are the Healer. There is no healing except Your healing, a healing that leaves no illness.",
        source: "HR. Bukhari",
      },
    ],
  },
  {
    id: "rezeki",
    title_id: "Doa Rezeki & Keberkahan",
    title_en: "Sustenance & Blessing Duas",
    icon: "🌿",
    duas: [
      {
        id: "rezeki-1",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
        transliteration: "Allahumma inni as'aluka 'ilman nafi'an wa rizqan tayyiban wa 'amalan mutaqabbala",
        translation_id: "Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
        translation_en: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
        source: "HR. Ibn Majah",
      },
      {
        id: "rezeki-2",
        arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
        transliteration: "Allahummak-fini bihalaalika 'an haraamika wa aghnini bifadlika 'amman siwak",
        translation_id: "Ya Allah, cukupkanlah aku dengan yang halal dari-Mu dan jauhkanlah aku dari yang haram, dan kayakanlah aku dengan karunia-Mu dari selain-Mu.",
        translation_en: "O Allah, suffice me with what You have made lawful, away from what You have made unlawful, and make me independent of all those besides You.",
        source: "HR. Tirmidzi",
      },
    ],
  },
];


// =============================================================
// Dzikir Data
// =============================================================

export type Dzikir = {
  id: string;
  arabic: string;
  transliteration: string;
  translation_id: string;
  translation_en: string;
  count: number; // recommended repetitions
  source: string;
  virtue: string; // keutamaan
};

export type DzikirCategory = {
  id: string;
  title_id: string;
  title_en: string;
  icon: string;
  dzikirList: Dzikir[];
};

export const DZIKIR_CATEGORIES: DzikirCategory[] = [
  {
    id: "tasbih",
    title_id: "Tasbih, Tahmid & Takbir",
    title_en: "Glorification",
    icon: "📿",
    dzikirList: [
      {
        id: "subhanallah",
        arabic: "سُبْحَانَ اللَّهِ",
        transliteration: "Subhanallah",
        translation_id: "Maha Suci Allah",
        translation_en: "Glory be to Allah",
        count: 33,
        source: "HR. Muslim",
        virtue: "Barangsiapa membaca ini 33 kali setelah sholat, dosanya diampuni meski sebanyak buih di lautan.",
      },
      {
        id: "alhamdulillah",
        arabic: "الْحَمْدُ لِلَّهِ",
        transliteration: "Alhamdulillah",
        translation_id: "Segala puji bagi Allah",
        translation_en: "All praise is due to Allah",
        count: 33,
        source: "HR. Muslim",
        virtue: "Alhamdulillah memenuhi timbangan amal kebaikan.",
      },
      {
        id: "allahuakbar",
        arabic: "اللَّهُ أَكْبَرُ",
        transliteration: "Allahu Akbar",
        translation_id: "Allah Maha Besar",
        translation_en: "Allah is the Greatest",
        count: 34,
        source: "HR. Muslim",
        virtue: "Membaca ini 34 kali melengkapi 100 dzikir setelah sholat.",
      },
      {
        id: "lailahaillallah",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
        transliteration: "La ilaha illallah",
        translation_id: "Tiada tuhan selain Allah",
        translation_en: "There is no god but Allah",
        count: 100,
        source: "HR. Bukhari & Muslim",
        virtue: "Barangsiapa mengucapkannya 100 kali, baginya pahala memerdekakan 10 budak dan ditulis 100 kebaikan.",
      },
      {
        id: "subhanallah-wabihamdi",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "Subhanallahi wa bihamdih",
        translation_id: "Maha Suci Allah dan segala puji bagi-Nya",
        translation_en: "Glory be to Allah and praise be to Him",
        count: 100,
        source: "HR. Bukhari & Muslim",
        virtue: "Barangsiapa mengucapkannya 100 kali, dihapus dosanya meski sebanyak buih di lautan.",
      },
      {
        id: "subhanallah-wabihamdi-azim",
        arabic: "سُبْحَانَ اللَّهِ الْعَظِيمِ",
        transliteration: "Subhanallahil 'Adzim",
        translation_id: "Maha Suci Allah Yang Maha Agung",
        translation_en: "Glory be to Allah the Magnificent",
        count: 33,
        source: "HR. Bukhari",
        virtue: "Dua kalimat yang ringan di lisan, berat di timbangan, dicintai oleh Ar-Rahman.",
      },
    ],
  },
  {
    id: "sholat",
    title_id: "Dzikir Setelah Sholat",
    title_en: "Post-Prayer Remembrance",
    icon: "🕌",
    dzikirList: [
      {
        id: "istighfar-sholat",
        arabic: "أَسْتَغْفِرُ اللَّهَ",
        transliteration: "Astaghfirullah",
        translation_id: "Aku memohon ampun kepada Allah",
        translation_en: "I seek forgiveness from Allah",
        count: 3,
        source: "HR. Muslim",
        virtue: "Dibaca 3 kali setelah salam dari sholat.",
      },
      {
        id: "allahumma-antassalam",
        arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        transliteration: "Allahumma antassalam wa minkassalam tabarakta ya dzaljalali wal-ikram",
        translation_id: "Ya Allah, Engkau adalah As-Salam (Yang Maha Sejahtera), dari-Mu lah kesejahteraan, Maha Berkah Engkau wahai Dzat Yang Maha Agung dan Mulia.",
        translation_en: "O Allah, You are As-Salam, and from You is peace. Blessed are You, O Possessor of majesty and honor.",
        count: 1,
        source: "HR. Muslim",
        virtue: "Dibaca sekali setelah membaca istighfar 3 kali.",
      },
      {
        id: "ayat-kursi",
        arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
        transliteration: "Allahu la ilaha illa huwal hayyul qayyum, la ta'khudhuhu sinatun wa la nawm...",
        translation_id: "Allah, tidak ada tuhan selain Dia, Yang Maha Hidup, Yang terus menerus mengurus makhluk-Nya, tidak mengantuk dan tidak tidur...",
        translation_en: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep...",
        count: 1,
        source: "QS. Al-Baqarah: 255",
        virtue: "Barangsiapa membaca Ayat Kursi setelah setiap sholat wajib, tidak ada yang menghalanginya masuk surga kecuali kematian.",
      },
      {
        id: "tasbih-tahmid-takbir",
        arabic: "سُبْحَانَ اللَّهِ ٣٣ × الْحَمْدُ لِلَّهِ ٣٣ × اللَّهُ أَكْبَرُ ٣٤ ×",
        transliteration: "Subhanallah 33x, Alhamdulillah 33x, Allahu Akbar 34x",
        translation_id: "Maha Suci Allah 33x, Segala puji bagi Allah 33x, Allah Maha Besar 34x",
        translation_en: "Glory be to Allah 33x, All praise to Allah 33x, Allah is Greatest 34x",
        count: 100,
        source: "HR. Muslim",
        virtue: "Barangsiapa membaca ini setelah setiap sholat, dosanya diampuni meski sebanyak buih di lautan.",
      },
    ],
  },
  {
    id: "perlindungan",
    title_id: "Dzikir Perlindungan",
    title_en: "Protection Remembrance",
    icon: "🛡️",
    dzikirList: [
      {
        id: "muawwidzatain",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillahil-ladzi la yadurru ma'asmihi syai'un fil ardzi wa la fis-sama'i wa huwas-sami'ul 'alim",
        translation_id: "Dengan nama Allah yang tidak ada sesuatu pun yang membahayakan bersama nama-Nya, baik di bumi maupun di langit. Dan Dia Maha Mendengar lagi Maha Mengetahui.",
        translation_en: "In the name of Allah with Whose name nothing can cause harm on earth or in heaven, and He is the All-Hearing, All-Knowing.",
        count: 3,
        source: "HR. Abu Dawud & Tirmidzi",
        virtue: "Dibaca 3 kali di pagi dan petang, tidak akan ada yang membahayakannya.",
      },
      {
        id: "hasbiyallah",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul 'arshil 'adzim",
        translation_id: "Cukuplah Allah bagiku, tidak ada tuhan selain Dia. Hanya kepada-Nya aku bertawakal, dan Dia adalah Tuhan yang memiliki 'Arsy yang agung.",
        translation_en: "Allah is sufficient for me. There is no god but He. In Him I put my trust, and He is the Lord of the Mighty Throne.",
        count: 7,
        source: "HR. Abu Dawud",
        virtue: "Dibaca 7 kali di pagi dan petang, Allah akan mencukupi segala urusannya.",
      },
      {
        id: "falaq-nas",
        arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        transliteration: "Qul a'udzu birabbil falaq... Qul a'udzu birabbin nas",
        translation_id: "Al-Falaq dan An-Nas (surah pelindung)",
        translation_en: "Al-Falaq and An-Nas (the protective surahs)",
        count: 3,
        source: "HR. Abu Dawud & Tirmidzi",
        virtue: "Dibaca 3 kali di pagi dan petang mencukupi dari segala sesuatu.",
      },
    ],
  },
  {
    id: "wirid",
    title_id: "Wirid Harian",
    title_en: "Daily Wird",
    icon: "🌿",
    dzikirList: [
      {
        id: "sayyidul-istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
        transliteration: "Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana 'abduka wa ana 'ala 'ahdika wa wa'dika mastata't...",
        translation_id: "Ya Allah, Engkau adalah Tuhanku, tidak ada tuhan selain Engkau. Engkau yang menciptakanku dan aku adalah hamba-Mu. Aku berada di atas perjanjian dan janji-Mu semampuku...",
        translation_en: "O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, and I am faithful to my covenant and my promise to You as much as I can...",
        count: 1,
        source: "HR. Bukhari",
        virtue: "Sayyidul Istighfar — penghulu istighfar. Barangsiapa membacanya di pagi hari dengan yakin dan meninggal sebelum sore, maka ia termasuk ahli surga.",
      },
      {
        id: "sholawat",
        arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
        transliteration: "Allahumma shalli 'ala Muhammad wa 'ala ali Muhammad",
        translation_id: "Ya Allah, limpahkanlah shalawat kepada Muhammad dan keluarga Muhammad.",
        translation_en: "O Allah, send blessings upon Muhammad and the family of Muhammad.",
        count: 10,
        source: "HR. Muslim",
        virtue: "Barangsiapa bershalawat kepadaku satu kali, Allah akan bershalawat kepadanya sepuluh kali.",
      },
      {
        id: "hauqalah",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "La hawla wa la quwwata illa billah",
        translation_id: "Tidak ada daya dan kekuatan kecuali dengan Allah",
        translation_en: "There is no power and no strength except with Allah",
        count: 100,
        source: "HR. Bukhari & Muslim",
        virtue: "Ini adalah simpanan dari simpanan-simpanan surga.",
      },
    ],
  },
];


// =============================================================
// Asmaul Husna — 99 Names of Allah
// =============================================================

export type AsmaulHusna = {
  number: number;
  arabic: string;
  transliteration: string;
  meaning_id: string;
  meaning_en: string;
};

export const ASMAUL_HUSNA: AsmaulHusna[] = [
  { number: 1, arabic: "اللَّهُ", transliteration: "Allah", meaning_id: "Nama yang mencakup semua sifat kesempurnaan", meaning_en: "The Name encompassing all attributes of perfection" },
  { number: 2, arabic: "الرَّحْمَنُ", transliteration: "Ar-Rahman", meaning_id: "Yang Maha Pengasih", meaning_en: "The Most Gracious" },
  { number: 3, arabic: "الرَّحِيمُ", transliteration: "Ar-Rahim", meaning_id: "Yang Maha Penyayang", meaning_en: "The Most Merciful" },
  { number: 4, arabic: "الْمَلِكُ", transliteration: "Al-Malik", meaning_id: "Yang Maha Merajai", meaning_en: "The King" },
  { number: 5, arabic: "الْقُدُّوسُ", transliteration: "Al-Quddus", meaning_id: "Yang Maha Suci", meaning_en: "The Most Holy" },
  { number: 6, arabic: "السَّلَامُ", transliteration: "As-Salam", meaning_id: "Yang Maha Memberi Kesejahteraan", meaning_en: "The Source of Peace" },
  { number: 7, arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning_id: "Yang Maha Memberi Keamanan", meaning_en: "The Granter of Security" },
  { number: 8, arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaning_id: "Yang Maha Mengawasi", meaning_en: "The Guardian" },
  { number: 9, arabic: "الْعَزِيزُ", transliteration: "Al-Aziz", meaning_id: "Yang Maha Perkasa", meaning_en: "The Almighty" },
  { number: 10, arabic: "الْجَبَّارُ", transliteration: "Al-Jabbar", meaning_id: "Yang Memiliki Mutlak Kekuatan", meaning_en: "The Compeller" },
  { number: 11, arabic: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaning_id: "Yang Maha Megah", meaning_en: "The Supreme" },
  { number: 12, arabic: "الْخَالِقُ", transliteration: "Al-Khaliq", meaning_id: "Yang Maha Pencipta", meaning_en: "The Creator" },
  { number: 13, arabic: "الْبَارِئُ", transliteration: "Al-Bari'", meaning_id: "Yang Maha Mengadakan", meaning_en: "The Originator" },
  { number: 14, arabic: "الْمُصَوِّرُ", transliteration: "Al-Musawwir", meaning_id: "Yang Maha Membentuk Rupa", meaning_en: "The Shaper of Beauty" },
  { number: 15, arabic: "الْغَفَّارُ", transliteration: "Al-Ghaffar", meaning_id: "Yang Maha Pengampun", meaning_en: "The Forgiving" },
  { number: 16, arabic: "الْقَهَّارُ", transliteration: "Al-Qahhar", meaning_id: "Yang Maha Menundukkan", meaning_en: "The Subduer" },
  { number: 17, arabic: "الْوَهَّابُ", transliteration: "Al-Wahhab", meaning_id: "Yang Maha Pemberi Karunia", meaning_en: "The Bestower" },
  { number: 18, arabic: "الرَّزَّاقُ", transliteration: "Ar-Razzaq", meaning_id: "Yang Maha Pemberi Rezeki", meaning_en: "The Provider" },
  { number: 19, arabic: "الْفَتَّاحُ", transliteration: "Al-Fattah", meaning_id: "Yang Maha Pembuka Rahmat", meaning_en: "The Opener" },
  { number: 20, arabic: "الْعَلِيمُ", transliteration: "Al-'Alim", meaning_id: "Yang Maha Mengetahui", meaning_en: "The All-Knowing" },
  { number: 21, arabic: "الْقَابِضُ", transliteration: "Al-Qabidh", meaning_id: "Yang Maha Menyempitkan", meaning_en: "The Restrainer" },
  { number: 22, arabic: "الْبَاسِطُ", transliteration: "Al-Basith", meaning_id: "Yang Maha Melapangkan", meaning_en: "The Extender" },
  { number: 23, arabic: "الْخَافِضُ", transliteration: "Al-Khafidh", meaning_id: "Yang Maha Merendahkan", meaning_en: "The Abaser" },
  { number: 24, arabic: "الرَّافِعُ", transliteration: "Ar-Rafi'", meaning_id: "Yang Maha Meninggikan", meaning_en: "The Exalter" },
  { number: 25, arabic: "الْمُعِزُّ", transliteration: "Al-Mu'izz", meaning_id: "Yang Maha Memuliakan", meaning_en: "The Honorer" },
  { number: 26, arabic: "الْمُذِلُّ", transliteration: "Al-Mudhil", meaning_id: "Yang Maha Menghinakan", meaning_en: "The Dishonourer" },
  { number: 27, arabic: "السَّمِيعُ", transliteration: "As-Sami'", meaning_id: "Yang Maha Mendengar", meaning_en: "The All-Hearing" },
  { number: 28, arabic: "الْبَصِيرُ", transliteration: "Al-Basir", meaning_id: "Yang Maha Melihat", meaning_en: "The All-Seeing" },
  { number: 29, arabic: "الْحَكَمُ", transliteration: "Al-Hakam", meaning_id: "Yang Maha Menetapkan", meaning_en: "The Judge" },
  { number: 30, arabic: "الْعَدْلُ", transliteration: "Al-'Adl", meaning_id: "Yang Maha Adil", meaning_en: "The Just" },
  { number: 31, arabic: "اللَّطِيفُ", transliteration: "Al-Latif", meaning_id: "Yang Maha Lembut", meaning_en: "The Subtle One" },
  { number: 32, arabic: "الْخَبِيرُ", transliteration: "Al-Khabir", meaning_id: "Yang Maha Mengenal", meaning_en: "The All-Aware" },
  { number: 33, arabic: "الْحَلِيمُ", transliteration: "Al-Halim", meaning_id: "Yang Maha Penyantun", meaning_en: "The Forbearing" },
  { number: 34, arabic: "الْعَظِيمُ", transliteration: "Al-'Azim", meaning_id: "Yang Maha Agung", meaning_en: "The Magnificent" },
  { number: 35, arabic: "الْغَفُورُ", transliteration: "Al-Ghafur", meaning_id: "Yang Maha Pengampun", meaning_en: "The Forgiving" },
  { number: 36, arabic: "الشَّكُورُ", transliteration: "Ash-Shakur", meaning_id: "Yang Maha Mensyukuri", meaning_en: "The Appreciative" },
  { number: 37, arabic: "الْعَلِيُّ", transliteration: "Al-'Ali", meaning_id: "Yang Maha Tinggi", meaning_en: "The Most High" },
  { number: 38, arabic: "الْكَبِيرُ", transliteration: "Al-Kabir", meaning_id: "Yang Maha Besar", meaning_en: "The Most Great" },
  { number: 39, arabic: "الْحَفِيظُ", transliteration: "Al-Hafiz", meaning_id: "Yang Maha Memelihara", meaning_en: "The Preserver" },
  { number: 40, arabic: "الْمُقِيتُ", transliteration: "Al-Muqit", meaning_id: "Yang Maha Pemberi Kecukupan", meaning_en: "The Nourisher" },
  { number: 41, arabic: "الْحَسِيبُ", transliteration: "Al-Hasib", meaning_id: "Yang Maha Membuat Perhitungan", meaning_en: "The Reckoner" },
  { number: 42, arabic: "الْجَلِيلُ", transliteration: "Al-Jalil", meaning_id: "Yang Maha Luhur", meaning_en: "The Majestic" },
  { number: 43, arabic: "الْكَرِيمُ", transliteration: "Al-Karim", meaning_id: "Yang Maha Mulia", meaning_en: "The Generous" },
  { number: 44, arabic: "الرَّقِيبُ", transliteration: "Ar-Raqib", meaning_id: "Yang Maha Mengawasi", meaning_en: "The Watchful" },
  { number: 45, arabic: "الْمُجِيبُ", transliteration: "Al-Mujib", meaning_id: "Yang Maha Mengabulkan", meaning_en: "The Responsive" },
  { number: 46, arabic: "الْوَاسِعُ", transliteration: "Al-Wasi'", meaning_id: "Yang Maha Luas", meaning_en: "The All-Encompassing" },
  { number: 47, arabic: "الْحَكِيمُ", transliteration: "Al-Hakim", meaning_id: "Yang Maha Bijaksana", meaning_en: "The Perfectly Wise" },
  { number: 48, arabic: "الْوَدُودُ", transliteration: "Al-Wadud", meaning_id: "Yang Maha Mencintai", meaning_en: "The Loving" },
  { number: 49, arabic: "الْمَجِيدُ", transliteration: "Al-Majid", meaning_id: "Yang Maha Mulia", meaning_en: "The Glorious" },
  { number: 50, arabic: "الْبَاعِثُ", transliteration: "Al-Ba'ith", meaning_id: "Yang Maha Membangkitkan", meaning_en: "The Resurrector" },
  { number: 51, arabic: "الشَّهِيدُ", transliteration: "Ash-Shahid", meaning_id: "Yang Maha Menyaksikan", meaning_en: "The Witness" },
  { number: 52, arabic: "الْحَقُّ", transliteration: "Al-Haqq", meaning_id: "Yang Maha Benar", meaning_en: "The Truth" },
  { number: 53, arabic: "الْوَكِيلُ", transliteration: "Al-Wakil", meaning_id: "Yang Maha Memelihara", meaning_en: "The Trustee" },
  { number: 54, arabic: "الْقَوِيُّ", transliteration: "Al-Qawi", meaning_id: "Yang Maha Kuat", meaning_en: "The All-Strong" },
  { number: 55, arabic: "الْمَتِينُ", transliteration: "Al-Matin", meaning_id: "Yang Maha Kokoh", meaning_en: "The Firm" },
  { number: 56, arabic: "الْوَلِيُّ", transliteration: "Al-Wali", meaning_id: "Yang Maha Melindungi", meaning_en: "The Protecting Friend" },
  { number: 57, arabic: "الْحَمِيدُ", transliteration: "Al-Hamid", meaning_id: "Yang Maha Terpuji", meaning_en: "The Praiseworthy" },
  { number: 58, arabic: "الْمُحْصِي", transliteration: "Al-Muhsi", meaning_id: "Yang Maha Menghitung", meaning_en: "The Counter" },
  { number: 59, arabic: "الْمُبْدِئُ", transliteration: "Al-Mubdi'", meaning_id: "Yang Maha Memulai", meaning_en: "The Originator" },
  { number: 60, arabic: "الْمُعِيدُ", transliteration: "Al-Mu'id", meaning_id: "Yang Maha Mengembalikan Kehidupan", meaning_en: "The Restorer" },
  { number: 61, arabic: "الْمُحْيِي", transliteration: "Al-Muhyi", meaning_id: "Yang Maha Menghidupkan", meaning_en: "The Giver of Life" },
  { number: 62, arabic: "الْمُمِيتُ", transliteration: "Al-Mumit", meaning_id: "Yang Maha Mematikan", meaning_en: "The Taker of Life" },
  { number: 63, arabic: "الْحَيُّ", transliteration: "Al-Hayy", meaning_id: "Yang Maha Hidup", meaning_en: "The Ever-Living" },
  { number: 64, arabic: "الْقَيُّومُ", transliteration: "Al-Qayyum", meaning_id: "Yang Maha Berdiri Sendiri", meaning_en: "The Self-Existing" },
  { number: 65, arabic: "الْوَاجِدُ", transliteration: "Al-Wajid", meaning_id: "Yang Maha Penemu", meaning_en: "The Finder" },
  { number: 66, arabic: "الْمَاجِدُ", transliteration: "Al-Majid", meaning_id: "Yang Maha Mulia", meaning_en: "The Noble" },
  { number: 67, arabic: "الْوَاحِدُ", transliteration: "Al-Wahid", meaning_id: "Yang Maha Tunggal", meaning_en: "The One" },
  { number: 68, arabic: "الأَحَدُ", transliteration: "Al-Ahad", meaning_id: "Yang Maha Esa", meaning_en: "The Unique" },
  { number: 69, arabic: "الصَّمَدُ", transliteration: "As-Samad", meaning_id: "Yang Maha Dibutuhkan", meaning_en: "The Eternal" },
  { number: 70, arabic: "الْقَادِرُ", transliteration: "Al-Qadir", meaning_id: "Yang Maha Menentukan", meaning_en: "The All-Powerful" },
  { number: 71, arabic: "الْمُقْتَدِرُ", transliteration: "Al-Muqtadir", meaning_id: "Yang Maha Berkuasa", meaning_en: "The Powerful" },
  { number: 72, arabic: "الْمُقَدِّمُ", transliteration: "Al-Muqaddim", meaning_id: "Yang Maha Mendahulukan", meaning_en: "The Expediter" },
  { number: 73, arabic: "الْمُؤَخِّرُ", transliteration: "Al-Mu'akhkhir", meaning_id: "Yang Maha Mengakhirkan", meaning_en: "The Delayer" },
  { number: 74, arabic: "الأَوَّلُ", transliteration: "Al-Awwal", meaning_id: "Yang Maha Awal", meaning_en: "The First" },
  { number: 75, arabic: "الآخِرُ", transliteration: "Al-Akhir", meaning_id: "Yang Maha Akhir", meaning_en: "The Last" },
  { number: 76, arabic: "الظَّاهِرُ", transliteration: "Az-Zahir", meaning_id: "Yang Maha Nyata", meaning_en: "The Manifest" },
  { number: 77, arabic: "الْبَاطِنُ", transliteration: "Al-Batin", meaning_id: "Yang Maha Ghaib", meaning_en: "The Hidden" },
  { number: 78, arabic: "الْوَالِي", transliteration: "Al-Wali", meaning_id: "Yang Maha Memerintah", meaning_en: "The Governor" },
  { number: 79, arabic: "الْمُتَعَالِي", transliteration: "Al-Muta'ali", meaning_id: "Yang Maha Tinggi", meaning_en: "The Self Exalted" },
  { number: 80, arabic: "الْبَرُّ", transliteration: "Al-Barr", meaning_id: "Yang Maha Dermawan", meaning_en: "The Source of All Goodness" },
  { number: 81, arabic: "التَّوَّابُ", transliteration: "At-Tawwab", meaning_id: "Yang Maha Penerima Taubat", meaning_en: "The Ever-Returning" },
  { number: 82, arabic: "الْمُنْتَقِمُ", transliteration: "Al-Muntaqim", meaning_id: "Yang Maha Pemberi Balasan", meaning_en: "The Avenger" },
  { number: 83, arabic: "الْعَفُوُّ", transliteration: "Al-'Afuw", meaning_id: "Yang Maha Pemaaf", meaning_en: "The Pardoner" },
  { number: 84, arabic: "الرَّؤُوفُ", transliteration: "Ar-Ra'uf", meaning_id: "Yang Maha Pengasih", meaning_en: "The Compassionate" },
  { number: 85, arabic: "مَالِكُ الْمُلْكِ", transliteration: "Malik-ul-Mulk", meaning_id: "Yang Maha Memiliki Kerajaan", meaning_en: "The Owner of All Sovereignty" },
  { number: 86, arabic: "ذُوالْجَلاَلِ وَالإكْرَامِ", transliteration: "Dhul-Jalali-wal-Ikram", meaning_id: "Yang Maha Pemilik Keagungan dan Kemuliaan", meaning_en: "The Lord of Majesty and Bounty" },
  { number: 87, arabic: "الْمُقْسِطُ", transliteration: "Al-Muqsit", meaning_id: "Yang Maha Adil", meaning_en: "The Equitable" },
  { number: 88, arabic: "الْجَامِعُ", transliteration: "Al-Jami'", meaning_id: "Yang Maha Mengumpulkan", meaning_en: "The Gatherer" },
  { number: 89, arabic: "الْغَنِيُّ", transliteration: "Al-Ghani", meaning_id: "Yang Maha Kaya", meaning_en: "The Rich One" },
  { number: 90, arabic: "الْمُغْنِي", transliteration: "Al-Mughni", meaning_id: "Yang Maha Pemberi Kekayaan", meaning_en: "The Enricher" },
  { number: 91, arabic: "الْمَانِعُ", transliteration: "Al-Mani'", meaning_id: "Yang Maha Mencegah", meaning_en: "The Preventer" },
  { number: 92, arabic: "الضَّارُّ", transliteration: "Ad-Darr", meaning_id: "Yang Maha Pemberi Derita", meaning_en: "The Distresser" },
  { number: 93, arabic: "النَّافِعُ", transliteration: "An-Nafi'", meaning_id: "Yang Maha Memberi Manfaat", meaning_en: "The Propitious" },
  { number: 94, arabic: "النُّورُ", transliteration: "An-Nur", meaning_id: "Yang Maha Bercahaya", meaning_en: "The Light" },
  { number: 95, arabic: "الْهَادِي", transliteration: "Al-Hadi", meaning_id: "Yang Maha Pemberi Petunjuk", meaning_en: "The Guide" },
  { number: 96, arabic: "الْبَدِيعُ", transliteration: "Al-Badi'", meaning_id: "Yang Maha Pencipta Tanpa Contoh", meaning_en: "The Incomparable" },
  { number: 97, arabic: "الْبَاقِي", transliteration: "Al-Baqi", meaning_id: "Yang Maha Kekal", meaning_en: "The Everlasting" },
  { number: 98, arabic: "الْوَارِثُ", transliteration: "Al-Warith", meaning_id: "Yang Maha Pewaris", meaning_en: "The Inheritor" },
  { number: 99, arabic: "الرَّشِيدُ", transliteration: "Ar-Rashid", meaning_id: "Yang Maha Pandai", meaning_en: "The Guide to the Right Path" },
];
