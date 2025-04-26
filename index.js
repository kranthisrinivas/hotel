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

// Fetch and render room data + update revenue & occupied beds
async function loadRooms() {
  const response = await fetch("https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms", {
    method: "GET",
    headers: {
      Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
    },
  });

  const data = await response.json();

  const tableBody = document.querySelector("#roomsTable tbody");
  const revenueElement = document.getElementById("revenue");
  const occupiedBedsElement = document.getElementById("occupiedBeds");

  let totalRevenue = 0;
  let occupiedBeds = 0;

  tableBody.innerHTML = "";

  data.records.forEach((record) => {
    const row = document.createElement("tr");

    const amount = parseFloat(record.fields.AmountPaid || 0);
    if (!isNaN(amount)) totalRevenue += amount;
    occupiedBeds += 1;

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

  // Update revenue and occupied beds
  revenueElement.textContent = `₹${totalRevenue}`;
  occupiedBedsElement.textContent = occupiedBeds;
}

async function editRoom(recordId) {
  const response = await fetch(`https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms/${recordId}`, {
    method: "GET",
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
  form.amountPaid.value = record.AmountPaid || "";
  form.comments.value = record.Comments || "";

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = "recordId";
  hiddenInput.value = recordId;
  form.appendChild(hiddenInput);
}

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
    const result = await response.json();
    console.error("Error deleting room:", result);
  }
}
function logout() {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "login.html";
}


// Load data when page loads
loadRooms();
function logout() {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "login.html";
}

// Load data when page loads
loadRooms();

// 🛠️ Add this line to connect the button
document.getElementById("logoutButton").addEventListener("click", logout);
