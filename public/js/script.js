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
  
    window.onload = loadImages;
    loadTheme();
});
  
  // Global functions
  window.fetchImage = async function(query, postContainerId) {
    const url = `https://pixabay.com/api/?key=34782797-09ed0e53aefea1bdbbcccd6f0&q=${query.toLowerCase()}&image_type=photo&editors_choice=true`;
    console.log(`Fetching image for query: ${query} from URL: ${url}`);
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(`Data received: ${JSON.stringify(data)}`);
  
      if (data.hits && data.hits.length > 0) {
        const imageUrl = data.hits[1].webformatURL;
        const imageElement = document.querySelector(`#${postContainerId}`);
        if (imageElement) {
          imageElement.src = imageUrl;
        } else {
          console.error(`Element with ID ${postContainerId} not found.`);
        }
      } else {
        console.error("No images found.");
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  }
  
  window.loadImages = async function() {
    for (const post of data) {
      const keywords = post.search_keywords.split(' ')[0] + ' ' + post.search_keywords.split(' ')[1];
      await fetchImage(keywords, `post-${post._id}`);
    }
  }
  
  window.scrollToElement = function() {
    const element = document.querySelector('#scroll-place');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  window.toggleTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'retro' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }
  
  window.loadTheme = function() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
  
  window.showSeachBar = function() {
    const searchBar = document.querySelector('.searchBar');
    searchBar.style.display = 'block';
    searchBar.style.visibility = 'visible';
  }
  
  window.closeSearchBar = function() {
    const searchBar = document.querySelector('.searchBar');
    searchBar.style.display = 'none';
    document.getElementById('searchInput').value = '';
  }
  
  window.getProfileInfo = function() {
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
  
  window.postComment = async function() {
    const comment = document.querySelector('.textarea').value.trim();
    if (!comment) {
      showNotification("Comment cannot be empty!");
      return;
    }
  
    try {
      const response = await fetch('/blogs/comments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: comment,
          author: '<%= data.authorMetadata._id %>',
          post: '<%= data._id %>'
        })
      });
  
      if (response.redirected) {
        showNotification("Please login to comment!");
        return;
      }
  
      const data = await response.json();
      if (data) {
        showNotification("Your message is under review! After review, it will be published.");
        addCommentToDOM(data.comment);
        document.querySelector('.textarea').value = '';
      }
    } catch (error) {
      showNotification("Failed to upload comment. Please try again.");
    }
  }
  
  window.showNotification = function(message) {
    const notification = document.getElementById('notification');
    document.getElementById('notification-message').textContent = message;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 5000);
  }
  
  window.addCommentToDOM = function(comment) {
    const commentBox = document.getElementById('comments-container');
    const commentHTML = `
      <div class="w-full">
        <div class="grid comment">
          <div class="flex gap-2.5 mb-4">
            <img src="/img/avatar.png" alt="User avatar" class="w-10 h-11">
            <div class="grid w-100">
              <h5 class="text-gray-900 text-sm font-semibold leading-snug pb-1">${comment.authorName}</h5>
              <div class="w-max grid w-100">
                <div class="px-3.5 py-2 bg-gray-100 rounded-3xl rounded-tl-none justify-start w-100 items-center gap-3 inline-flex">
                  <h5 class="text-gray-900 text-sm font-normal leading-snug">${comment.content}</h5>
                </div>
                <div class="justify-end items-center inline-flex mb-2.5">
                  <div class="flex gap-2"></div>
                  <h6 class="text-gray-500 text-xs font-normal leading-4 py-1">
                    <small>Published at <strong>${new Date().toLocaleDateString("en-US", {
                      month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
                    })}</strong></small>
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    commentBox.insertAdjacentHTML('beforeend', commentHTML);
    
    const noComments = document.getElementById('no-comments');
    if (noComments) noComments.style.display = 'none';
  }
  
  window.likePost = async () => {
    const response = await fetch('/blogs/like', {
      method: 'POST',
      body: JSON.stringify({ _id: '<%= data._id %>' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.querySelector('.clap').textContent = Number(document.querySelector('.clap').textContent) + 1;
    }
  }
  
  window.stripHtml = function(html) {
    const temporalDiv = document.createElement("div");
    temporalDiv.innerHTML = html;
    return temporalDiv.textContent || temporalDiv.innerText || "";
  }