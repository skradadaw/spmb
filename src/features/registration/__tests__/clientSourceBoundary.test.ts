import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const sourceRoot = resolve(process.cwd(), 'src');
const fixtureRoot = resolve(
  process.cwd(),
  'src/features/registration/__tests__/fixtures/client-source-boundary',
);
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs', '.cts', '.cjs'];
const forbiddenCapabilities = [
  ['service-role key', /\bSUPABASE_SERVICE_ROLE_KEY\b/],
  ['public storage URL', /\bgetPublicUrl\s*\(/],
  ['private registration object path', /\bregistrations\//],
  ['legacy upload helper', /\buploadRegistrationDocuments\b/],
  ['legacy rollback helper', /\brollbackUploadedDocuments\b/],
] as const;

function isProductionSource(path: string) {
  const sourcePath = relative(sourceRoot, path);

  return (
    sourceExtensions.includes(extname(path)) &&
    !sourcePath.split('/').includes('__tests__') &&
    !sourcePath.startsWith(`test/`) &&
    !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)
  );
}

function collectProductionSource(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectProductionSource(path);
    }

    return isProductionSource(path) ? [path] : [];
  });
}

function parseSource(path: string, source: string) {
  const scriptKind = (() => {
    switch (extname(path)) {
      case '.js':
      case '.mjs':
      case '.cjs':
        return ts.ScriptKind.JS;
      case '.jsx':
        return ts.ScriptKind.JSX;
      case '.tsx':
        return ts.ScriptKind.TSX;
      default:
        return ts.ScriptKind.TS;
    }
  })();

  return ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
}

function hasDirective(sourceFile: ts.SourceFile, directive: 'use client' | 'use server') {
  for (const statement of sourceFile.statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    ) {
      return false;
    }

    if (statement.expression.text === directive) {
      return true;
    }
  }

  return false;
}

function importedSpecifiers(sourceFile: ts.SourceFile) {
  const specifiers = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteralLike(statement.moduleSpecifier)
    ) {
      specifiers.add(statement.moduleSpecifier.text);
    }

    if (
      ts.isImportEqualsDeclaration(statement) &&
      ts.isExternalModuleReference(statement.moduleReference) &&
      statement.moduleReference.expression &&
      ts.isStringLiteralLike(statement.moduleReference.expression)
    ) {
      specifiers.add(statement.moduleReference.expression.text);
    }
  }

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire =
        ts.isIdentifier(node.expression) && node.expression.text === 'require';
      const [argument] = node.arguments;

      if ((isDynamicImport || isRequire) && argument && ts.isStringLiteralLike(argument)) {
        specifiers.add(argument.text);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return [...specifiers];
}

function isSupabaseSpecifier(specifier: string) {
  return specifier === '@supabase' || specifier.startsWith('@supabase/');
}

function resolveProjectImport(importer: string, specifier: string) {
  const unresolvedPath = specifier.startsWith('@/')
    ? resolve(sourceRoot, specifier.slice(2))
    : specifier.startsWith('.')
      ? resolve(dirname(importer), specifier)
      : null;

  if (!unresolvedPath) {
    return null;
  }

  const candidates = [
    unresolvedPath,
    ...sourceExtensions.map((extension) => `${unresolvedPath}${extension}`),
    ...sourceExtensions.map((extension) => join(unresolvedPath, `index${extension}`)),
  ];

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

function findClientReachableModules(files: string[]) {
  const sourceByPath = new Map(files.map((path) => [path, readFileSync(path, 'utf8')]));
  const clientEntries = files.filter((path) =>
    hasDirective(parseSource(path, sourceByPath.get(path) ?? ''), 'use client'),
  );
  const reachable = new Map<string, string[]>();
  const pending = clientEntries.map((path) => ({ path, chain: [path] }));

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || reachable.has(current.path)) {
      continue;
    }

    reachable.set(current.path, current.chain);
    const source = sourceByPath.get(current.path) ?? '';
    const sourceFile = parseSource(current.path, source);

    // A Server Action import is represented by an RPC reference in the client graph.
    if (hasDirective(sourceFile, 'use server')) {
      continue;
    }

    for (const specifier of importedSpecifiers(sourceFile)) {
      const dependency = resolveProjectImport(current.path, specifier);
      if (dependency && sourceByPath.has(dependency)) {
        pending.push({ path: dependency, chain: [...current.chain, dependency] });
      }
    }
  }

  return { reachable, sourceByPath };
}

function displayPath(path: string) {
  return relative(process.cwd(), path);
}

function findClientViolations(files: string[]) {
  const { reachable, sourceByPath } = findClientReachableModules(files);

  return [...reachable].flatMap(([path, chain]) => {
    const source = sourceByPath.get(path) ?? '';
    const sourceFile = parseSource(path, source);
    const isSignedUploadClient = path.endsWith('/signedUploadClient.ts');
    const moduleViolations = importedSpecifiers(sourceFile)
      .filter(isSupabaseSpecifier)
      .filter(() => !isSignedUploadClient)
      .map(() => `Supabase SDK: ${chain.map(displayPath).join(' -> ')}`);

    const capabilityViolations = forbiddenCapabilities
      .filter(([, pattern]) => pattern.test(source))
      .map(
        ([label]) =>
          `${label}: ${chain.map(displayPath).join(' -> ')}`,
      );

    return [...moduleViolations, ...capabilityViolations];
  });
}

function fixture(...names: string[]) {
  return names.map((name) => resolve(fixtureRoot, name));
}

describe('client source security boundary', () => {
  const files = collectProductionSource(sourceRoot);

  it('keeps retired browser Supabase artifacts out of project source', () => {
    const forbiddenArtifacts = [
      ['public anon key', /\bNEXT_PUBLIC_SUPABASE_ANON_KEY\b/],
      ['public storage URL', /\bgetPublicUrl\s*\(/],
      ['legacy upload helper', /\buploadRegistrationDocuments\b/],
      ['legacy rollback helper', /\brollbackUploadedDocuments\b/],
    ] as const;
    const violations = files.flatMap((path) => {
      const source = readFileSync(path, 'utf8');

      return forbiddenArtifacts
        .filter(([label]) => label !== 'public anon key' || !path.endsWith('/signedUploadClient.ts'))
        .filter(([, pattern]) => pattern.test(source))
        .map(([label]) => `${displayPath(path)}: ${label}`);
    });

    expect(violations).toEqual([]);
  });

  it('keeps privileged Supabase capabilities outside every client dependency graph', () => {
    expect(findClientViolations(files)).toEqual([]);
  });

  it('limits the deliberate browser client to signed uploads', () => {
    const source = readFileSync(resolve(sourceRoot, 'features/registration/signedUploadClient.ts'), 'utf8');
    expect(source).toContain('uploadToSignedUrl');
    expect(source).not.toMatch(/\.upload\s*\(/);
    expect(source).not.toContain('getPublicUrl');
    expect(source).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('recognizes a client directive after leading comments', () => {
    expect(findClientViolations(fixture('commented-client.fixture'))).toEqual([
      expect.stringContaining('Supabase SDK'),
    ]);
  });

  it('stops a valid client graph at a Server Action directive after leading comments', () => {
    expect(
      findClientViolations(
        fixture(
          'client-via-server-action.fixture',
          'commented-server-action.fixture',
          'server-only-supabase.fixture',
        ),
      ),
    ).toEqual([]);
  });

  it.each([
    'side-effect-import.fixture',
    'require-import.fixture',
    'dynamic-comment-import.fixture',
    'export-all.fixture',
    'export-named.fixture',
    'exact-package.fixture',
  ])('rejects the Supabase module specifier in %s', (name) => {
    expect(findClientViolations(fixture(name))).toEqual([
      expect.stringContaining('Supabase SDK'),
    ]);
  });
});
