const getEnvApiKey = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
    return "";
  } catch (e) {
    return "";
  }
};

const apiKey = getEnvApiKey();

export const callGeminiAPI = async (history, prompt, systemInstruction = null) => {
  if (!apiKey || apiKey.trim() === "") return "FEIL: API-nøkkel mangler i Vercel-innstillingene.";

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let errorMessages = [];

  const formattedHistory = history.slice(1).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));
  formattedHistory.push({ role: "user", parts: [{ text: prompt }] });

  for (const model of modelsToTry) {
    try {
      const payload = {
        contents: formattedHistory,
        tools: [{ googleSearch: {} }]
      };

      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Rakel mumler noe uforståelig...";
      } else {
        const errData = await response.json().catch(() => ({}));
        const googleError = errData?.error?.message || response.statusText;

        if (googleError.includes("limit: 0")) {
          return "FEIL: Google gir deg fremdeles 0 i kvote. Sjekk at kortet/faktureringen er knyttet til riktig prosjekt i Google Cloud, og at API-nøkkelen er oppdatert!";
        }
        if (response.status === 400 && googleError.includes("API key not valid")) {
          return "FEIL 400: API-nøkkelen din er ugyldig. Sjekk at du kopierte hele nøkkelen uten mellomrom.";
        }

        errorMessages.push(`[${model}: ${response.status} ${googleError}]`);
        continue;
      }
    } catch (error) {
      errorMessages.push(`[${model}: Nettverksfeil - ${error.message}]`);
    }
  }

  return `Orakelet feilet på alle forsøk.\n\nDetaljer:\n${errorMessages.join("\n")}`;
};
