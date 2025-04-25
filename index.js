const form = document.getElementById("manageRoomsForm");

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
    console.log("Amount Paid Value:", amountPaid);

    if (response.ok) {
      alert("Room details added successfully!");
      form.reset();
      fetchRoomsFromAirtable(); // 👈 Refresh table after submission
    } else {
      console.error("Airtable error:", result);
    }
  } catch (error) {
    console.error("Error submitting data:", error);
  }
});


// ✅ 1. Fetch data from Airtable
const fetchRoomsFromAirtable = async () => {
  const airtableApiKey = "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b";
  const baseId = "appY6ucd2CU1tr5AH";
  const tableName = "Rooms";

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: {
        Authorization: airtableApiKey,
      },
    });

    const data = await response.json();

    if (data.records) {
      populateTable(data.records);
    } else {
      console.error("No records found");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// ✅ 2. Populate HTML table with records
const populateTable = (records) => {
  const tbody = document.querySelector("#roomsTable tbody");
  tbody.innerHTML = "";

  records.forEach((record) => {
    const fields = record.fields;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${fields.RoomNumber || ""}</td>
      <td>${fields.BedNumber || ""}</td>
      <td>${fields.TenantName || ""}</td>
      <td>${fields.PhoneNumber || ""}</td>
      <td>${fields.PaymentMade || ""}</td>
      <td>${fields.PaymentMethod || ""}</td>
      <td>${fields.AmountPaid || ""}</td>
      <td>${fields.Comments || ""}</td>
    `;
    tbody.appendChild(row);
  });
};

// ✅ 3. Fetch data when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchRoomsFromAirtable();
});
