let ClientId = ""
let token = ""

document.addEventListener("DOMContentLoaded", () => {
  const contentDiv = document.getElementById("content");

  function setupSearch() {
    const searchButton = document.getElementById("search-button");
    if (searchButton) {
      searchButton.addEventListener("click", async () => {
        const name = document.getElementById("name-input").value;
        const selectedUser = document.getElementById("user-dropdown").value;

        if (name) {
          try {
            const avatarResponse = await fetch(
              `https://decapi.me/twitch/avatar/${name}`
            );
            const idResponse = await fetch(
              `https://decapi.me/twitch/id/${name}`
            );

            const avatarUrl = await avatarResponse.text();
            const id = await idResponse.text();
            const color = await fetchChatColor(id);
            let IsBroadcaster = name.toLowerCase() === selectedUser.toLowerCase();
            let html = sessionStorage.getItem("searchHtml");
            if (!html) {
              const response = await fetch("search.html");
              html = await response.text();
              // sessionStorage.setItem("searchHtml", html);
            }

            contentDiv.innerHTML = html;
            document.getElementById("user-name").innerText = name;
            document.getElementById("user-name").style.color = color;
            document.getElementById("user-id").innerText = id;
            document.getElementById("avatar-img").src = avatarUrl;
            const style = document.createElement("style");
            style.innerHTML = `
              #avatar-img:hover {
                box-shadow: 0 0 50px ${color};
              }
            `;
            document.head.appendChild(style);

            if (IsBroadcaster) {
              document.getElementById("add-vip").disabled = true;
              document.getElementById("add-mod").disabled = true;
              document.getElementById("ban").disabled = true;
              document.getElementById("timeout-custom").disabled = true;
              document.getElementById("shoutout").disabled = true;
              document.getElementById("shoutout").style.display = "none";
              const timeoutButtons = document.querySelectorAll(".timeout-btn");
              timeoutButtons.forEach((button) => {
                button.disabled = true;
              });
            } else {
              setupActions(name);
            }
            const backButton = document.getElementById("back");
            const NativeUserCardButton = document.getElementById("native-user-card");
            const idButton = document.getElementById("id-btn");
            if (NativeUserCardButton) {
              NativeUserCardButton.addEventListener("click", () => {
                window.open(`https://www.twitch.tv/popout/${selectedUser}/viewercard/${name}?popout=`, "_blank");
              });
            }
            if (idButton) {
              const id = document.getElementById("user-id").innerText;
              navigator.clipboard.writeText(id)
              console.log(`Copied user ID to clipboard: ${id}`);
            }
            if (backButton) {
              backButton.addEventListener("click", async () => {
                const indexResponse = await fetch("index.html");
                const indexHtml = await indexResponse.text();
                contentDiv.innerHTML = indexHtml;
                setupSearch(); // Re-attach event listeners
              });
            }
          } catch (error) {
            console.error("Error loading content:", error);
          }
        }
      });
    }
  }

  function setupActions(name) {
    const actionButtons = document.querySelectorAll(
      "#shoutout, #add-vip, #add-mod, #ban, .timeout-btn, #timeout-custom"
    );
    actionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.classList.contains("timeout-btn")) {
          return console.log(
            `Timeout ${name} for ${button.getAttribute("data-time")} seconds`
          );
        } else if (button.id === "timeout-custom") {
          const customTime = document.getElementById("custom-time").value;
          return console.log(`Timeout ${name} for ${customTime} seconds`);
        }
        if (button.id == "add-vip") {
          return console.log(`Added VIP status to ${name}`);
        }
        if (button.id == "add-mod") {
          return console.log(`Added MOD status to ${name}`);
        }
        if (button.id == "ban") {
          return console.log(`Ban ${name}`);
        }
        if (button.id == "shoutout") {
          return console.log(`shoutouting out ${name}`);
        } else {
          console.log(`${`ID: ${button.id}` || `${button.className}`} is unhandled!`);
        }
      });
    });
  }

  setupSearch(); // Initial setup
});

async function fetchChatColor(id) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/chat/color?user_id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": ClientId,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].color;
  } catch (error) {
    console.error("Error fetching chat color:", error);
  }
}
