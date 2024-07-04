document.addEventListener('DOMContentLoaded', function(){

    const allButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');


    for (var i = 0; i < allButtons.length; i++) {
      allButtons[i].addEventListener('click', function() {
        searchBar.style.visibility = 'visible';
        searchBar.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        searchInput.focus();
      });
    }
  
    searchClose.addEventListener('click', function() {
      searchBar.style.visibility = 'hidden';
      searchBar.classList.remove('open');
      this.setAttribute('aria-expanded', 'false');
    });
  
    window.addEventListener('scroll', function() {
      const topElement = document.querySelector('.top');
      if (topElement) {
        if (window.pageYOffset > 100) {
          topElement.classList.add('show');
        } else {
          topElement.classList.remove('show');
        }
      }
    });
});


function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'retro' : 'light';

  document.documentElement.setAttribute('data-theme', newTheme);

  // Put it to local storage
  localStorage.setItem('theme', newTheme);
}

function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

loadTheme();

function showSeachBar() {
  const searchBar = document.querySelector('.searchBar');
  searchBar.style.display = 'block';
  searchBar.style.visibility = 'visible';
}

function closeSearchBar() { 
  const searchBar = document.querySelector('.searchBar');
  searchBar.style.display = 'none';
  document.getElementById('searchInput').value = '';
}

function getProfileInfo() {
  fetch('/users/')
    .then(res => res.json())
    .then(data => {
      const dateObj = new Date(data.createdAt);
      const month = dateObj.toLocaleString('default', { month: 'long' });
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();
      const fields = {
        createdAt: [month, day, year],
        degree: data.degree,
        email: data.email,
        isSubscribed: data.isSubscribed ? 'Yes' : 'Nope :(',
        isVerified: data.isVerified ? 'Yes' : 'Nope :(',
        role: data.role,
        visitCount: data.visitCount
      };
      Object.entries(fields).forEach(([id, value]) => {
        const input = document.getElementById(id);
        input.classList.remove('skeleton');
        input.value = Array.isArray(value) ? value.join(' ') : value;
      });
    })
    .catch(console.error);
}

