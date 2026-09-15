import { readFile, writeFile } from "node:fs/promises";

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("Usage: node scripts/reconcile-review-tests.mjs raw-report.json output-prefix");
const report = JSON.parse(await readFile(input, "utf8"));
const cases = [];
function visit(suite, parents = []) {
  const titles = [...parents, suite.title].filter(Boolean);
  for (const spec of suite.specs ?? []) for (const entry of spec.tests) {
    cases.push({ id: spec.id, file: spec.file ?? suite.file, line: spec.line, title: [...titles, spec.title].join(" › "),
      project: entry.projectName, expectedStatus: entry.expectedStatus, status: entry.status,
      annotations: entry.annotations, attempts: entry.results.map(result => ({
        retry: result.retry, status: result.status, startTime: result.startTime, duration: result.duration,
        errors: result.errors, stdout: result.stdout, stderr: result.stderr, attachments: result.attachments?.map(({ body, ...attachment }) => ({ ...attachment, omittedEmbeddedBytes: body?.length ?? 0 })),
      })) });
  }
  for (const child of suite.suites ?? []) visit(child, titles);
}
for (const suite of report.suites) visit(suite);
const detailed = Object.fromEntries(["expected", "unexpected", "flaky", "skipped"].map(status => [status, cases.filter(entry => entry.status === status).length]));
const projectCounts = {};
for (const entry of cases) projectCounts[entry.project ?? "default"] = (projectCounts[entry.project ?? "default"] ?? 0) + 1;
const matches = Object.entries(detailed).every(([status, count]) => report.stats[status] === count);
const summary = { source: input, reported: report.stats, detailed, totalProjectCases: cases.length,
  uniqueSpecIds: new Set(cases.map(entry => entry.id)).size, totalAttempts: cases.reduce((sum, entry) => sum + entry.attempts.length, 0),
  retriedCases: cases.filter(entry => entry.attempts.length > 1).length, projectCounts, matches, globalErrors: report.errors, cases };
// Retain the complete reporter tree. Only embedded image/video attachment bodies are omitted.
function stripMedia(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) { node.forEach(stripMedia); return; }
  if (Array.isArray(node.attachments)) for (const attachment of node.attachments) {
    if (attachment.body && /^(image|video)\//.test(attachment.contentType ?? "")) {
      attachment.omittedEmbeddedBase64Characters = attachment.body.length;
      delete attachment.body;
    }
  }
  for (const child of Object.values(node)) stripMedia(child);
}
stripMedia(report);
await writeFile(`${output}-reporter.json`, JSON.stringify(report, null, 2) + "\n");
await writeFile(`${output}-reconciliation.json`, JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify({ reported: report.stats, detailed, totalProjectCases: cases.length, totalAttempts: summary.totalAttempts, projectCounts, matches }));
if (!matches) process.exitCode = 1;
