const form = document.getElementById("manageRoomsForm");
const monthSelector = document.getElementById("monthSelector");
let existingIdProofUrl = "";
let editingRecordId = null;

const airtableBaseUrl = "https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms";
const airtableApiKey = "pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b";

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

function removeHiddenRecordId() {
  editingRecordId = null;
  form.querySelector("input[name='recordId']")?.remove();
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
  const paymentMonth = form.paymentMonth.value;
  const idProofFile = form.idProof.files[0];

  let idProofUrl = existingIdProofUrl;

  if (!roomNumber || !bedNumber || !tenantName || !phoneNumber || !paymentMade || !paymentMethod || !paymentMonth || isNaN(amountPaid)) {
    alert("Please fill out all required fields.");
    return;
  }

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
  }

  if (!idProofUrl) {
    alert('Please upload ID Proof');
    return;
  }

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

  try {
    const url = editingRecordId ? `${airtableBaseUrl}/${editingRecordId}` : airtableBaseUrl;
    const method = editingRecordId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      showToast(editingRecordId ? "✅ Room updated successfully!" : "✅ Room added successfully!");
      form.reset();
      existingIdProofUrl = "";
      removeHiddenRecordId();
      document.getElementById("existingIdProofPreview").innerHTML = "";
      await loadRooms();
    } else {
      console.error("Airtable error:", await response.json());
    }
  } catch (error) {
    console.error("Error submitting data:", error);
  }
});

async function editRoom(recordId) {
  try {
    const response = await fetch(`${airtableBaseUrl}/${recordId}`, {
      headers: { Authorization: `Bearer ${airtableApiKey}` },
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
    form.paymentMonth.value = record.PaymentMonth || "";

    existingIdProofUrl = record.IDProofUrl || "";

    const idProofPreview = document.getElementById("existingIdProofPreview");
    idProofPreview.innerHTML = existingIdProofUrl
      ? `<a href="${existingIdProofUrl}" target="_blank">
          <img src="${existingIdProofUrl}" alt="Existing ID Proof" style="width: 100px; height: auto; margin-top: 8px; border: 1px solid #ccc; padding: 4px;">
        </a>`
      : "";

    let hiddenInput = form.querySelector("input[name='recordId']");
    if (!hiddenInput) {
      hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "recordId";
      form.appendChild(hiddenInput);
    }
    hiddenInput.value = recordId;

    editingRecordId = recordId;
  } catch (error) {
    console.error("Error loading room for edit:", error);
  }
}

async function deleteRoom(recordId) {
  if (!confirm("Are you sure you want to delete this room?")) return;

  try {
    const response = await fetch(`${airtableBaseUrl}/${recordId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${airtableApiKey}` },
    });

    if (response.ok) {
      showToast("✅ Room deleted successfully!");
      await loadRooms();
    } else {
      console.error("Failed to delete:", await response.json());
    }
  } catch (error) {
    console.error("Error deleting room:", error);
  }
}

async function loadRooms() {
  const tableBody = document.querySelector("#roomsTable tbody");
  tableBody.innerHTML = "";

  let occupiedBedsCount = 0;
  let totalRevenue = 0;
  const monthRevenue = {};

  const selectedMonth = monthSelector.value; // Month filter

  try {
    const response = await fetch(airtableBaseUrl, {
      headers: { Authorization: `Bearer ${airtableApiKey}` },
    });
    const data = await response.json();
    const paymentMonths = new Set();

    data.records.forEach(record => {
      const fields = record.fields;
      const paymentMonth = fields.PaymentMonth || "Unknown";

      if (fields.PaymentMade === "Yes" && fields.AmountPaid) {
        if (!monthRevenue[paymentMonth]) {
          monthRevenue[paymentMonth] = 0;
        }
        monthRevenue[paymentMonth] += fields.AmountPaid;
      }

      paymentMonths.add(paymentMonth);

      const shouldDisplay = !selectedMonth || selectedMonth === paymentMonth;
      if (shouldDisplay) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${fields.RoomNumber || ""}</td>
          <td>${fields.BedNumber || ""}</td>
          <td>${fields.TenantName || ""}</td>
          <td>${fields.PhoneNumber || ""}</td>
          <td>${fields.PaymentMade || ""}</td>
          <td>${fields.PaymentMethod || ""}</td>
          <td>₹${fields.AmountPaid || 0}</td>
          <td>${fields.PaymentMonth || ""}</td>
          <td>${fields.IDProofUrl ? `<a href="${fields.IDProofUrl}" target="_blank">View</a>` : ""}</td>
          <td>${fields.Comments || ""}</td>
          <td class="action-btns">
            <button class="edit-btn" onclick="editRoom('${record.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteRoom('${record.id}')">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      }

      if (fields.TenantName) occupiedBedsCount += 1;
    });

    const revenue = selectedMonth ? (monthRevenue[selectedMonth] || 0) : Object.values(monthRevenue).reduce((a, b) => a + b, 0);

    document.getElementById("occupiedBeds").textContent = occupiedBedsCount;
    document.getElementById("revenue").textContent = `₹${revenue}`;
    document.getElementById("totalRevenue").textContent = `₹${Object.values(monthRevenue).reduce((a, b) => a + b, 0)}`;

    // Populate month selector dynamically
    monthSelector.innerHTML = `<option value="">All Months</option>`;
    [...paymentMonths].forEach(month => {
      const option = document.createElement("option");
      option.value = month;
      option.textContent = month;
      if (month === selectedMonth) {
        option.selected = true;
      }
      monthSelector.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}

// Month selector onchange
monthSelector.addEventListener("change", loadRooms);

// Initial Load
loadRooms();

// Logout
document.getElementById("logoutBtn").addEventListener("click", function() {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "login.html";
});
