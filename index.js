const form = document.getElementById("manageRoomsForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const roomNumber = form.roomNumber.value;
  const bedNumber = form.bedNumber.value;
  const tenantName = form.tenantName.value;
  const phoneNumber = form.phoneNumber.value;
  const paymentMade = form.paymentMade.value;
  const paymentMethod = form.paymentMethod.value;
  const amountPaid = parseFloat(form.amountPaid.value); // ✅ Convert to number
  const comments = form.comments.value;

  const data = {
    fields: {
      RoomNumber: roomNumber,
      BedNumber: bedNumber,
      TenantName: tenantName,
      PhoneNumber: phoneNumber,
      PaymentMade: paymentMade,
      PaymentMethod: paymentMethod,
      AmountPaid: amountPaid, // ✅ Must be a number
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
    console.log("Data successfully submitted to Airtable:", result);

    if (response.ok) {
      alert("Room details added successfully!");
      form.reset();
    } else {
      console.error("Airtable error:", result);
    }
  } catch (error) {
    console.error("Error submitting data:", error);
  }
});

