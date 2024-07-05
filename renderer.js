document.addEventListener('DOMContentLoaded', () => {
  const contentDiv = document.getElementById('content');

  function setupSearch() {
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
      searchButton.addEventListener('click', async () => {
        const name = document.getElementById('name-input').value;
        if (name) {
          try {
            const avatarResponse = await fetch(`https://decapi.me/twitch/avatar/${name}`);
            const idResponse = await fetch(`https://decapi.me/twitch/id/${name}`);

            const avatarUrl = await avatarResponse.text();
            const id = await idResponse.text();
            const color = await fetchChatColor(id)
            
            let html = sessionStorage.getItem('searchHtml');
            if (!html) {
              const response = await fetch('search.html');
              html = await response.text();
              sessionStorage.setItem('searchHtml', html);
            }
            
            contentDiv.innerHTML = html;
            document.getElementById('user-name').innerText = name;
            document.getElementById('user-name').style.color = color;
            document.getElementById('user-id').innerText = id;
            document.getElementById('avatar-img').src = avatarUrl;
            const style = document.createElement('style');
            style.innerHTML = `
              #avatar-img:hover {
                box-shadow: 0 0 50px ${color};
              }
            `;
            document.head.appendChild(style);

            setupActions(name);

            const backButton = document.getElementById('back');
            if (backButton) {
              backButton.addEventListener('click', async () => {
                const indexResponse = await fetch('index.html');
                const indexHtml = await indexResponse.text();
                contentDiv.innerHTML = indexHtml;
                setupSearch(); // Re-attach event listeners
              });
            }
          } catch (error) {
            console.error('Error loading content:', error);
          }
        }
      });
    }
  }

  function setupActions(name) {
    const actionButtons = document.querySelectorAll('#add-vip, #add-mod, #ban, .timeout-btn, #timeout-custom');
    actionButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('timeout-btn')) {
          console.log(`Timeout ${name} for ${button.getAttribute('data-time')} seconds`);
        } else if (button.id === 'timeout-custom') {
          const customTime = document.getElementById('custom-time').value;
          console.log(`Timeout ${name} for ${customTime} seconds`);
        } else {
          console.log(`${button.innerText} ${name}`);
        }
      });
    });
  }

  setupSearch(); // Initial setup
});

async function fetchChatColor(id) {
  try {
    const response = await fetch(`https://api.twitch.tv/helix/chat/color?user_id=${id}`, {
      headers: {
        'Authorization': `Bearer `,
        'Client-Id': "",
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].color
  } catch (error) {
    console.error('Error fetching chat color:', error);
  }
}
