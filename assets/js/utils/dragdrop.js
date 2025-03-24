/**
 * Fonctionnalité glisser-déposer pour les films favoris
 * Permet aux utilisateurs de réorganiser leurs favoris par glisser-déposer
 */

// Stocke l'élément actuellement glissé
let draggedItem = null;

/**
 * Initialise la fonctionnalité de glisser-déposer
 */
export function initializeDragAndDrop() {
    // Trouve le conteneur de favoris
    const favoritesContainer = document.getElementById('favorites-container');
    if (!favoritesContainer) return;

    // Configure un MutationObserver pour surveiller les nouvelles cartes de films
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('movie-card')) {
                        makeDraggable(node);
                    }
                });
            }
        });
    });

    // Commence à observer le conteneur de favoris
    observer.observe(favoritesContainer, { childList: true });

    // Fait également du conteneur une zone de dépôt
    setupDropZone(favoritesContainer);
}

/**
 * Rend une carte de film glissable
 * @param {HTMLElement} element - L'élément à rendre glissable
 */
function makeDraggable(element) {
    // Ajoute les attributs nécessaires
    element.setAttribute('draggable', 'true');
    
    // Ajoute un indicateur visuel que la carte est glissable
    element.style.cursor = 'grab';
    
    // Ajoute un indicateur de glissement
    const dragIndicator = document.createElement('div');
    dragIndicator.className = 'drag-indicator';
    dragIndicator.innerHTML = '⋮⋮'; // Indicateur de style "menu burger"
    dragIndicator.title = 'Glisser pour réorganiser';
    dragIndicator.style.position = 'absolute';
    dragIndicator.style.right = '10px';
    dragIndicator.style.top = '10px';
    dragIndicator.style.color = 'var(--text-secondary)';
    dragIndicator.style.fontSize = '16px';
    dragIndicator.style.opacity = '0.7';
    
    // Ajoute un positionnement relatif à la carte si elle n'en a pas
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }
    
    element.appendChild(dragIndicator);

    // Ajoute des écouteurs d'événements de glissement
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
}

/**
 * Configure un conteneur comme zone de dépôt
 * @param {HTMLElement} container - Le conteneur à transformer en zone de dépôt
 */
function setupDropZone(container) {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);
}

/**
 * Gère le début d'une opération de glissement
 * @param {DragEvent} e - L'événement de glissement
 */
function handleDragStart(e) {
    // Définit les données et référence l'élément glissé
    draggedItem = this;
    
    // Définit l'effet de glissement
    e.dataTransfer.effectAllowed = 'move';
    
    // Définit des données (requis pour Firefox)
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Ajoute un style pour montrer qu'il est en cours de glissement
    this.classList.add('dragging');
    
    // Prend un petit délai pour montrer l'effet visuel de glissement
    setTimeout(() => {
        this.style.opacity = '0.6';
    }, 0);
}

/**
 * Gère la fin d'une opération de glissement
 */
function handleDragEnd() {
    // Supprime le style de glissement
    this.classList.remove('dragging');
    this.style.opacity = '1';
    
    // Réinitialise tous les espaces réservés
    const dropPlaceholders = document.querySelectorAll('.drop-placeholder');
    dropPlaceholders.forEach(placeholder => placeholder.remove());
}

/**
 * Gère le survol d'une cible de dépôt
 * @param {DragEvent} e - L'événement de glissement
 */
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Nous permet de déposer
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    return false;
}

/**
 * Gère l'entrée dans une cible de dépôt
 * @param {DragEvent} e - L'événement de glissement
 */
function handleDragEnter(e) {
    // Traite uniquement si nous entrons dans le conteneur lui-même ou une autre carte de film
    const target = e.target.closest('.movie-card') || e.target.closest('#favorites-container');
    if (!target || target === draggedItem) return;

    // Trouve toutes les cartes de film dans le conteneur
    const movieCards = Array.from(document.querySelectorAll('#favorites-container .movie-card'));
    
    // Si nous sommes au-dessus d'une autre carte de film, trouve où insérer l'espace réservé
    if (target.classList.contains('movie-card')) {
        const rect = target.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        // Détermine si nous sommes au-dessus ou en dessous du point médian
        if (e.clientY < midpoint) {
            // Insère avant la cible
            if (target.previousElementSibling !== draggedItem) {
                target.parentNode.insertBefore(createPlaceholder(), target);
            }
        } else {
            // Insère après la cible
            if (target.nextElementSibling !== draggedItem) {
                target.parentNode.insertBefore(createPlaceholder(), target.nextElementSibling);
            }
        }
    }
    // Si nous sommes juste au-dessus du conteneur et qu'il n'y a pas encore de cartes
    else if (target.id === 'favorites-container' && movieCards.length === 0) {
        target.appendChild(createPlaceholder());
    }
}

/**
 * Gère la sortie d'une cible de dépôt
 */
function handleDragLeave() {
    // Supprime tout espace réservé si la souris a quitté la zone
    // Utilise un délai pour éviter le scintillement lors du déplacement entre les cartes
    setTimeout(() => {
        const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
        if (!hoveredElement || !hoveredElement.closest('#favorites-container')) {
            const placeholders = document.querySelectorAll('.drop-placeholder');
            placeholders.forEach(placeholder => placeholder.remove());
        }
    }, 50);
}

/**
 * Gère l'événement de dépôt
 * @param {DragEvent} e - L'événement de glissement
 */
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // Empêche certains navigateurs de rediriger
    }
    
    // Traite le dépôt uniquement si nous avons un draggedItem
    if (!draggedItem) return false;
    
    // Trouve l'espace réservé
    const placeholder = document.querySelector('.drop-placeholder');
    if (placeholder) {
        // Insère l'élément glissé là où se trouve l'espace réservé
        placeholder.parentNode.insertBefore(draggedItem, placeholder);
        placeholder.remove();
    }
    
    // Met à jour l'ordre des favoris dans le stockage
    updateFavoritesOrder();
    
    return false;
}

/**
 * Crée un élément d'espace réservé pour l'indication de dépôt
 * @returns {HTMLElement} - L'élément d'espace réservé
 */
function createPlaceholder() {
    // Supprime les espaces réservés existants
    const existingPlaceholders = document.querySelectorAll('.drop-placeholder');
    existingPlaceholders.forEach(p => p.remove());
    
    // Crée un nouvel espace réservé
    const placeholder = document.createElement('div');
    placeholder.className = 'drop-placeholder';
    placeholder.style.height = '10px';
    placeholder.style.backgroundColor = 'var(--primary-color)';
    placeholder.style.borderRadius = '5px';
    placeholder.style.margin = '10px 0';
    placeholder.style.transition = 'all 0.2s ease';
    
    return placeholder;
}

/**
 * Met à jour l'ordre des favoris dans le localStorage
 */
function updateFavoritesOrder() {
    // Récupère toutes les cartes de films favoris
    const favoriteCards = document.querySelectorAll('#favorites-container .movie-card');
    
    // Extrait les ID de films dans leur ordre actuel
    const favoriteIds = Array.from(favoriteCards).map(card => {
        // Récupère l'ID du film depuis la carte
        return card.dataset.movieId;
    });
    
    // Récupère les favoris actuels du localStorage
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    } catch (error) {
        console.error('Erreur lors de l\'analyse des favoris du localStorage:', error);
    }
    
    // Réorganise le tableau des favoris en fonction du nouvel ordre des ID
    const reorderedFavorites = favoriteIds.map(id => 
        favorites.find(favorite => favorite.imdbID === id)
    ).filter(Boolean); // Supprime toutes les entrées undefined
    
    // Sauvegarde les favoris réorganisés dans le localStorage
    localStorage.setItem('favorites', JSON.stringify(reorderedFavorites));
}

// Initialise lorsque le script est chargé
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeDragAndDrop, 1);
} else {
    document.addEventListener('DOMContentLoaded', initializeDragAndDrop);
}
