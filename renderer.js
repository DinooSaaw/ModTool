document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        const name = document.getElementById('name-input').value;
        if (name) {
          window.electron.searchName(name);
        }
      });
    }
  
    window.electron.onDisplayName((name) => {
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
    });
  });
  