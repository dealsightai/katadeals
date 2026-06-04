var fs = require('fs');
fs.mkdirSync('src/app/refinance', { recursive: true });
fs.writeFileSync('src/app/refinance/page.tsx', 'export default function Page() { return <main className="p-12"><h1 className="text-3xl font-bold">Cash Out Refinance Calculator</h1><p>Coming soon</p></main>; }');
console.log('Done');