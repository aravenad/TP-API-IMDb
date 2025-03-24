/**
 * Suggestions de recherche pour la fonctionnalité de recherche IMDb
 * Affiche des suggestions pendant la saisie avec un délai d'1 seconde
 */

// Configuration
const DEBOUNCE_DELAY = 1000; // Délai d'1 seconde pour le debounce
const MIN_CHARS = 3; // Nombre minimum de caractères avant d'afficher des suggestions
const MAX_SUGGESTIONS = 7; // Nombre maximum de suggestions à afficher

/**
 * Initialise la fonctionnalité de suggestions
 * @param {Object} api - Le service API à utiliser pour la recherche
 */
export function initSuggestions(api) {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    
    console.log('[Suggestions] Initialisation de la fonctionnalité de suggestions');
    
    if (!searchInput || !suggestionsContainer) {
        console.error('[Suggestions] Champ de recherche ou conteneur de suggestions manquant');
        return;
    }
    
    console.log('[Suggestions] Champ de recherche et conteneur de suggestions trouvés');
    
    // Vérifie si l'API est correctement fournie
    if (!api || typeof api.searchMovies !== 'function') {
        console.error('[Suggestions] API manquante ou méthode searchMovies non disponible', api);
        return;
    }
    
    // Suit si les suggestions sont actuellement visibles
    let suggestionsVisible = false;
    
    // Crée une version debounced de la fonction de recherche
    const debouncedSearch = debounce(async (query) => {
        console.log(`[Suggestions] Recherche debounced déclenchée pour: "${query}"`);
        
        // Ne recherche pas si la requête est trop courte
        if (query.length < MIN_CHARS) {
            console.log(`[Suggestions] Requête trop courte (${query.length} < ${MIN_CHARS}), masquage des suggestions`);
            hideSuggestions();
            return;
        }
        
        // Affiche l'état de chargement
        suggestionsContainer.innerHTML = '<div class="suggestion-loading">Recherche en cours...</div>';
        suggestionsContainer.classList.add('active');
        suggestionsVisible = true;
        
        try {
            console.log(`[Suggestions] Récupération des résultats pour: "${query}"`);
            const results = await api.searchMovies(query);
            
            // Affiche les suggestions
            displaySuggestions(results, query);
        } catch (error) {
            console.error('[Suggestions] Erreur lors de la récupération des suggestions:', error);
            suggestionsContainer.innerHTML = '<div class="suggestion-error">Erreur lors de la récupération des suggestions</div>';
        }
    }, DEBOUNCE_DELAY);
    
    // Écoute les événements d'entrée sur le champ de recherche
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        console.log(`[Suggestions] Saisie détectée: "${query}"`);
        
        if (query.length < MIN_CHARS) {
            console.log(`[Suggestions] Requête trop courte (${query.length} < ${MIN_CHARS}), pas encore de recherche`);
            hideSuggestions();
            return;
        }
        
        debouncedSearch(query);
    });
    
    // Ferme les suggestions lors d'un clic à l'extérieur
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            console.log('[Suggestions] Clic à l\'extérieur, masquage des suggestions');
            hideSuggestions();
        }
    });
    
    // Gère la navigation au clavier
    searchInput.addEventListener('keydown', (e) => {
        if (!suggestionsVisible) return;
        
        console.log(`[Suggestions] Touche pressée: ${e.key}`);
        
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        let activeIndex = Array.from(suggestions).findIndex(item => item.classList.contains('active'));
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                console.log('[Suggestions] Flèche bas, navigation vers le bas');
                navigateSuggestion(suggestions, activeIndex, 1);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                console.log('[Suggestions] Flèche haut, navigation vers le haut');
                navigateSuggestion(suggestions, activeIndex, -1);
                break;
                
            case 'Enter':
                const activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
                if (activeItem) {
                    e.preventDefault();
                    console.log('[Suggestions] Entrée pressée sur un élément actif, clic');
                    activeItem.click();
                }
                break;
                
            case 'Escape':
                console.log('[Suggestions] Échap pressée, masquage des suggestions');
                hideSuggestions();
                break;
        }
    });
    
    /**
     * Affiche les suggestions dans la liste déroulante
     * @param {Array} results - Les résultats de recherche à afficher
     * @param {string} query - La requête de recherche
     */
    function displaySuggestions(results, query) {
        // Efface les suggestions précédentes
        suggestionsContainer.innerHTML = '';
        
        // Gère différentes structures de résultats
        let movies = [];
        
        // Vérifie si les résultats sont un tableau direct de films
        if (Array.isArray(results)) {
            console.log('[Suggestions] Traitement des résultats comme tableau');
            movies = results.slice(0, MAX_SUGGESTIONS);
        } 
        // Vérifie si les résultats ont une propriété Search (dépend de l'API)
        else if (results && results.Search && Array.isArray(results.Search)) {
            console.log('[Suggestions] Traitement de results.Search comme tableau');
            movies = results.Search.slice(0, MAX_SUGGESTIONS);
        }
        
        if (movies.length === 0) {
            console.log('[Suggestions] Aucun film trouvé dans les résultats');
            suggestionsContainer.innerHTML = '<div class="suggestion-no-results">Aucun résultat trouvé</div>';
            setTimeout(hideSuggestions, 2000); // Masque après 2 secondes
            return;
        }
        
        console.log(`[Suggestions] Affichage de ${movies.length} suggestions`);
        
        // Crée les éléments de suggestion - s'adapte à la structure disponible
        movies.forEach(movie => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            // Extrait le titre et l'année en fonction des propriétés disponibles
            const title = movie["#TITLE"] || movie.Title || movie.title || movie.name || "Inconnu";
            const year = movie["#YEAR"] || movie.Year || movie.year || movie.release_date || "";
            // Récupère l'ID IMDb pour l'action de clic
            const imdbId = movie["#IMDB_ID"] || movie.imdbID || movie.id || "";
            
            console.log(`[Suggestions] Ajout de suggestion: ${title} (${year})`);
            
            // Met en surbrillance le texte correspondant
            const highlightedTitle = highlightMatch(title, query);
            
            item.innerHTML = `
                <span class="suggestion-title">${highlightedTitle}</span>
                <span class="suggestion-year">${year}</span>
            `;
            
            // Stocke l'ID comme attribut de données pour une utilisation ultérieure
            if (imdbId) {
                item.dataset.imdbId = imdbId;
            }
            
            // Gère le clic sur la suggestion
            item.addEventListener('click', () => {
                console.log(`[Suggestions] Suggestion cliquée: "${title}"`);
                searchInput.value = title;
                hideSuggestions();
                
                // Stocke ce film pour le prioriser dans les résultats
                if (imdbId) {
                    localStorage.setItem('last_selected_movie', JSON.stringify({
                        id: imdbId,
                        title: title
                    }));
                }
                
                // Déclenche une recherche avec ce film
                const searchButton = document.getElementById('search-button');
                if (searchButton) {
                    console.log('[Suggestions] Déclenchement du clic sur le bouton de recherche');
                    searchButton.click();
                }
            });
            
            suggestionsContainer.appendChild(item);
        });
        
        // Rend les suggestions visibles
        suggestionsContainer.classList.add('active');
        suggestionsVisible = true;
        console.log('[Suggestions] Les suggestions sont maintenant visibles');
    }
    
    /**
     * Masque la liste déroulante des suggestions
     */
    function hideSuggestions() {
        console.log('[Suggestions] Masquage des suggestions');
        suggestionsContainer.classList.remove('active');
        suggestionsVisible = false;
    }
    
    /**
     * Navigue dans les suggestions avec le clavier
     * @param {NodeList} suggestions - La liste des éléments de suggestion
     * @param {number} currentIndex - Index actif actuel
     * @param {number} direction - Direction de déplacement (1 pour bas, -1 pour haut)
     */
    function navigateSuggestion(suggestions, currentIndex, direction) {
        // Supprime la classe active de l'élément actuel
        if (currentIndex >= 0) {
            suggestions[currentIndex].classList.remove('active');
        }
        
        // Calcule le nouvel index
        let newIndex = currentIndex + direction;
        
        // Gère le retour en boucle dans la liste
        if (newIndex < 0) newIndex = suggestions.length - 1;
        if (newIndex >= suggestions.length) newIndex = 0;
        
        // Ajoute la classe active au nouvel élément
        suggestions[newIndex].classList.add('active');
        
        // Met à jour la valeur du champ de saisie
        const title = suggestions[newIndex].querySelector('.suggestion-title').textContent;
        searchInput.value = stripHighlight(title);
    }
    
    /**
     * Met en surbrillance le texte correspondant dans la suggestion
     * @param {string} text - Le texte complet
     * @param {string} query - La requête à mettre en surbrillance
     * @returns {string} - HTML avec le texte en surbrillance
     */
    function highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
    }
    
    /**
     * Supprime les balises HTML de surbrillance du texte
     * @param {string} text - Le texte avec HTML
     * @returns {string} - Texte nettoyé
     */
    function stripHighlight(text) {
        return text.replace(/<\/?span[^>]*>/g, '');
    }
}

/**
 * Crée une version debounced d'une fonction
 * @param {Function} func - La fonction à debouncer
 * @param {number} wait - Le temps d'attente en millisecondes
 * @returns {Function} - Fonction debounced
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Échappe les caractères spéciaux regex dans une chaîne
 * @param {string} string - Chaîne à échapper
 * @returns {string} - Chaîne échappée
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
