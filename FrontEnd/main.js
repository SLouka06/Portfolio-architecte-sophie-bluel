document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const loginLink = document.querySelector('#login-link');
    const filter = document.querySelectorAll('.filter');
    const modifications = document.querySelectorAll('.modification i, .modification button');

    if (token) {
        loginLink.textContent = 'Logout';
        filter.forEach(btn => btn.style.display = 'none'); // Les filtres sont cachés
        modifications.forEach(element => element.style.display = 'inline-block');
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            location.reload();
        });
    } else {
        loginLink.textContent = 'Login';
        filter.forEach(btn => btn.style.display = ''); // Les filtres sont visibles
        modifications.forEach(element => element.style.display = 'none'); // Les modifications sont masquées
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            const mainContent = document.querySelector('main');
            const loginContainer = document.querySelector('#connection-container');
            mainContent.innerHTML = '';
            loginContainer.style.display = 'flex';
        });
    }
    

    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(data => {
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

            filter.forEach(filterBtn => {
                filterBtn.addEventListener('click', function () {
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
        });

    document.querySelector('.login-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
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

    const modeEdition = document.getElementById('mode-edition');
    if (token && modeEdition) {
        modeEdition.style.display = 'flex';
    }

});


//modale

const modal = document.getElementById('mediaModal');
const btnOpenModal = document.querySelector('#portfolio .modification button');  // Sélectionne le bouton "modifier" dans la section "portfolio"
const closeModal = modal.querySelector('.close-btn');


function afficherTravauxDansModale(data) {
    const modalImages = document.querySelector('.modal-content .modal-images');
    
    data.forEach(work => {
        const imageContainer = document.createElement('div');
        imageContainer.style.position = 'relative';
        imageContainer.style.display = 'inline-block';
        imageContainer.style.margin = '10px';

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;
        img.style.width = '78.123px';
        img.style.height = '104.08px';
        img.style.display = 'block';
        
        const span = document.createElement('span');
        span.textContent = 'éditer';
        span.style.display = 'block';
        span.style.fontSize = '14px';
        span.style.color = '#1D6154';
        span.style.cursor = 'pointer';
        span.style.marginTop = '5px';

        const corbeilleIcon = document.createElement('i');
        corbeilleIcon.addEventListener('click', () => {
            supprimerTravailAvecToken(work.id, imageContainer, token); 
        });
        corbeilleIcon.className = 'fa fa-trash corbeille-icon';
        corbeilleIcon.dataset.id = work.id; 
        corbeilleIcon.style.position = 'absolute';  
        corbeilleIcon.style.top = '7px';              
        corbeilleIcon.style.right = '5px';
        corbeilleIcon.style.cursor = 'pointer';
        corbeilleIcon.style.color = 'white';  
        corbeilleIcon.style.backgroundColor = 'black';  
        corbeilleIcon.style.padding = '5px';

        const moveIcon = document.createElement('i');
        moveIcon.className = 'fas fa-arrows-alt';  // J'ai changé cela pour une classe FontAwesome standard
        moveIcon.style.position = 'absolute';
        moveIcon.style.top = '7px';  
        moveIcon.style.right = '30px'; 
        moveIcon.style.cursor = 'pointer';
        moveIcon.style.color = 'white';
        moveIcon.style.backgroundColor = 'black';
        moveIcon.style.padding = '5px';
        
        moveIcon.style.display = 'none';  // Cache par défaut

        // Événements pour afficher/masquer l'icône
        img.addEventListener('mouseenter', () => {
            moveIcon.style.display = 'block';  // Afficher lorsque la souris entre
        });

        img.addEventListener('mouseleave', () => {
            moveIcon.style.display = 'none';  // Cacher lorsque la souris sort
        });

        imageContainer.appendChild(corbeilleIcon);
        imageContainer.appendChild(moveIcon);  // Ajouté ici
        imageContainer.appendChild(img);
        imageContainer.appendChild(span);

        modalImages.appendChild(imageContainer);
    });
}



function viderModale() {
    modalImages = document.querySelector('.modal-content .modal-images');
    while (modalImages.firstChild) {
        modalImages.removeChild(modalImages.firstChild);
    }
}


// Ouvrir la modale
btnOpenModal.addEventListener('click', function() {
    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(data => {
            afficherTravauxDansModale(data);
            modal.style.display = 'flex';
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des travaux:', error);
        });
});


// Fermer la modale avec la croix
closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
    viderModale();
});

// Fermer la modale en cliquant en dehors
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        viderModale();
    }
});

// Fonction pour supprimer un travail avec un token
async function supprimerTravailAvecToken(id, imageContainer, token) {
    // Faites une requête HTTP pour supprimer le travail
    try {
        const response = await fetch(`https://votre-api.com/works/{id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`, // Utilisation du token
            },
        });

        if (response.ok) {
            // Si la requête a réussi, supprimez également le conteneur de l'image de la modale
            imageContainer.remove();
        } else {
            console.error('Échec de la suppression du travail');
        }
    } catch (error) {
        console.error('Une erreur est survenue:', error);
    }
}