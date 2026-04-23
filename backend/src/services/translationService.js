const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";
const SUPPORTED_LANGS = ["uk", "en", "es"];
const DEEPL_TARGET = { uk: "UK", en: "EN-US", es: "ES" };

// Словник для заміни проблемних слів перед перекладом
const GEOGRAPHIC_FIXES = {
  // Країни в різних мовах → нейтральний англійський варіант
  "Испания": "Spain",
  "Іспанія": "Spain",
  "España": "Spain",
  "Украина": "Ukraine",
  "Україна": "Ukraine",
  "Ucrania": "Ukraine",
  // Міста
  "Валенсія": "Valencia",
  "Валенсия": "Valencia",
  // Можна додавати інші проблемні географічні назви
};

// Словник для постобробки результатів
const POST_PROCESS_FIXES = {
  uk: {
    "Spain": "Іспанія",
    "Испания": "Іспанія",
    "España": "Іспанія",
    "Ukraine": "Україна",
    "Valencia": "Валенсія",
  },
  en: {
    "Испания": "Spain",
    "Україна": "Ukraine",
    "Іспанія": "Spain",
    "España": "Spain",
  },
  es: {
    "Spain": "España",
    "Испания": "España",
    "Іспанія": "España",
    "Ukraine": "Ucrania",
  }
};

function preprocessText(text) {
  let processed = text;
  // Заміна географічних назв на нейтральні англійські
  for (const [original, neutral] of Object.entries(GEOGRAPHIC_FIXES)) {
    processed = processed.replace(new RegExp(original, 'gi'), neutral);
  }
  return processed;
}

function postProcessText(text, targetLang) {
  let processed = text;
  const fixes = POST_PROCESS_FIXES[targetLang] || {};

  for (const [original, fixed] of Object.entries(fixes)) {
    processed = processed.replace(new RegExp(original, 'gi'), fixed);
  }
  return processed;
}

async function translateText(text, targetLang) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!text) return "";
  if (!apiKey) {
    console.warn(
      `[translationService] DEEPL_API_KEY not set — skipping translation to ${targetLang}, returning source text`,
    );
    return text;
  }

  // Попередня обробка тексту
  const preprocessed = preprocessText(text);

  const response = await fetch(DEEPL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [preprocessed],
      target_lang: targetLang,
    }),
  });

  if (!response.ok) {
    console.error(`DeepL error ${response.status} for lang ${targetLang}`);
    return text; // fallback to original
  }

  const data = await response.json();
  const translated = data.translations[0].text;

  // Постобробка результату
  return postProcessText(translated, targetLang.toLowerCase().split('-')[0]);
}

function containsMixedLanguages(text) {
  // Перевіряє чи містить текст змішані мови (латиниця + кирилиця + географічні назви)
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasCyrillic = /[а-яё]/i.test(text);
  const hasProblematicTerms = Object.keys(GEOGRAPHIC_FIXES).some(term =>
    text.toLowerCase().includes(term.toLowerCase())
  );

  return (hasLatin && hasCyrillic) || hasProblematicTerms;
}

/**
 * Translates text to all supported languages, skipping those already provided.
 *
 * Accepts either:
 *   - a plain string (treated as source, all 3 langs translated)
 *   - an object { uk?, en?, es? } (only missing langs are translated)
 *
 * @param {string | { uk?: string, en?: string, es?: string }} input
 * @returns {Promise<{ uk: string, en: string, es: string }>}
 */
export async function translateToAllLanguages(input) {
  if (!input) return { uk: "", en: "", es: "" };

  // Normalize to object
  const existing = typeof input === "string"
    ? { uk: input }
    : { ...input };

  // If all 3 languages are already provided — skip translation entirely
  if (SUPPORTED_LANGS.every((lang) => existing[lang])) {
    return { uk: existing.uk, en: existing.en, es: existing.es };
  }

  // Pick source text: first available language
  const sourceText = existing.uk || existing.en || existing.es;
  if (!sourceText) return { uk: "", en: "", es: "" };

  // Determine which languages need translation
  let missingLangs = SUPPORTED_LANGS.filter((lang) => !existing[lang]);

  // Special case: if the "Ukrainian" text contains mixed languages,
  // force translation of Ukrainian as well
  if (existing.uk && containsMixedLanguages(existing.uk)) {
    missingLangs.push("uk");
  }

  // Remove duplicates
  missingLangs = [...new Set(missingLangs)];

  if (missingLangs.length === 0) {
    return { uk: existing.uk, en: existing.en, es: existing.es };
  }

  // Translate missing languages in parallel
  const translations = await Promise.all(
    missingLangs.map((lang) => translateText(sourceText, DEEPL_TARGET[lang])),
  );

  missingLangs.forEach((lang, i) => {
    existing[lang] = translations[i];
  });

  return { uk: existing.uk, en: existing.en, es: existing.es };
}
