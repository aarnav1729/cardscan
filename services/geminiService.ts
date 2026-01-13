// src/services/geminiService.ts
import type { BusinessCard } from "../types";

type Extracted = Omit<BusinessCard, "id" | "imageUrl" | "createdAt">;

declare global {
  interface Window {
    puter?: any;
  }
}

const PUTER_SRC = "https://js.puter.com/v2/";
const MODEL = "gemini-3-flash-preview"; // per Puter docs/tutorial :contentReference[oaicite:4]{index=4}

let puterLoadPromise: Promise<any> | null = null;

export async function ensurePuterLoaded(): Promise<any> {
  if (typeof window === "undefined")
    throw new Error("Puter can only load in the browser.");

  // already ready
  if (window.puter?.ai?.chat) return window.puter;

  if (puterLoadPromise) return puterLoadPromise;

  puterLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${PUTER_SRC}"]`
    ) as HTMLScriptElement | null;

    const finish = () => {
      if (window.puter?.ai?.chat) resolve(window.puter);
      else
        reject(new Error("Puter loaded but puter.ai.chat is not available."));
    };

    if (existing) {
      // If it already exists, it might already be loaded
      if (window.puter?.ai?.chat) return resolve(window.puter);
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Puter.js")),
        { once: true }
      );
      return;
    }

    const s = document.createElement("script");
    s.src = PUTER_SRC; // script tag recommended by Puter docs :contentReference[oaicite:5]{index=5}
    s.async = true;
    s.onload = finish;
    s.onerror = () => reject(new Error("Failed to load Puter.js"));
    document.head.appendChild(s);
  });

  return puterLoadPromise;
}

function dataUrlToFile(dataUrl: string, filename = "card.jpg"): File {
  const [meta, b64] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(meta)?.[1] || "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

function safeParseJson(text: string): any {
  const t = String(text || "").trim();

  // strip ```json fences if model adds them
  const unfenced = t
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  // try to isolate a JSON object
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  const maybeJson =
    start >= 0 && end > start ? unfenced.slice(start, end + 1) : unfenced;

  return JSON.parse(maybeJson);
}

function sanitize(obj: any): Extracted {
  const o = obj || {};
  const s = (v: any) => (typeof v === "string" ? v.trim() : "");
  return {
    name: s(o.name),
    companyName: s(o.companyName),
    jobTitle: s(o.jobTitle),
    phone: s(o.phone),
    email: s(o.email),
    website: s(o.website),
    address: s(o.address),
  };
}

export async function extractCardData(
  imageUrlOrDataUrl: string
): Promise<Extracted> {
  const puter = await ensurePuterLoaded();

  // If you pass a data URL (your app does), convert to File to match Puter’s supported inputs (String | File) :contentReference[oaicite:6]{index=6}
  const imageInput =
    typeof imageUrlOrDataUrl === "string" &&
    imageUrlOrDataUrl.startsWith("data:")
      ? dataUrlToFile(imageUrlOrDataUrl)
      : imageUrlOrDataUrl;

  const prompt = `
Extract the business card into STRICT JSON ONLY (no markdown).
Keys:
name, companyName, jobTitle, phone, email, website, address
Rules:
- If a field is missing, use "" (empty string)
- Return one JSON object only
`.trim();

  const resp = await puter.ai.chat(prompt, imageInput, { model: MODEL });

  // Puter ChatResponse content is in message.content :contentReference[oaicite:7]{index=7}
  const content =
    typeof resp === "string"
      ? resp
      : resp?.message?.content ?? resp?.text ?? "";

  const parsed = safeParseJson(content);
  return sanitize(parsed);
}
