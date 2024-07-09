let Token;
let ClientId;
let BroadcasterId;

document.addEventListener("DOMContentLoaded", async () => {
  const contentDiv = document.getElementById("content");
  await window.electron.ipcRenderer.invoke('get-user-data').then((data) => {
    Token = data.Token;
    ClientId = data.ClientId;
    BroadcasterId = data.BroadcasterId;
  });
  
  console.log("🚀 ~ Token:", Token)
  async function fetchChatColor(id) {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/chat/color?user_id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.data[0].color === "") return "#FFF";
      return data.data[0].color;
    } catch (error) {
      console.error("Error fetching chat color:", error);
    }
  }

  async function fetchBanStatus(id) {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/moderation/banned?broadcaster_id=${BroadcasterId}&user_id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.data[0]) return false;
      let { moderator_name, reason, expires_at } = data.data[0];
      if (expires_at) {
        return { who: moderator_name, why: reason, expires_at };
      }
      if (reason === "") reason = undefined;
      if (data.data[0]) return { who: moderator_name, why: reason };
    } catch (error) {
      console.error("Error fetching ban:", error);
    }
  }

  async function fetchModStatus(id) {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${BroadcasterId}&user_id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.data[0]) return true;
      else return false;
    } catch (error) {
      console.error("Error fetching mod:", error);
    }
  }

  async function fetchVIPStatus(id) {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/channels/vips?broadcaster_id=${BroadcasterId}&user_id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.data[0]) return true;
      else return false;
    } catch (error) {
      console.error("Error fetching mod:", error);
    }
  }

  async function modUser(id) {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${BroadcasterId}&user_id=${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error fetching mod:", error);
    }
  }

  async function revokeModUser(id) {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${BroadcasterId}&user_id=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error fetching mod:", error);
    }
  }

  async function unbanUser(userId) {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${BroadcasterId}&moderator_id=${BroadcasterId}&user_id=${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error unbanning user:", error);
      return false;
    }
  }

  async function banUser(userId) {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${BroadcasterId}&moderator_id=${BroadcasterId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              user_id: userId,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error banning user:", error);
      return false;
    }
  }

  async function timeoutUser(userId, duration) {
    if (duration < 1 || duration > 1209600) {
      return console.error(
        "The minimum timeout is 1 second and the maximum is 1,209,600 seconds (2 weeks)."
      );
    }
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${BroadcasterId}&moderator_id=${BroadcasterId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Token}`,
            "Client-Id": ClientId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              user_id: userId,
              duration: duration,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error timing out user:", error);
      return false;
    }
  }

  async function setupActions(name, id, isBanned, isMod, isVIP) {
    const actionButtons = document.querySelectorAll(
      "#shoutout, #add-vip, #add-mod, #ban, .timeout-btn, #timeout-custom, #remove-timeout-btn"
    );
    actionButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        if (button.classList.contains("timeout-btn")) {
          let duration = button.getAttribute("data-time");
          let timeoutUserResult = await timeoutUser(id, duration);
          if (timeoutUserResult) {
            await refreshUserView(name);
            return;
          } else {
            console.error(`Failed to timeout user ${name} for ${duration}`);
            return;
          }
        } else if (button.id === "timeout-custom") {
          const customTime = document.getElementById("custom-time").value;
          let timeoutUserResult = await timeoutUser(id, customTime);
          if (timeoutUserResult) {
            await refreshUserView(name);
            return;
          } else {
            console.error(`Failed to timeout user ${name} for ${customTime}`);
            return;
          }
        } else if (button.id === "remove-timeout-btn") {
          let unbanUserResult = await unbanUser(id);
          if (unbanUserResult) {
            await refreshUserView(name);
            return;
          } else {
            console.error(`Failed to remove timeout for user ${name}`);
            return;
          }
        }

        if (button.id == "add-vip") {
          return console.log(`Added VIP status to ${name}`);
        }
        if (button.id == "add-mod") {
          console.log(`lol`);
          console.log("🚀 ~ button.addEventListener ~ isMod:", isMod);
          if (isMod) {
            let removeModResult = await revokeModUser(id);
            if (removeModResult) {
              await refreshUserView(name);
              return;
            }
          } else {
            let addModResult = await modUser(id);
            if (addModResult) {
              await refreshUserView(name);
              return;
            } else {
              console.error(`Failed to add MOD status to user ${name}`);
              return;
            }
          }
          return console.log(`Added MOD status to ${name}`);
        }
        if (button.id == "ban") {
          if (isBanned) {
            let unbanUserResult = await unbanUser(id);
            if (unbanUserResult) {
              await refreshUserView(name);
              return;
            } else {
              console.error(`Failed to unban user ${name}`);
              return;
            }
          } else {
            let banUserResult = await banUser(id);
            if (banUserResult) {
              await refreshUserView(name);
              return;
            } else {
              console.error(`Failed to ban user ${name}`);
              return;
            }
          }
        }
        if (button.id == "shoutout") {
          return console.log(`Shoutouting out ${name}`);
        } else {
          console.log(
            `${button.id ? `ID: ${button.id}` : button.className} is unhandled!`
          );
        }
      });
    });
  }

  async function refreshUserView(name) {
    console.log(`Refreshing ${name}'s data`);
    const contentDiv = document.getElementById("content");
    try {
      const avatarResponse = await fetch(
        `https://decapi.me/twitch/avatar/${name}`
      );
      const idResponse = await fetch(`https://decapi.me/twitch/id/${name}`);

      const avatarUrl = await avatarResponse.text();
      const id = await idResponse.text();
      const color = await fetchChatColor(id);
      let isBanned = await fetchBanStatus(id);
      let isMod = await fetchModStatus(id);
      let isVIP = await fetchVIPStatus(id);
      let html = sessionStorage.getItem("searchHtml");
      if (!html) {
        const response = await fetch("search.html");
        html = await response.text();
        sessionStorage.setItem("searchHtml", html);
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

      const banTextElement = document.getElementById("ban-text");

      if (isBanned && isBanned.expires_at) {
        document.getElementById("ban").disabled = true;
        document.getElementById("avatar-img").style.filter = "blur(7px)";
        document.getElementById("add-vip").disabled = true;
        document.getElementById("add-mod").disabled = true;
        document.getElementById("timeout-custom").disabled = true;
        document.getElementById("shoutout").disabled = true;
        document.getElementById("shoutout").style.display = "none";
        const timeoutButtons = document.querySelectorAll(".timeout-btn");
        timeoutButtons.forEach((button) => {
          button.disabled = true;
        });
        banTextElement.innerText = `Banned By ${isBanned.who} \n Why: ${
          isBanned.why ? isBanned.why : "No Reason Given"
        }`;
        setupActions(name, id, isBanned, isMod, isVIP);

        const expirationTime = new Date(isBanned.expires_at).getTime();
        const updateCountdown = () => {
          const now = new Date().getTime();
          const timeLeft = expirationTime - now;

          if (timeLeft > 0) {
            const hours = Math.floor(
              (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            banTextElement.innerText = `Timed Out By ${isBanned.who} \n Why: ${
              isBanned.why ? isBanned.why : "No Reason Given"
            } \n Expires in ${hours}h ${minutes}m ${seconds}s`;
          } else {
            clearInterval(interval);

            refreshUserView(name);
          }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
      } else if (isBanned) {
        document.getElementById("ban").innerText = "Unban";
        document.getElementById("avatar-img").style.filter = "blur(7px)";
        document.getElementById("add-vip").disabled = true;
        document.getElementById("add-mod").disabled = true;
        document.getElementById("timeout-custom").disabled = true;
        document.getElementById("shoutout").disabled = true;
        document.getElementById("shoutout").style.display = "none";
        const timeoutButtons = document.querySelectorAll(".timeout-btn");
        timeoutButtons.forEach((button) => {
          button.disabled = true;
        });
        banTextElement.innerText = `Banned By ${isBanned.who} \n Why: ${
          isBanned.why ? isBanned.why : "No Reason Given"
        }`;
        setupActions(name, id, isBanned, isMod, isVIP);
      } else if (isMod) {
        document.getElementById("add-mod").innerText = "Revoke Mod";
        setupActions(name, id, isBanned, isMod, isVIP);
      } else if (isVIP) {
        document.getElementById("add-vip").innerText = "Revoke VIP";
        setupActions(name, id, isBanned, isMod, isVIP);
      } else {
        setupActions(name, id, isMod, isVIP);
      }

      const backButton = document.getElementById("back");
      const refreshButton = document.getElementById("refresh");
      const NativeUserCardButton = document.getElementById("native-user-card");
      const idButton = document.getElementById("id-btn");
      if (NativeUserCardButton) {
        NativeUserCardButton.addEventListener("click", () => {
          window.open(
            `https://www.twitch.tv/popout/${name}/viewercard/${name}?popout=`,
            "_blank"
          );
        });
      }
      if (idButton) {
        idButton.addEventListener("click", () => {
          const id = document.getElementById("user-id").innerText;
          navigator.clipboard.writeText(id);
          console.log(`Copied user ID to clipboard: ${id}`);
        });
      }
      if (backButton) {
        backButton.addEventListener("click", async () => {
          const indexResponse = await fetch("index.html");
          const indexHtml = await indexResponse.text();
          contentDiv.innerHTML = indexHtml;
          setupSearch(); // Re-attach event listeners
        });
      }
      if (refreshButton) {
        refreshButton.addEventListener("click", async () => {
          refreshUserView(name);
        });
      }
    } catch (error) {
      console.error("Error refreshing user view:", error);
    }
  }

  async function setupSearch() {
    const searchButton = document.getElementById("search-button");

    if (searchButton) {
      searchButton.addEventListener("click", async () => {
        const name = document.getElementById("name-input").value;
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
            let isBanned = await fetchBanStatus(id);
            let IsBroadcaster = id === BroadcasterId;
            let isMod = await fetchModStatus(id);
            let isVIP = await fetchVIPStatus(id);
            let html = sessionStorage.getItem("searchHtml");
            if (!html) {
              const response = await fetch("search.html");
              html = await response.text();
              sessionStorage.setItem("searchHtml", html);
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

            const banTextElement = document.getElementById("ban-text");

            if (IsBroadcaster) {
              document.getElementById("add-vip").disabled = true;
              document.getElementById("add-mod").disabled = true;
              document.getElementById("ban").disabled = true;
              document.getElementById("timeout-custom").disabled = true;
              document.getElementById("shoutout").disabled = true;
              document.getElementById("shoutout").style.display = "none";
              let timeoutButtons = document.querySelectorAll(".timeout-btn");
              timeoutButtons.forEach((button) => {
                button.disabled = true;
              });
            } else if (isBanned && isBanned.expires_at) {
              document.getElementById("ban").disabled = true;
              document.getElementById("avatar-img").style.filter = "blur(7px)";
              document.getElementById("add-vip").disabled = true;
              document.getElementById("add-mod").disabled = true;
              document.getElementById("timeout-custom").disabled = true;
              document.getElementById("shoutout").disabled = true;
              document.getElementById("shoutout").style.display = "none";
              let timeoutButton = document.querySelectorAll(".timeout-btn");
              timeoutButton.forEach((button) => {
                button.disabled = true;
              });
              banTextElement.innerText = `Banned By ${isBanned.who} \n Why: ${
                isBanned.why ? isBanned.why : "No Reason Given"
              }`;
              setupActions(name, id, isBanned, isMod, isVIP);

              const expirationTime = new Date(isBanned.expires_at).getTime();
              const updateCountdown = () => {
                const now = new Date().getTime();
                const timeLeft = expirationTime - now;

                if (timeLeft > 0) {
                  const hours = Math.floor(
                    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  const minutes = Math.floor(
                    (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                  banTextElement.innerText = `Timed Out By ${
                    isBanned.who
                  } \n Why: ${
                    isBanned.why ? isBanned.why : "No Reason Given"
                  } \n Expires in ${hours}h ${minutes}m ${seconds}s`;
                } else {
                  clearInterval(interval);

                  refreshUserView(name);
                }
              };

              updateCountdown();
              const interval = setInterval(updateCountdown, 1000);

              document.getElementById("ban").disabled = true;
              document.getElementById("avatar-img").style.filter = "blur(7px)";
              document.getElementById("add-vip").disabled = true;
              document.getElementById("add-mod").disabled = true;
              document.getElementById("timeout-custom").disabled = true;
              document.getElementById("shoutout").disabled = true;
              document.getElementById("shoutout").style.display = "none";
              const timeoutButtons = document.querySelectorAll(".timeout-btn");
              timeoutButtons.forEach((button) => {
                button.disabled = true;
              });
              setupActions(name, id, isBanned, isMod, isVIP);
            } else if (isBanned) {
              document.getElementById("ban").innerText = "Unban";
              document.getElementById("avatar-img").style.filter = "blur(7px)";
              document.getElementById("add-vip").disabled = true;
              document.getElementById("add-mod").disabled = true;
              document.getElementById("timeout-custom").disabled = true;
              document.getElementById("shoutout").disabled = true;
              document.getElementById("shoutout").style.display = "none";
              const timeoutButtons = document.querySelectorAll(".timeout-btn");
              timeoutButtons.forEach((button) => {
                button.disabled = true;
              });
              banTextElement.innerText = `Banned By ${isBanned.who} \n Why: ${
                isBanned.why ? isBanned.why : "No Reason Given"
              }`;
              setupActions(name, id, isBanned, isMod, isVIP);
            } else if (isMod) {
              document.getElementById("add-mod").innerText = "Revoke Mod";
              setupActions(name, id, isBanned, isMod, isVIP);
            } else if (isVIP) {
              document.getElementById("add-vip").innerText = "Revoke VIP";
              setupActions(name, id, isBanned, isMod, isVIP);
            } else {
              setupActions(name, id, isMod, isVIP);
            }

            const backButton = document.getElementById("back");
            const NativeUserCardButton =
              document.getElementById("native-user-card");
            const refreshButton = document.getElementById("refresh");
            const idButton = document.getElementById("id-btn");
            if (refreshButton) {
              refreshButton.addEventListener("click", async () => {
                console.log("Refreshing");
                refreshUserView(name);
              });
            }
            if (NativeUserCardButton) {
              NativeUserCardButton.addEventListener("click", () => {
                window.open(
                  `https://www.twitch.tv/popout/${selectedUser}/viewercard/${name}?popout=`,
                  "_blank"
                );
              });
            }
            if (idButton) {
              idButton.addEventListener("click", () => {
                const id = document.getElementById("user-id").innerText;
                navigator.clipboard.writeText(id);
                console.log(`Copied user ID to clipboard: ${id}`);
              });
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

  setupSearch(); // Initial setup
});
