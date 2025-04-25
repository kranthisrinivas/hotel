document.getElementById("manageRoomsForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the form from submitting normally

  // Get the values from the form
  const formData = new FormData(event.target);
  const roomNumber = formData.get('roomNumber');
  const bedNumber = formData.get('bedNumber');
  const tenantName = formData.get('tenantName');
  const phoneNumber = formData.get('phoneNumber');
  const paymentMade = formData.get('paymentMade');
  const paymentMethod = formData.get('paymentMethod');
  const amountPaid = formData.get('amountPaid');
  const comments = formData.get('comments');

  // Prepare data to send to Airtable
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

  // Send data to Airtable using Fetch API
  fetch("https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms", {
    method: "POST",
    headers: {
      "Authorization": "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Data successfully submitted to Airtable:", data);
    alert("Room details added successfully!");
    // Optionally, reset the form after submission
    document.getElementById("manageRoomsForm").reset();
  })
  .catch(error => {
    console.error("Error submitting data:", error);
    alert("Failed to submit room details.");
  });
});
