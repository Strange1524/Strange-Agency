const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Replace (req, res) => { with async (req, res) => {
code = code.replace(/, \(req, res\) => \{/g, ', async (req, res) => {');
code = code.replace(/, \(req: any, res\) => \{/g, ', async (req: any, res) => {');
code = code.replace(/app\.get\('\/api\/gallery', \(req, res\) => \{/g, 'app.get(\'/api/gallery\', async (req, res) => {');
code = code.replace(/app\.post\('\/api\/auth\/request-reset', \(req, res\) => \{/g, 'app.post(\'/api/auth/request-reset\', async (req, res) => {');
code = code.replace(/app\.get\('\/api\/classes', authenticate, \(req, res\) => \{/g, 'app.get(\'/api/classes\', authenticate, async (req, res) => {');

fs.writeFileSync('server.ts', code);
console.log('Added async to route handlers again');
