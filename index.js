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
          Comments: comments,
        }
      };

      const recordId = form.querySelector("input[name='recordId']")?.value;

      if (recordId) {
        // Update the existing record (PATCH)
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
            alert("Room details updated successfully!");
            form.reset();
            loadRooms(); // Reload the data after update
          } else {
            console.error("Airtable error:", await response.json());
          }
        } catch (error) {
          console.error("Error updating data:", error);
        }
      } else {
        // Create new record (POST)
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
            alert("Room details added successfully!");
            form.reset();
            loadRooms(); // Reload the data after submission
          } else {
            console.error("Airtable error:", await response.json());
          }
        } catch (error) {
          console.error("Error submitting data:", error);
        }
      }
    });

    async function loadRooms() {
      const response = await fetch("https://api.airtable.com/v0/appY6ucd2CU1tr5AH/Rooms", {
        method: "GET",
        headers: {
          Authorization: "Bearer pat9VLsxcOkP4PdEy.6730536908ce848e0ccc8517889828b0e427bc3612eab0777e14899f0f61d04b",
        },
      });

      const data = await response.json();
      const tableBody = document.querySelector("#roomsTable tbody");
      tableBody.innerHTML = ""; // Clear existing rows

      data.records.forEach((record) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${record.fields.RoomNumber}</td>
          <td>${record.fields.BedNumber}</td>
          <td>${record.fields.TenantName}</td>
          <td>${record.fields.PhoneNumber}</td>
          <td>${record.fields.PaymentMade}</td>
          <td>${record.fields.PaymentMethod}</td>
          <td>${record.fields.AmountPaid}</td>
          <td>${record.fields.Comments}</td>
          <td class="action-btns">
            <button class="edit-btn" onclick="editRoom('${record.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteRoom('${record.id}')">Delete</button>
          </td>
        `;

        tableBody.appendChild(row);
      });
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

      form.roomNumber.value = record.RoomNumber;
      form.bedNumber.value = record.BedNumber;
      form.tenantName.value = record.TenantName;
      form.phoneNumber.value = record.PhoneNumber;
      form.paymentMade.value = record.PaymentMade;
      form.paymentMethod.value = record.PaymentMethod;
      form.amountPaid.value = record.AmountPaid;
      form.comments.value = record.Comments;

      // Add hidden input for recordId
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

      const result = await response.json();
      if (response.ok) {
        alert("Room deleted successfully!");
        loadRooms(); // Reload the data after deletion
      } else {
        console.error("Error deleting room:", result);
      }
    }

    // Load rooms data on initial load
    loadRooms();
  </script>
