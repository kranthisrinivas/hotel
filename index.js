const form = document.getElementById("manageRoomsForm");
let existingIdProofUrl = ""; // Track existing ID proof

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

  let idProofUrl = existingIdProofUrl; // Default to existing

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
        existingIdProofUrl = "";
        removeHiddenRecordId();
        document.getElementById("existingIdProofPreview").innerHTML = "";
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
        existingIdProofUrl = "";
        document.getElementById("existingIdProofPreview").innerHTML = "";
        await loadRooms();
      } else {
        console.error("Airtable error during add:", await response.json());
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  }
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

  // Set existing ID proof
  existingIdProofUrl = record.IDProofUrl || "";
  const idProofPreview = document.getElementById("existingIdProofPreview");
  if (existingIdProofUrl) {
    idProofPreview.innerHTML = `
      <a href="${existingIdProofUrl}" target="_blank">
        <img src="${existingIdProofUrl}" alt="Existing ID Proof" style="width: 100px; height: auto; margin-top: 8px; border: 1px solid #ccc; padding: 4px;">
      </a>
    `;
  } else {
    idProofPreview.innerHTML = "";
  }

  let hiddenInput = form.querySelector("input[name='recordId']");
  if (!hiddenInput) {
    hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "recordId";
    form.appendChild(hiddenInput);
  }
  hiddenInput.value = recordId;
}

function removeHiddenRecordId() {
  const hiddenInput = form.querySelector("input[name='recordId']");
  if (hiddenInput) {
    hiddenInput.remove();
  }
}
const airtableBaseUrl = "https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms";
const airtableApiKey = "pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b";

async function loadRooms() {
  const tableBody = document.querySelector("#roomsTable tbody");
  tableBody.innerHTML = ""; // Clear old table rows

  let occupiedBedsCount = 0;
  let totalRevenue = 0;

  try {
    const response = await fetch(airtableBaseUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
      },
    });
    const data = await response.json();

    data.records.forEach(record => {
      const fields = record.fields;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${fields.RoomNumber || ""}</td>
        <td>${fields.BedNumber || ""}</td>
        <td>${fields.TenantName || ""}</td>
        <td>${fields.PhoneNumber || ""}</td>
        <td>${fields.PaymentMade || ""}</td>
        <td>${fields.PaymentMethod || ""}</td>
        <td>₹${fields.AmountPaid || 0}</td>
        <td>
          ${fields.IDProofUrl ? `<a href="${fields.IDProofUrl}" target="_blank">View</a>` : ""}
        </td>
        <td>${fields.Comments || ""}</td>
        <td class="action-btns">
          <button class="edit-btn" onclick="editRoom('${record.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteRoom('${record.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);

      // Counting occupied beds and revenue
      if (fields.TenantName) {
        occupiedBedsCount += 1;
      }
      if (fields.PaymentMade === "Yes" && fields.AmountPaid) {
        totalRevenue += fields.AmountPaid;
      }
    });

    // Update dashboard stats
    document.getElementById("occupiedBeds").textContent = occupiedBedsCount;
    document.getElementById("revenue").textContent = `₹${totalRevenue}`;
    document.getElementById("totalRevenue").textContent = `₹${totalRevenue}`;

  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}

async function deleteRoom(recordId) {
  const confirmDelete = confirm("Are you sure you want to delete this room?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${airtableBaseUrl}/${recordId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
      },
    });

    if (response.ok) {
      showToast("✅ Room deleted successfully!");
      await loadRooms(); // Refresh table
    } else {
      console.error("Failed to delete:", await response.json());
    }
  } catch (error) {
    console.error("Error deleting room:", error);
  }
}

// Dummy function for editRoom (you can build later)
async function editRoom(recordId) {
  try {
    const response = await fetch(`${airtableBaseUrl}/${recordId}`, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
      },
    });
    const data = await response.json();
    const fields = data.fields;

    const newTenantName = prompt("Edit Tenant Name:", fields.TenantName || "");
    const newPhoneNumber = prompt("Edit Phone Number:", fields.PhoneNumber || "");
    const newPaymentMade = prompt("Payment Made? (Yes/No):", fields.PaymentMade || "No");
    const newPaymentMethod = prompt("Edit Payment Method:", fields.PaymentMethod || "");
    const newAmountPaid = parseFloat(prompt("Edit Amount Paid:", fields.AmountPaid || "0")) || 0;
    const newComments = prompt("Edit Comments:", fields.Comments || "");

    const updatedFields = {
      TenantName: newTenantName,
      PhoneNumber: newPhoneNumber,
      PaymentMade: newPaymentMade,
      PaymentMethod: newPaymentMethod,
      AmountPaid: newAmountPaid,
      Comments: newComments,
    };

    const updateResponse = await fetch(`${airtableBaseUrl}/${recordId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: updatedFields }),
    });

    if (updateResponse.ok) {
      showToast("✅ Room updated successfully!");
      await loadRooms(); // Refresh table
    } else {
      console.error("Failed to update:", await updateResponse.json());
    }
  } catch (error) {
    console.error("Error editing room:", error);
  }
}

// Simple toast message
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Load rooms when page loads
window.addEventListener("DOMContentLoaded", loadRooms);

