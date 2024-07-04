document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const contentDiv = document.getElementById('content');

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const name = document.getElementById('name-input').value;
      if (name) {
        fetch('search.html')
          .then(response => response.text())
          .then(html => {
            contentDiv.innerHTML = html;
            document.getElementById('user-name').innerText = name;

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

            const backButton = document.getElementById('back-button');
            if (backButton) {
              backButton.addEventListener('click', () => {
                contentDiv.innerHTML = `
                  <h1>Enter Name</h1>
                  <input type="text" id="name-input" placeholder="Enter name">
                  <button id="search-button">Search</button>
                `;
                // Reattach the event listener for the search button
                document.getElementById('search-button').addEventListener('click', () => {
                  const name = document.getElementById('name-input').value;
                  if (name) {
                    fetch('search.html')
                      .then(response => response.text())
                      .then(html => {
                        contentDiv.innerHTML = html;
                        document.getElementById('user-name').innerText = name;
                      });
                  }
                });
              });
            }
          })
          .catch(error => {
            console.error('Error loading search.html:', error);
          });
      }
    });
  }
});
