const form = document.getElementById("manageRoomsForm");

// Submit form to add or update data in Airtable
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const roomNumber = form.roomNumber.value;
  const bedNumber = form.bedNumber.value;
  const tenantName = form.tenantName.value;
  const phoneNumber = form.phoneNumber.value;
  const paymentMade = form.paymentMade.value;
  const paymentMethod = form.paymentMethod.value;
  const amountPaid = parseFloat(form.amountPaid.value); // Convert to number
  const comments = form.comments.value;

  const data = {
    fields: {
      RoomNumber: roomNumber,
      BedNumber: bedNumber,
      TenantName: tenantName,
      PhoneNumber: phoneNumber,
      PaymentMade: paymentMade,
      PaymentMethod: paymentMethod,
      AmountPaid: amountPaid,
      Comments: comments,
    },
  };

  const recordId = form.querySelector("input[name='recordId']")?.value;

  if (recordId) {
    try {
      const response = await fetch(`https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms/${recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer YOUR_API_KEY_HERE",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Room details updated successfully!");
        form.reset();
        loadRooms();
      } else {
        console.error("Airtable error:", result);
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  } else {
    try {
      const response = await fetch("https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms", {
        method: "POST",
        headers: {
          Authorization: "Bearer YOUR_API_KEY_HERE",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Room details added successfully!");
        form.reset();
        loadRooms();
      } else {
        console.error("Airtable error:", result);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  }
});

// Fetch data from Airtable and display in the table
async function loadRooms() {
  const response = await fetch("https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms", {
    method: "GET",
    headers: {
      Authorization: "Bearer YOUR_API_KEY_HERE",
    },
  });

  const data = await response.json();

  const tableBody = document.querySelector("#roomsTable tbody");
  tableBody.innerHTML = "";

  let occupiedBeds = 0;
  let totalRevenue = 0;

  data.records.forEach((record) => {
    const amountPaid = record.fields.AmountPaid || 0;
    const paymentMade = record.fields.PaymentMade || "No";

    if (paymentMade === "Yes" || amountPaid > 0) {
      occupiedBeds++;
    }
    totalRevenue += amountPaid;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.fields.RoomNumber || ""}</td>
      <td>${record.fields.BedNumber || ""}</td>
      <td>${record.fields.TenantName || ""}</td>
      <td>${record.fields.PhoneNumber || ""}</td>
      <td>${paymentMade}</td>
      <td>${record.fields.PaymentMethod || ""}</td>
      <td>${amountPaid}</td>
      <td>${record.fields.Comments || ""}</td>
      <td class="action-btns">
        <button class="edit-btn" onclick="editRoom('${record.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteRoom('${record.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Update stats
  document.getElementById("occupiedBeds").textContent = occupiedBeds;
  document.getElementById("revenue").textContent = `₹${totalRevenue.toFixed(2)}`;
}

// Edit room
async function editRoom(recordId) {
  const response = await fetch(`https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms/${recordId}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer YOUR_API_KEY_HERE",
    },
  });

  const data = await response.json();
  const record = data.fields;

  form.roomNumber.value = record.RoomNumber;
  form.bedNumber.value = record.BedNumber;
  form.tenantName.value = record.TenantName;
  form.phoneNumber.value = record.PhoneNumber;
  form.paymentMade.value = record.PaymentMade;
  form.paymentMethod.value = record.PaymentMethod;
  form.amountPaid.value = record.AmountPaid;
  form.comments.value = record.Comments;

  // Hidden recordId input
  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = "recordId";
  hiddenInput.value = recordId;
  form.appendChild(hiddenInput);
}

// Delete room
async function deleteRoom(recordId) {
  const response = await fetch(`https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms/${recordId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer YOUR_API_KEY_HERE",
    },
  });

  const result = await response.json();
  if (response.ok) {
    alert("Room deleted successfully!");
    loadRooms();
  } else {
    console.error("Error deleting room:", result);
  }
}

// Load rooms initially
loadRooms();
