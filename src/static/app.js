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
      // Reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants section using DOM nodes so we can attach delete handlers
        const participants = details.participants || [];
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const title = document.createElement("strong");
        title.textContent = "Participants";
        participantsSection.appendChild(title);

        if (participants.length === 0) {
          const noPar = document.createElement("p");
          noPar.className = "no-participants";
          noPar.textContent = "No participants yet";
          participantsSection.appendChild(noPar);
        } else {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const span = document.createElement("span");
            span.className = "participant-email";
            span.textContent = p;

            const btn = document.createElement("button");
            btn.className = "delete-participant";
            btn.title = `Remove ${p}`;
            btn.innerHTML = '&times;';

            // Delete handler
            btn.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (!confirm(`Remove ${p} from ${name}?`)) return;
              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );
                const result = await res.json();
                if (res.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = "success";
                  // Refresh activities after successful delete
                  await fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "An error occurred";
                  messageDiv.className = "error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => messageDiv.classList.add("hidden"), 5000);
              } catch (err) {
                messageDiv.textContent = "Failed to remove participant.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                console.error(err);
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

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
        // Refresh activities list to show the newly signed up participant
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

  // Initialize app
  fetchActivities();
});
