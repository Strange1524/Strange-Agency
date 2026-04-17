const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Replace .run(), .all(), .get() with await
code = code.replace(/db\.select\(([\s\S]*?)\)\.from\(([\s\S]*?)\)\.all\(\)/g, 'await db.select($1).from($2)');
code = code.replace(/db\.select\(([\s\S]*?)\)\.from\(([\s\S]*?)\)\.where\(([\s\S]*?)\)\.get\(\)/g, '(await db.select($1).from($2).where($3).limit(1))[0]');
code = code.replace(/db\.update\(([\s\S]*?)\)\.set\(([\s\S]*?)\)\.where\(([\s\S]*?)\)\.run\(\)/g, 'await db.update($1).set($2).where($3)');
code = code.replace(/db\.insert\(([\s\S]*?)\)\.values\(([\s\S]*?)\)\.run\(\)/g, 'await db.insert($1).values($2)');
code = code.replace(/db\.delete\(([\s\S]*?)\)\.where\(([\s\S]*?)\)\.run\(\)/g, 'await db.delete($1).where($2)');
code = code.replace(/query\.all\(\)/g, 'await query');

fs.writeFileSync('server.ts', code);
console.log('Refactored server.ts again');
