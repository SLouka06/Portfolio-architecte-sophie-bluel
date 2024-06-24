const apiBaseUrl = 'https://ton-service.onrender.com';

let token;
document.addEventListener('DOMContentLoaded', function () {
    token = localStorage.getItem('token');
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
        modifications.forEach(element => element.style.display = 'none');
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            const mainContent = document.querySelector('main');
            const loginContainer = document.querySelector('#connection-container');
            mainContent.innerHTML = '';
            loginContainer.style.display = 'flex';
        });
    }

    fetch(`${apiBaseUrl}/api/works`)
        .then(response => response.json())
        .then(data => {
            const gallery = document.querySelector('.gallery');
            data.forEach(work => {
                const figure = document.createElement('figure');
                figure.id = `gallery-element-${work.id}`;
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
        fetch(`${apiBaseUrl}/api/users/login`, {
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
const btnOpenModal = document.querySelector('#portfolio .modification button');
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
        moveIcon.className = 'fas fa-arrows-alt';
        moveIcon.style.position = 'absolute';
        moveIcon.style.top = '7px';
        moveIcon.style.right = '30px';
        moveIcon.style.cursor = 'pointer';
        moveIcon.style.color = 'white';
        moveIcon.style.backgroundColor = 'black';
        moveIcon.style.padding = '5px';
        moveIcon.style.display = 'none';

        // Événements pour afficher/masquer l'icône fléché
        img.addEventListener('mouseenter', () => {
            moveIcon.style.display = 'block';
        });

        img.addEventListener('mouseleave', () => {
            moveIcon.style.display = 'none';
        });

        imageContainer.appendChild(corbeilleIcon);
        imageContainer.appendChild(moveIcon);
        imageContainer.appendChild(img);
        imageContainer.appendChild(span);

        modalImages.appendChild(imageContainer);
    });
}

function viderModale() {
    const modalImages = document.querySelector('.modal-content .modal-images');
    while (modalImages.firstChild) {
        modalImages.removeChild(modalImages.firstChild);
    }
}

// Ouvrir la modale
btnOpenModal.addEventListener('click', function () {
    fetch(`${apiBaseUrl}/api/works`)
        .then(response => response.json())
        .then(data => {
            viderModale();
            afficherTravauxDansModale(data);
            modal.style.display = 'flex';
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des travaux:', error);
        });
});

// Fermer la modale avec la croix
closeModal.addEventListener('click', function () {
    modal.style.display = 'none';
    viderModale();
});

// Fermer la modale en cliquant en dehors
window.addEventListener('click', function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        viderModale();
    }
    if (event.target == secondeModale) {
        secondeModale.style.display = 'none';
    }
});

// Fonction pour supprimer un travail avec un token
async function supprimerTravailAvecToken(id, imageContainer) {
    if (document.getElementById(id)) {
        console.log("L'élément existe");
    } else {
        console.log("L'élément n'existe pas");
    }
    try {
        const response = await fetch(`${apiBaseUrl}/api/works/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            imageContainer.remove();
        }

        const galleryElement = document.querySelector(`#gallery-element-${id}`);
        if (galleryElement) {
            galleryElement.remove();

        } else {
            console.error('Échec de la suppression du travail');
        }

    } catch (error) {
        console.error('Une erreur est survenue:', error);
    }
}

//deuxième modale

const secondeModale = document.getElementById('seconde-modale');
const ajouterPhotoBtn = document.getElementById('add-photo');
ajouterPhotoBtn.addEventListener('click', function () {
    modal.style.display = 'none';
    secondeModale.style.display = 'flex';
});

const returnArrow = document.querySelector('.return-arrow');
returnArrow.addEventListener('click', function () {
    secondeModale.style.display = 'none';
    modal.style.display = 'flex';
    resetImageUI();
});

const closeSecondModal = document.querySelector('#seconde-modale .close-btn');
closeSecondModal.addEventListener('click', function () {
    secondeModale.style.display = 'none';
    form.reset();
    resetImageUI();
    document.getElementById("project-name").value = "";
    document.getElementById("category-select").selectedIndex = 0;
});

// Récupération des catégories pour le menu déroulant de la seconde modale
let categorySelect = document.getElementById('category-select');
fetch(`${apiBaseUrl}/api/categories`)
    .then(response => response.json())
    .then(data => {
        for (let category of data) {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des catégories:', error);
    });

// Ajoute un nouveau projet à la galerie
function addToGallery(project) {
    const gallery = document.querySelector('.gallery');
    const newProject = document.createElement('div');
    newProject.id = `gallery-element-${project.id}`;
    newProject.className = 'project-item';
    newProject.innerHTML = `<img src="${project.imageUrl}" alt="${project.title}"> <p>${project.title}</p>`;
    gallery.appendChild(newProject);
}

// Ajoute un nouveau projet à la première modale
function addToFirstModal(project) {
    const firstModal = document.querySelector('.modal-images');
    const newProject = document.createElement('div');
    newProject.id = `gallery-element-${project.id}`;
    newProject.className = 'modal-project-item';
    newProject.innerHTML = `<img src="${project.imageUrl}" alt="${project.title}"> <p>${project.title}</p>`;
    firstModal.appendChild(newProject);
}

const form = document.getElementById('upload-image-form');
const fileInput = document.getElementById('image-file');
const projectName = document.getElementById('project-name');
let validePhotoButton = document.getElementById('valide-photo');

// Fonction pour vérifier la validité du formulaire
const checkForm = () => {
    const errorMessage = document.getElementById('error-message');

    if (fileInput.files[0] && projectName.value && categorySelect.value) {
        validePhotoButton.disabled = false; // Activer le bouton
        errorMessage.style.display = 'none'; // Cacher le message d'erreur
    } else {
        validePhotoButton.disabled = true; // Désactiver le bouton

        let missingFields = [];
        if (!fileInput.files[0]) missingFields.push("image");
        if (!projectName.value) missingFields.push("nom du projet");
        if (!categorySelect.value) missingFields.push("catégorie");

        errorMessage.textContent = "Veuillez remplir les champs suivants : " + missingFields.join(", ");
        errorMessage.style.display = 'block'; // Afficher le message d'erreur
    }
};

// Ajout des écouteurs d'événements pour les éléments du formulaire
fileInput.addEventListener('change', checkForm);
projectName.addEventListener('input', checkForm);
categorySelect.addEventListener('change', checkForm);

// Écouteur pour la soumission du formulaire
form.addEventListener('submit', async (event) => {
    console.log('form submitted');
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('title', projectName.value);
    formData.append('category', categorySelect.value);

    try {
        let response = await fetch(`${apiBaseUrl}/api/works`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Réponse de l'API:", data); // Debug
            addToGallery(data);
            addToFirstModal(data);
            form.reset();
            resetImageUI();
            secondeModale.style.display = "none";
            document.getElementById("project-name").value = "";
            document.getElementById("category-select").selectedIndex = 0;
        } else {
            const errorData = await response.json();
            console.log("Erreur de l'API:", errorData); // Debug
        }
    } catch (error) {
        console.error('Il y a eu un problème avec la requête Fetch:', error);
    }
});

const imageFileInput = document.getElementById('image-file');
const selectedImageElement = document.getElementById('selected-image');
const imageWrapper = document.getElementById('image-upload-wrapper');
const imageIcon = document.getElementById('image-icon');
const imageText = document.getElementById('image-text');
const imageLabel = document.querySelector('label[for="image-file"]'); // si vous n'avez pas d'ID pour le label

imageFileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            if (imageIcon && imageText && imageLabel && selectedImageElement) {
                // Masquer le logo et le texte
                imageIcon.style.display = 'none';
                imageText.style.display = 'none';
                imageLabel.style.display = 'none';

                // Afficher l'image
                selectedImageElement.src = reader.result;
                selectedImageElement.style.display = 'block';

                // Ajuster les dimensions de l'image
                selectedImageElement.style.width = '129px';
                selectedImageElement.style.height = '169px';

                // Pour centrer l'image
                imageWrapper.style.justifyContent = 'center';
            } else {
                console.log("One or more elements not found");
            }
        };
    }
});

function resetImageUI() {
    fileInput.value = '';
    document.getElementById("selected-image").src = '';
    document.getElementById("selected-image").style.display = 'none';
    document.getElementById("image-icon").style.display = 'block';
    document.getElementById("image-text").style.display = 'block';
    document.querySelector('label[for="image-file"]').style.display = 'flex';
}
