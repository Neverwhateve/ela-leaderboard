const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '../ELA Data.xlsx');
const workbook = XLSX.readFile(excelPath);

console.log('Excel Sheet Names:', workbook.SheetNames);
console.log('\n---\n');

workbook.SheetNames.forEach(sheetName => {
  console.log(`Sheet: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log('First few rows:', data.slice(0, 5));
  console.log('\n---\n');
});
