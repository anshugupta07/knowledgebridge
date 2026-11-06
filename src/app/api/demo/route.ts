import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_FILE_NAME = /\.(pdf|docx|txt|md)$/i;

const demoKnowledge = {
  projectOverview: "An e-commerce application with product management, authentication, cart, payments, and an admin dashboard.",
  decisions: [
    { description: "Product APIs are the shared contract between the frontend and backend teams.", status: "Verified", sourceId: "demo-backend-notes", sourceFile: "backend-notes.md", evidence: "Product APIs are tested and ready for frontend consumption.", confidence: "High" },
  ],
  completedTasks: [
    { description: "Backend APIs", sourceId: "demo-backend-notes", sourceFile: "backend-notes.md", evidence: "Backend APIs are completed.", confidence: "High" },
    { description: "User authentication", sourceId: "demo-backend-notes", sourceFile: "backend-notes.md", evidence: "User authentication is working.", confidence: "High" },
  ],
  pendingTasks: [
    { description: "Payment gateway integration", sourceId: "demo-release-notes", sourceFile: "release-notes.txt", evidence: "Payment gateway integration is pending.", confidence: "High" },
    { description: "Complete admin dashboard testing", sourceId: "demo-release-notes", sourceFile: "release-notes.txt", evidence: "Admin dashboard testing is incomplete.", confidence: "High" },
  ],
  risks: [
    { title: "Production release is blocked", description: "Payment integration must be completed before deployment.", level: "High", sourceId: "demo-release-notes", sourceFile: "release-notes.txt", evidence: "Production deployment requires payment integration to be completed.", confidence: "High" },
    { title: "Database performance is unverified", description: "Optimization work is required before traffic increases.", level: "Medium", sourceId: "demo-release-notes", sourceFile: "release-notes.txt", evidence: "Database optimization is required.", confidence: "High" },
  ],
  uncertainties: ["No confirmed owner or target date was found for database optimization."],
  conflicts: [],
};

export async function GET() {
  return NextResponse.json({ mode: "demo", message: "Deterministic demo analysis; no live AI credentials were used.", data: demoKnowledge });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
  }
  const { projectId, fileName, fileSize } = body as {
    projectId?: unknown;
    fileName?: unknown;
    fileSize?: unknown;
  };
  const normalizedProjectId = typeof projectId === "string" ? projectId.trim() : "";
  const normalizedFileName = typeof fileName === "string" ? fileName.trim() : "";
  if (!normalizedProjectId || normalizedProjectId.length > 100) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  if (
    !normalizedFileName ||
    normalizedFileName.length > 255 ||
    normalizedFileName.includes("/") ||
    normalizedFileName.includes("\\") ||
    !SUPPORTED_FILE_NAME.test(normalizedFileName)
  ) {
    return NextResponse.json({ error: "A supported file name is required" }, { status: 400 });
  }
  if (
    typeof fileSize !== "number" ||
    !Number.isSafeInteger(fileSize) ||
    fileSize <= 0 ||
    fileSize > MAX_FILE_SIZE
  ) {
    return NextResponse.json({ error: "File size must be between 1 byte and 10 MB" }, { status: 400 });
  }
  return NextResponse.json({
    mode: "demo",
    projectId: normalizedProjectId,
    source: { fileName: normalizedFileName, fileSize },
    data: demoKnowledge,
  });
}
