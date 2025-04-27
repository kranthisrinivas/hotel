const form = document.getElementById("manageRoomsForm");

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

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
  const idProofFile = form.idProof.files[0];

  let idProofUrl = "";

  if (idProofFile) {
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', idProofFile);
    cloudinaryData.append('upload_preset', 'pg-hostel-idproof');

    try {
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/dudx9anuk/upload`, {
        method: 'POST',
        body: cloudinaryData,
      });
      const cloudinaryResult = await cloudinaryRes.json();
      idProofUrl = cloudinaryResult.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      alert('Failed to upload ID Proof');
      return;
    }
  } else {
    alert('Please upload ID Proof');
    return;
  }

  const now = new Date();
  const paymentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });

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
      IDProofUrl: idProofUrl,
      PaymentMonth: paymentMonth,
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

      if (response.ok) {
        showToast("✅ Room updated successfully!");
        form.reset();
        removeHiddenRecordId();
        await loadRooms();
      } else {
        console.error("Airtable error during update:", await response.json());
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

      if (response.ok) {
        showToast("✅ Room added successfully!");
        form.reset();
        await loadRooms();
      } else {
        console.error("Airtable error during add:", await response.json());
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  }
});

async function loadRooms(selectedMonth = "") {
  const response = await fetch("https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms", {
    method: "GET",
    headers: {
      Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
    },
  });

  const data = await response.json();
  const tableBody = document.querySelector("#roomsTable tbody");
  const revenueElement = document.getElementById("revenue");
  const totalRevenueElement = document.getElementById("totalRevenue");
  const occupiedBedsElement = document.getElementById("occupiedBeds");
  const monthSelector = document.getElementById("monthSelector");

  let totalRevenue = 0;
  let filteredRevenue = 0;
  let occupiedBeds = 0;
  const uniqueMonths = new Set();

  tableBody.innerHTML = "";

  data.records.forEach((record) => {
    const amount = parseFloat(record.fields.AmountPaid || 0);
    const paymentMonth = record.fields.PaymentMonth || "";

    if (!isNaN(amount)) {
      totalRevenue += amount;
      if (!selectedMonth || selectedMonth === paymentMonth) {
        filteredRevenue += amount;
        occupiedBeds += 1;
      }
    }

    uniqueMonths.add(paymentMonth);

    if (selectedMonth && paymentMonth !== selectedMonth) return;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.fields.RoomNumber || ""}</td>
      <td>${record.fields.BedNumber || ""}</td>
      <td>${record.fields.TenantName || ""}</td>
      <td>${record.fields.PhoneNumber || ""}</td>
      <td>${record.fields.PaymentMade || ""}</td>
      <td>${record.fields.PaymentMethod || ""}</td>
      <td>${record.fields.AmountPaid || 0}</td>
      <td>
        ${record.fields.IDProofUrl ? `<a href="${record.fields.IDProofUrl}" target="_blank"><img src="${record.fields.IDProofUrl}" alt="ID Proof" style="width: 80px; height: auto;"></a>` : ""}
      </td>
      <td>${record.fields.Comments || ""}</td>
      <td class="action-btns">
        <button class="edit-btn" onclick="editRoom('${record.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteRoom('${record.id}')">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  if (monthSelector.options.length <= 1) {
    [...uniqueMonths].sort().forEach((month) => {
      const option = document.createElement("option");
      option.value = month;
      option.textContent = month;
      monthSelector.appendChild(option);
    });
  }

  revenueElement.textContent = `₹${filteredRevenue}`;
  totalRevenueElement.textContent = `₹${totalRevenue}`;
  occupiedBedsElement.textContent = occupiedBeds;
}

document.getElementById("monthSelector").addEventListener("change", function() {
  const selectedMonth = this.value;
  loadRooms(selectedMonth);
});

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

  let hiddenInput = form.querySelector("input[name='recordId']");
  if (!hiddenInput) {
    hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "recordId";
    form.appendChild(hiddenInput);
  }
  hiddenInput.value = recordId;
}

async function deleteRoom(recordId) {
  const response = await fetch(`https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms/${recordId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
    },
  });

  if (response.ok) {
    showToast("✅ Room deleted successfully!");
    await loadRooms();
  } else {
    console.error("Error deleting room:", await response.json());
  }
}

function logout() {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "login.html";
}

function removeHiddenRecordId() {
  const hiddenInput = form.querySelector("input[name='recordId']");
  if (hiddenInput) {
    hiddenInput.remove();
  }
}

loadRooms();
document.getElementById("logoutButton").addEventListener("click", logout);
