document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement('div');
        participantsSection.className = 'participants-section';
        const participantsTitle = document.createElement('h5');
        participantsTitle.textContent = 'Participants';
        participantsSection.appendChild(participantsTitle);

        if (details.participants.length > 0) {
          const participantsList = document.createElement('div');
          participantsList.className = 'participants-list';
          details.participants.forEach(email => {
            const row = document.createElement('div');
            row.className = 'participant-row';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = email;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&#128465;'; // Trash can icon
            deleteBtn.title = 'Unregister';
            deleteBtn.onclick = async function() {
              await unregisterParticipant(name, email);
            };
            row.appendChild(nameSpan);
            row.appendChild(deleteBtn);
            participantsList.appendChild(row);
          });
          participantsSection.appendChild(participantsList);
        } else {
          const info = document.createElement('p');
          info.className = 'info';
          info.textContent = 'No participants yet.';
          participantsSection.appendChild(info);
        }
        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Immediately update activities list after successful signup
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Unregister participant function
  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message || 'Participant unregistered.';
        messageDiv.className = 'success';
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || 'Failed to unregister participant.';
        messageDiv.className = 'error';
      }
      messageDiv.classList.remove('hidden');
      setTimeout(() => {
        messageDiv.classList.add('hidden');
      }, 5000);
    } catch (error) {
      messageDiv.textContent = 'Error unregistering participant.';
      messageDiv.className = 'error';
      messageDiv.classList.remove('hidden');
      console.error('Error unregistering:', error);
    }
  }

  // Initialize app
  fetchActivities();
});
