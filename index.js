const form = document.getElementById('manageRoomsForm');
const roomsTableUrl = `https://api.airtable.com/v0/{appY6ucd2CU1tr5AH}/Rooms`; // Replace with your actual base ID
const apiKey = 'YOUR_AIRTABLE_API_KEY'; // Replace with your Airtable API key

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(form);

  const roomNumber = formData.get('roomNumber');
  const bedNumber = formData.get('bedNumber');
  const tenantName = formData.get('tenantName');
  const phoneNumber = formData.get('phoneNumber');
  const paymentMade = formData.get('paymentMade');
  const paymentMethod = formData.get('paymentMethod');
  const amountPaid = formData.get('amountPaid');
  const comments = formData.get('comments');

  const data = {
    fields: {
      'Room Number': roomNumber,
      'Bed Number': bedNumber,
      'Tenant Name': tenantName,
      'Phone Number': phoneNumber,
      'Payment Made': paymentMade,
      'Payment Method': paymentMethod,
      'Amount Paid': amountPaid,
      'Comments': comments,
    },
  };

  try {
    const response = await fetch(roomsTableUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      alert('Room added successfully!');
      displayRooms();
      form.reset(); // Reset the form
    } else {
      console.error('Error adding room:', result);
      alert('Failed to add room');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding room');
  }
});

// Fetch and display rooms data from Airtable
async function displayRooms() {
  const response = await fetch(roomsTableUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const result = await response.json();
  const roomsTable = document.getElementById('roomsTable').getElementsByTagName('tbody')[0];
  roomsTable.innerHTML = ''; // Clear existing rows

  result.records.forEach(record => {
    const row = roomsTable.insertRow();
    row.innerHTML = `
      <td>${record.fields['Room Number']}</td>
      <td>${record.fields['Bed Number']}</td>
      <td>${record.fields['Tenant Name']}</td>
      <td>${record.fields['Phone Number']}</td>
      <td>${record.fields['Payment Made']}</td>
      <td>${record.fields['Payment Method']}</td>
      <td>${record.fields['Amount Paid']}</td>
      <td>${record.fields['Comments']}</td>
      <td class="action-btns">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn" onclick="deleteRoom('${record.id}')">Delete</button>
      </td>
    `;
  });
}

// Delete room from Airtable
async function deleteRoom(recordId) {
  const confirmation = confirm('Are you sure you want to delete this room?');
  if (!confirmation) return;

  try {
    const response = await fetch(`${roomsTableUrl}/${recordId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      alert('Room deleted successfully!');
      displayRooms();
    } else {
      const result = await response.json();
      console.error('Error deleting room:', result);
      alert('Failed to delete room');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting room');
  }
}

// Initial call to display rooms when page loads
displayRooms();
