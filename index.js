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
