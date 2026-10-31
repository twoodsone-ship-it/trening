import assert from 'assert';
import { EXERCISE_CATALOG } from './src/data/exerciseCatalog.ts';

console.log('--- Running Exercise Catalog Integrity Tests ---');

const catalogEntries = Object.entries(EXERCISE_CATALOG);
const catalogKeys = new Set(Object.keys(EXERCISE_CATALOG));

console.log(`Total exercises in catalog: ${catalogEntries.length}`);
assert(catalogEntries.length >= 70, 'Catalog must contain at least 70 exercises');

let missingReferences = 0;

for (const [id, exercise] of catalogEntries) {
  assert.strictEqual(id, exercise.id, `Key ${id} must match exercise.id ${exercise.id}`);
  assert(exercise.name.trim().length > 0, `Exercise ${id} must have a name`);
  assert(exercise.technique, `Exercise ${id} must have a technique guide`);
  assert(exercise.technique.setup.trim().length > 0, `Exercise ${id} must have setup guide`);
  assert(exercise.technique.execution.trim().length > 0, `Exercise ${id} must have execution guide`);
  assert(exercise.technique.breathing.trim().length > 0, `Exercise ${id} must have breathing guide`);
  assert(exercise.technique.mistakes.length > 0, `Exercise ${id} must have mistakes listed`);
  assert(exercise.gifUrl && exercise.gifUrl.startsWith('https://'), `Exercise ${id} must have a valid 3D animated gifUrl`);

  // Check that every alternative ID exists!
  assert(exercise.alternatives && exercise.alternatives.length > 0, `Exercise ${id} must have at least 1 alternative`);
  
  for (const altId of exercise.alternatives) {
    if (!catalogKeys.has(altId)) {
      console.error(`❌ BROKEN REFERENCE: Exercise '${id}' lists alternative '${altId}' which does NOT exist in EXERCISE_CATALOG!`);
      missingReferences++;
    }
  }
}

assert.strictEqual(missingReferences, 0, `Found ${missingReferences} broken alternative references!`);
console.log('✔ All alternative cross-references are 100% valid and verified!');
console.log('✔ All technique guides are complete!');
console.log('CATALOG INTEGRITY TEST PASSED PERFECTLY!');
