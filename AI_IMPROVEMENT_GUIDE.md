# 🧠 AI Improvement Roadmap

This living document lists **concrete, incremental steps** you can take to push the AI-driven parsing layer to production-grade accuracy while keeping token-cost and engineering effort under control.

---
## 0. Current Baseline (v1)
* Prompt-engineering only (one-shot)
* Regex post-cleaning
* ~75 % field-level accuracy
* Validation errors on empty `email`, numeric conversion, etc.

---
## 1. Quick Wins (≤ 1 day each)
| # | Task | Why it helps | Files to touch |
|---|------|--------------|----------------|
| 1 | **Structured Output / Function-Calling** | Model returns strictly typed JSON → kills 90 % of parsing errors. | `services/aiProcessor.js` |
| 2 | **Few-shot prompt** (3-5 curated examples) | Reduces hallucinations & missing fields. | same |
| 3 | **Post-AI heuristics** for price, BHK, email | Catch residual edge-cases, keep pipeline robust if AI slips. | `aiProcessor.clean*()` helpers |
| 4 | **Graceful model fallback** (`gpt-4o → gpt-3.5`) | Zero downtime if premium model quota exhausted. | `aiProcessor.processPropertyData()` |
| 5 | **Hash-based cache** (`redis` / Mongo TTL) | Saves tokens on identical listings. | new `services/aiCache.js` |

---
## 2. Mid-Term (1–2 weeks)
1. **Ground-truth dataset** – 200 manually-labeled listings.
   * Use it to compute field-level F1 after each tweak.
2. **LangChain `StructuredOutputParser` + Zod** – automatic validation + re-ask when JSON invalid.
3. **RAG city/area standardiser**
   * Tiny embedding index of Indian locality names → feed canonical city/area back into prompt.
4. **Confidence Model v2** – LightGBM over: text length, numeric-parse success flags, model log-prob → predicts "likely correct".

---
## 3. Long-Term (ML Heavy)
* **Fine-tune Llama-3-Instruct 8B** on your ground-truth → run locally, near-zero $ token cost.
* **Custom price normaliser** – small regression model converting free-text price → number (handles *Cr/Lakh* variants).
* **Active-learning UI** – analysts fix AI mistakes → feedback loop into training set.

---
## 4. Implementation Starter Code (Structured Output)
```js
// services/aiProcessor.js (extract)
import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser, z } from "@langchain/core";

const schema = z.object({
  title: z.string(),
  price: z.number(),
  priceType: z.enum(["sale","rent"]).optional(),
  location: z.object({
    city: z.string(),
    area: z.string().optional(),
    fullAddress: z.string().optional()
  }),
  bhk: z.number().optional(),
  confidence: z.number().min(0).max(1).optional()
});

const parser = StructuredOutputParser.fromZodSchema(schema);

export async function extractProperty(rawText){
  const chat = new ChatOpenAI({ model:"gpt-4o-mini", temperature:0 });
  const prompt = `Extract property details in JSON.\n${parser.getFormatInstructions()}\n---RAW---\n${rawText}`;
  const res   = await chat.invoke(prompt);
  return parser.parse(res.content);
}
```

---
## 5. Monitoring Metrics
* **Parse Success Rate** = AI outputs passing Joi validation / total.
* **Avg Tokens / property** – use OpenAI billing dashboard.
* **Mean processing time** – `aiProcessingMetadata.processingTime` (already in schema).

---
## 6. Checklist Before Each Release
- [ ] 100 % unit tests pass for `aiProcessor`
- [ ] Parse Success Rate ≥ 95 % on hold-out set
- [ ] Cost per 1 000 listings < $0.50
- [ ] No high-severity validation errors in logs for 24 h

Feel free to append ideas & pull-request numbers below this line.

---
✍🏻 _Last updated: 2025-08-01_