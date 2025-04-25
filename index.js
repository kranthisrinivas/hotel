const apiKey = 'patBX1XOCRvCLzvax.1b8ea03e81a1ab60a59b1f7365cb36bd3ce66cd6c7bd71233c5e0b692ec9d534';  // Replace with your actual API key
const baseId = 'appY6ucd2CU1tr5AH';  // Replace with your actual Base ID
const tableName = 'PG Hostel Management';  // Replace with your table name

const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

fetch(url, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Data:', data);
})
.catch(error => {
  console.error('Error:', error);
});
