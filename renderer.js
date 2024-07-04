document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const contentDiv = document.getElementById('content');

  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      const name = document.getElementById('name-input').value;

      if (name) {
        try {
          const avatarResponse = await fetch(`https://decapi.me/twitch/avatar/${name}`);
          const idResponse = await fetch(`https://decapi.me/twitch/id/${name}`);
          const avatarUrl = await avatarResponse.text();
          const id = await idResponse.text();
          const color = "#82f282"
          console.log("🚀 ~ searchButton.addEventListener ~ id:", id)

          const response = await fetch('search.html');
          const html = await response.text();

          contentDiv.innerHTML = html;
          document.getElementById('user-name').innerText = name;
          document.getElementById('user-name').style.color = color;
          document.getElementById('user-id').innerText = id;
          document.getElementById('avatar-img').src = avatarUrl;
          const style = document.createElement('style');
          style.innerHTML = `
            #avatar-img:hover {
              box-shadow: 0 0 10px ${color};
            }
          `;
          document.head.appendChild(style);


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

          const backButton = document.getElementById('back');
          if (backButton) {
            backButton.addEventListener('click', async () => {
              const indexResponse = await fetch('index.html');
              const indexHtml = await indexResponse.text();

              contentDiv.innerHTML = indexHtml;
              const newSearchButton = document.getElementById('search-button');
              if (newSearchButton) {
                newSearchButton.addEventListener('click', async () => {
                  const newName = document.getElementById('name-input').value;
                  if (newName) {
                    const newAvatarResponse = await fetch(`https://decapi.me/twitch/avatar/${newName}`);
                    const newAvatarUrl = await newAvatarResponse.text();

                    const newSearchResponse = await fetch('search.html');
                    const newSearchHtml = await newSearchResponse.text();

                    contentDiv.innerHTML = newSearchHtml;
                    document.getElementById('user-name').innerText = newName;
                    document.getElementById('avatar-img').src = newAvatarUrl;
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error('Error loading content:', error);
        }
      }
    });
  }
});
