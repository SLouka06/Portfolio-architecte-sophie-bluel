//recupération des travaux
fetch('http://localhost:5678/api/works')
  .then(response => response.json())
  .then(data => {
    //creation dynamique de gallery
    const gallery = document.querySelector('.gallery');
    data.forEach(work => {
      const figure = document.createElement('figure');
      figure.classList.add(work.categoryId);
      const img = document.createElement('img');
      img.src = work.imageUrl; 
      img.alt = work.title; 
      
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = work.title;
      
      figure.appendChild(img);
      figure.appendChild(figcaption);
      gallery.appendChild(figure);
    });
    
    //Filtres
    const allCategories = data.map(work => work.categoryId);
    const uniqueCategories = [...new Set(allCategories)];

    const filter = document.querySelectorAll('.filter');
        filter.forEach(filterBtn => {
            filterBtn.addEventListener('click', function() {
                const category = this.getAttribute('data-filter');
                
                const figures = document.querySelectorAll('.gallery figure');
                figures.forEach(figure => {
                    if (category === 'all') {
                        figure.style.display = ''; 
                    } else if (figure.classList.contains(category)) {
                        figure.style.display = ''; 
                    } else {
                        figure.style.display = 'none'; 
                    }
                });
        filter.forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
    });
});

//page de connexion
const loginLink = document.querySelector('#login-link');
const mainContent = document.querySelector('main');
const loginContainer = document.querySelector('#connection-container');

loginLink.addEventListener('click', function(e) {
    e.preventDefault();
    mainContent.innerHTML = '';
    loginContainer.style.display = 'flex';
});

//fonctionalité de la page de connexion

document.querySelector('.login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;  // Notez le changement ici
    const password = document.getElementById('password').value;

    // Envoyez ces valeurs à l'API
    fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })  // Assurez-vous que ces clés correspondent à ce que l'API attend.
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            location.reload();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Erreur lors de la connexion:', error);
    });
});




})
    .catch(error => {
    console.error('Erreur lors de la récupération des travaux:', error);
});

    
   
