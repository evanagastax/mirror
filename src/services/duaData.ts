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
