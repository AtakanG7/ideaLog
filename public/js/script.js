document.addEventListener('DOMContentLoaded', function() {
    const allButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
  
    allButtons.forEach(button => {
      button.addEventListener('click', function() {
        searchBar.style.visibility = 'visible';
        searchBar.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        searchInput.focus();
      });
    });
  
    searchClose.addEventListener('click', function() {
      searchBar.style.visibility = 'hidden';
      searchBar.classList.remove('open');
      this.setAttribute('aria-expanded', 'false');
    });
  
    addEventListener('scroll', function() {
      const topElement = document.querySelector('.top');
      if (topElement) {
        if (pageYOffset > 100) {
          topElement.classList.add('show');
        } else {
          topElement.classList.remove('show');
        }
      }
    });
  
    onload = loadImages;
    loadTheme();
});
  
// Global functions
fetchImage = async function(query, postContainerId) {
  const url = `https://pixabay.com/api/?key=34782797-09ed0e53aefea1bdbbcccd6f0&q=${query.toLowerCase()}&image_type=photo&editors_choice=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.hits && data.hits.length > 0) {
      const imageUrl = data.hits[1].webformatURL;
      const imageElement = document.querySelector(`#${postContainerId}`);
      if (imageElement) {
        imageElement.src = imageUrl;
      } else {
      }
    } else {
    }
  } catch (error) {
  }
}

loadImages = async function() {
  for (const post of data) {
    const keywords = post.search_keywords.split(' ')[0] + ' ' + post.search_keywords.split(' ')[1];
    await fetchImage(keywords, `post-${post._id}`);
  }
}

scrollToElement = function() {
  const element = document.querySelector('#scroll-place');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

toggleTheme = function() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'retro' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

loadTheme = function() {
  const theme = localStorage.getItem('theme');
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
  
showSeachBar = function() {
    const searchBar = document.querySelector('.searchBar');
    searchBar.style.display = 'block';
    searchBar.style.visibility = 'visible';
  }
  
closeSearchBar = function() {
  const searchBar = document.querySelector('.searchBar');
  searchBar.style.display = 'none';
  document.getElementById('searchInput').value = '';
}
  
function getProfileInfo() {
  fetch('/users/')
    .then(res => res.json())
    .then(data => {
      const fields = {
        imageUrl: data.imageUrl,
        name: data.name,
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