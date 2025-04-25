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
  const amountPaid = parseFloat(form.amountPaid.value);
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
      Comments: comments
    }
  };

  const recordId = form.querySelector("input[name='recordId']")?.value;

  if (recordId) {
    // Update existing record
    try {
      const response = await fetch(`https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms/${recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
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
    // Create new record
    try {
      const response = await fetch("https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms", {
        method: "POST",
        headers: {
          Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
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

// Fetch data from Airtable and display in table
async function loadRooms() {
  const response = await fetch("https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms", {
    headers: {
      Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
    },
  });

  const data = await response.json();

  const tableBody = document.querySelector("#roomsTable tbody");
  tableBody.innerHTML = "";

  let totalRevenue = 0;
  let occupiedBeds = 0;

  data.records.forEach((record) => {
    const amount = parseFloat(record.fields.AmountPaid || 0);
    if (!isNaN(amount)) totalRevenue += amount;
    occupiedBeds += 1;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.fields.RoomNumber || ""}</td>
      <td>${record.fields.BedNumber || ""}</td>
      <td>${record.fields.TenantName || ""}</td>
      <td>${record.fields.PhoneNumber || ""}</td>
      <td>${record.fields.PaymentMade || ""}</td>
      <td>${record.fields.PaymentMethod || ""}</td>
      <td>${record.fields.AmountPaid || 0}</td>
      <td>${record.fields.Comments || ""}</td>
      <td class="action-btns">
        <button class="edit-btn" onclick="editRoom('${record.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteRoom('${record.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.getElementById("occupiedBeds").textContent = occupiedBeds;
  document.getElementById("totalRevenue").textContent = totalRevenue;
}

// Edit room
async function editRoom(recordId) {
  const response = await fetch(`https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms/${recordId}`, {
    headers: {
      Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
    },
  });

  const data = await response.json();
  const record = data.fields;

  form.roomNumber.value = record.RoomNumber || "";
  form.bedNumber.value = record.BedNumber || "";
  form.tenantName.value = record.TenantName || "";
  form.phoneNumber.value = record.PhoneNumber || "";
  form.paymentMade.value = record.PaymentMade || "";
  form.paymentMethod.value = record.PaymentMethod || "";
  form.amountPaid.value = record.AmountPaid || 0;
  form.comments.value = record.Comments || "";

  let hiddenInput = form.querySelector("input[name='recordId']");
  if (!hiddenInput) {
    hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "recordId";
    form.appendChild(hiddenInput);
  }
  hiddenInput.value = recordId;
}

// Delete room
async function deleteRoom(recordId) {
  const response = await fetch(`https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms/${recordId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
    },
  });

  if (response.ok) {
    alert("Room deleted successfully!");
    loadRooms();
  } else {
    console.error("Error deleting room.");
  }
}

// Load data initially
loadRooms();
