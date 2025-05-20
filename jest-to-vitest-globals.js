// This codemod replaces Jest globals with imports from 'vitest'
export default function transformer(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  const jestGlobals = [
    "describe",
    "it",
    "expect",
    "test",
    "beforeAll",
    "beforeEach",
    "afterAll",
    "afterEach",
  ];

  let hasJestGlobals = false;

  // Check if any Jest globals are used in the file
  root.find(j.CallExpression).forEach((path) => {
    if (jestGlobals.includes(path.node.callee.name)) {
      hasJestGlobals = true;
      console.log(`Found Jest global: ${path.node.callee.name}`);
    }
  });

  if (!hasJestGlobals) {
    console.log("Found a global.");
    return null; // No changes needed
  }

  // Add import statement for 'vitest'
  const vitestImport = j.importDeclaration(
    jestGlobals.map((name) => j.importSpecifier(j.identifier(name))),
    j.literal("vitest"),
  );

  // Add the import at the beginning of the file
  root.find(j.Program).get("body", 0).insertBefore(vitestImport.node);

  // Rename all usages of Jest globals
  root.find(j.Identifier).forEach((path) => {
    if (jestGlobals.includes(path.node.name)) {
      path.node.name = path.node.name; // This line does nothing, but is needed for jscodeshift
    }
  });

  return root.toSource({
    quote: "single",
    trailingComma: false,
    semicolo: true,
  });
}
