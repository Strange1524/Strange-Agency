const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Replace .all() with await
code = code.replace(/db\.select\((.*?)\)\.from\((.*?)\)\.all\(\)/g, 'await db.select($1).from($2)');
code = code.replace(/db\.select\((.*?)\)\.from\((.*?)\)(.*?)\.all\(\)/g, 'await db.select($1).from($2)$3');
code = code.replace(/query\.all\(\)/g, 'await query');

// Replace .get() with await and [0]
code = code.replace(/db\.select\((.*?)\)\.from\((.*?)\)\.where\((.*?)\)\.get\(\)/g, '(await db.select($1).from($2).where($3).limit(1))[0]');

// Replace .run() with await
code = code.replace(/db\.insert\((.*?)\)\.values\((.*?)\)\.run\(\)/g, 'await db.insert($1).values($2)');
code = code.replace(/db\.update\((.*?)\)\.set\((.*?)\)\.where\((.*?)\)\.run\(\)/g, 'await db.update($1).set($2).where($3)');
code = code.replace(/db\.delete\((.*?)\)\.where\((.*?)\)\.run\(\)/g, 'await db.delete($1).where($2)');

// Handle the userResult insert which needs returning()
code = code.replace(/const userResult = await db\.insert\(users\)\.values\(\{([\s\S]*?)\}\);([\s\S]*?)userId: userResult\.lastInsertRowid as number/g, 
  'const [userResult] = await db.insert(users).values({$1}).returning({ id: users.id });$2userId: userResult.id');

// Fix the transaction for bulk import
code = code.replace(/const insertMany = db\.transaction\(\(rows\) => \{([\s\S]*?)\}\);\s*insertMany\(data\);/g, 
  'await db.transaction(async (tx) => {$1});');
// Inside the transaction, replace db. with tx.
// This is tricky with regex. Let's do it manually if needed.

fs.writeFileSync('server.ts', code);
console.log('Refactored server.ts');
