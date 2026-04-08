import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildMessages,
  buildRepairMessages,
  frameworkGuides,
  systemPrompt,
} from "./prompt.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

app.use(cors());
app.use(express.json());

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

function validateInput(body) {
  const requiredFields = ["brandName", "industry", "strengths", "targetAudience", "tone", "frameworks"];

  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === "string" && !body[field].trim())) {
      return `${field} 값이 비어 있습니다.`;
    }
  }

  if (!Array.isArray(body.frameworks) || body.frameworks.length === 0) {
    return "frameworks는 1개 선택되어야 합니다.";
  }

  if (body.frameworks.length !== 1) {
    return "카피라이팅 프레임워크는 1개만 선택할 수 있습니다.";
  }

  const invalidFramework = body.frameworks.find((framework) => !frameworkGuides[framework]);
  if (invalidFramework) {
    return `지원하지 않는 프레임워크입니다: ${invalidFramework}`;
  }

  return null;
}

function extractJson(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Claude 응답에서 JSON을 찾지 못했습니다.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

async function createClaudeText(messages, temperature = 0.95) {
  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    temperature,
    system: systemPrompt,
    messages,
  });

  return completion.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
}

async function parseClaudeResponse(text) {
  try {
    return extractJson(text);
  } catch (parseError) {
    const repairedText = await createClaudeText(buildRepairMessages(text), 0);
    return extractJson(repairedText);
  }
}

function normalizeCopies(payload, selectedFrameworks) {
  if (!payload || !Array.isArray(payload.copies)) {
    throw new Error("응답 JSON 형식이 올바르지 않습니다.");
  }

  const normalized = payload.copies.map((item) => ({
    framework: String(item.framework || "").trim(),
    version: Number(item.version),
    angle: String(item.angle || "").trim(),
    headline: String(item.headline || "").trim(),
    body: String(item.body || "").trim(),
    cta: String(item.cta || "").trim(),
  }));

  for (const framework of selectedFrameworks) {
    const count = normalized.filter((item) => item.framework === framework).length;
    if (count !== 6) {
      throw new Error(`${framework} 결과 수가 6개가 아닙니다.`);
    }
  }

  const hasInvalid = normalized.some(
    (item) =>
      !selectedFrameworks.includes(item.framework) ||
      !item.version ||
      !item.angle ||
      !item.headline ||
      !item.body ||
      !item.cta,
  );

  if (hasInvalid) {
    throw new Error("응답 항목 일부가 비어 있거나 요청한 프레임워크와 일치하지 않습니다.");
  }

  return normalized.sort((a, b) => {
    if (a.framework === b.framework) {
      return a.version - b.version;
    }

    return selectedFrameworks.indexOf(a.framework) - selectedFrameworks.indexOf(b.framework);
  });
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
});

app.post("/api/generate-copy", async (request, response) => {
  const validationError = validateInput(request.body);
  if (validationError) {
    return response.status(400).json({ error: validationError });
  }

  if (!anthropic) {
    return response.status(500).json({
      error: "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.",
    });
  }

  try {
    const text = await createClaudeText(buildMessages(request.body));
    const parsed = await parseClaudeResponse(text);
    const copies = normalizeCopies(parsed, request.body.frameworks);

    return response.json({ copies });
  } catch (error) {
    console.error("generate-copy error:", error);
    return response.status(500).json({
      error:
        error?.message ||
        "카피 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
  }
});

app.use(express.static(distPath));

app.get("*", (request, response, next) => {
  if (request.path.startsWith("/api/")) {
    return next();
  }

  return response.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
