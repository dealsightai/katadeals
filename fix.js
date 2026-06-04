var fs = require('fs');

var content = fs.readFileSync('src/components/RefinanceCalculator.tsx', 'utf8');
content = content.replace(
  'const [result, setResult] = useState(null);',
  'const [result, setResult] = useState<any>(null);'
);
fs.writeFileSync('src/components/RefinanceCalculator.tsx', content);
console.log('Fixed!');