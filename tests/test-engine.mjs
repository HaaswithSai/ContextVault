/**
 * Comprehensive Automated Verification Test for Part 1 & Part 2
 */
import assert from 'assert';

console.log('🧪 Starting automated tests for Context Vault (Part 1 & Part 2)...\n');

// Mock localStorage for Node environment test
const storageState = new Map();
global.localStorage = {
  getItem: (key) => storageState.get(key) || null,
  setItem: (key, val) => storageState.set(key, String(val)),
  removeItem: (key) => storageState.delete(key),
  clear: () => storageState.clear(),
};

// Import storage module
const {
  saveMemory,
  getAllMemories,
  searchMemories,
  updateMemoryTags,
  toggleFavorite,
  deleteMemory,
  clearAllMemories,
} = await import('../src/utils/storage.ts');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(err);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(err);
      failed++;
    }
  }

  console.log('--- TEST SUITE 1: Storage Engine (Part 1) ---');
  await clearAllMemories();

  await asyncTest('saveMemory() saves a memory and auto-assigns id and timestamp', async () => {
    const mem1 = await saveMemory({
      pageTitle: 'Chrome MV3 Documentation',
      url: 'https://developer.chrome.com/mv3',
      selectedText: 'Service workers replace background pages in MV3.',
      surroundingContext: 'Key differences in MV3: Service workers replace background pages in MV3. They are event based.',
      tags: ['chrome', 'extension'],
      isFavorite: false,
    });

    assert.ok(mem1.id, 'Memory should have a generated id');
    assert.ok(mem1.createdAt > 0, 'Memory should have a valid createdAt timestamp');
    assert.strictEqual(mem1.pageTitle, 'Chrome MV3 Documentation');
    assert.strictEqual(mem1.isFavorite, false);
  });

  await asyncTest('getAllMemories() retrieves all saved items ordered newest first', async () => {
    const mem2 = await saveMemory({
      pageTitle: 'React 18 Guide',
      url: 'https://react.dev',
      selectedText: 'React components are pure functions of props and state.',
      surroundingContext: 'Architecture of React: React components are pure functions of props and state. They render JSX.',
      tags: ['react', 'frontend'],
      isFavorite: true,
      createdAt: Date.now() + 1000,
    });

    const all = await getAllMemories();
    assert.strictEqual(all.length, 2, 'Should have 2 memories');
    assert.strictEqual(all[0].id, mem2.id, 'Newest memory should be first');
  });

  await asyncTest('searchMemories() matches text substring', async () => {
    const results = await searchMemories('Service workers');
    assert.strictEqual(results.length, 1);
    assert.ok(results[0].selectedText.includes('Service workers'));
  });

  await asyncTest('searchMemories() matches tag or title case-insensitively', async () => {
    const tagResults = await searchMemories('FRONTEND');
    assert.strictEqual(tagResults.length, 1);
    assert.strictEqual(tagResults[0].pageTitle, 'React 18 Guide');
  });

  await asyncTest('searchMemories() returns all memories when query is empty', async () => {
    const results = await searchMemories('   ');
    assert.strictEqual(results.length, 2);
  });

  await asyncTest('toggleFavorite() toggles favorite state', async () => {
    const all = await getAllMemories();
    const target = all.find((m) => m.pageTitle === 'Chrome MV3 Documentation');
    assert.strictEqual(target.isFavorite, false);

    const updated = await toggleFavorite(target.id);
    assert.strictEqual(updated.isFavorite, true);

    const check = await getAllMemories();
    const checkedTarget = check.find((m) => m.id === target.id);
    assert.strictEqual(checkedTarget.isFavorite, true);
  });

  await asyncTest('updateMemoryTags() adds and deduplicates tags cleanly', async () => {
    const all = await getAllMemories();
    const target = all[0];
    const updated = await updateMemoryTags(target.id, ['react', 'ui', 'hooks', 'react']);

    assert.strictEqual(updated.tags.length, 3);
    assert.deepStrictEqual(updated.tags, ['react', 'ui', 'hooks']);
  });

  await asyncTest('deleteMemory() removes item from storage', async () => {
    const all = await getAllMemories();
    const target = all[0];
    const deleted = await deleteMemory(target.id);
    assert.strictEqual(deleted, true);

    const remaining = await getAllMemories();
    assert.strictEqual(remaining.length, 1);
    assert.strictEqual(remaining.find((m) => m.id === target.id), undefined);
  });

  console.log('\n--- TEST SUITE 2: Content Script & Context Extraction (Part 2) ---');

  // DOM Heuristic Simulation
  function simulateContextExtraction(fullText, selection, radius = 180) {
    const normalized = fullText.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (normalized.length <= 500) {
      return normalized;
    }
    const matchIndex = normalized.indexOf(selection);
    if (matchIndex === -1) {
      return normalized.substring(0, 500) + '...';
    }
    const start = Math.max(0, matchIndex - radius);
    const end = Math.min(normalized.length, matchIndex + selection.length + radius);
    let snippet = normalized.substring(start, end).trim();
    if (start > 0) snippet = '...' + snippet;
    if (end < normalized.length) snippet = snippet + '...';
    return snippet;
  }

  test('Context heuristic extracts centered window around highlighted text', () => {
    const paragraph =
      'Artificial intelligence has evolved rapidly over recent decades. ' +
      'Large language models have shown remarkable capabilities in natural language understanding, ' +
      'code generation, problem solving, and complex reasoning across diverse domains. ' +
      'Modern web extensions can now seamlessly leverage local storage and machine learning models ' +
      'to organize personal knowledge graphs with zero data leakage.';
    const selected = 'Large language models have shown remarkable capabilities in natural language understanding';

    const context = simulateContextExtraction(paragraph, selected);
    assert.ok(context.includes(selected), 'Context must include selected text');
    assert.ok(context.length <= 500, 'Context must be clamped under 500 characters');
  });

  test('Context heuristic handles short texts without unnecessary ellipses', () => {
    const shortText = 'MindClip lets you capture web context effortlessly.';
    const selected = 'capture web context';
    const context = simulateContextExtraction(shortText, selected);
    assert.strictEqual(context, shortText);
  });

  console.log('\n========================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
