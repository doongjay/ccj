import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import ts from "typescript";

// Import the same pure TypeScript asset data in the browser build and Node QA.
export async function sourceModule(path) {
  let code = ts.transpileModule(await readFile(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const imports = [...code.matchAll(/(?:from\s+|import\s*)["'](\.\.?\/[^"']+)["']/g)];
  for (const match of imports) {
    const dependency = resolve(dirname(path), match[1] + (match[1].endsWith(".ts") ? "" : ".ts"));
    code = code.replace(match[1], await sourceModule(dependency));
  }
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
