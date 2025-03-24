/**
 * Search suggestions for the IMDb search feature
 * Shows suggestions as the user types with a 1 second delay
 */

// Config
const DEBOUNCE_DELAY = 1000; // 1 second delay for debouncing
const MIN_CHARS = 3; // Minimum characters before showing suggestions
const MAX_SUGGESTIONS = 7; // Maximum number of suggestions to show

/**
 * Initialize the suggestions feature
 * @param {Object} api - The API service to use for searching
 */
export function initSuggestions(api) {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    
    console.log('[Suggestions] Initializing suggestions feature');
    
    if (!searchInput || !suggestionsContainer) {
        console.error('[Suggestions] Missing search input or suggestions container');
        return;
    }
    
    console.log('[Suggestions] Found search input and suggestions container');
    
    // Debug if API is provided correctly
    if (!api || typeof api.searchMovies !== 'function') {
        console.error('[Suggestions] API missing or searchMovies method not available', api);
        return;
    }
    
    // Track if suggestions are currently visible
    let suggestionsVisible = false;
    
    // Create a debounced version of the search function
    const debouncedSearch = debounce(async (query) => {
        console.log(`[Suggestions] Debounced search triggered for: "${query}"`);
        
        // Don't search if query is too short
        if (query.length < MIN_CHARS) {
            console.log(`[Suggestions] Query too short (${query.length} < ${MIN_CHARS}), hiding suggestions`);
            hideSuggestions();
            return;
        }
        
        // Show loading state
        suggestionsContainer.innerHTML = '<div class="suggestion-loading">Searching...</div>';
        suggestionsContainer.classList.add('active');
        suggestionsVisible = true;
        
        try {
            console.log(`[Suggestions] Fetching results for: "${query}"`);
            const results = await api.searchMovies(query);
            console.log('[Suggestions] Search results full object:', results);
            
            // DEBUG: Log the exact structure of the results to understand the data
            if (Array.isArray(results)) {
                console.log('[Suggestions] Results is an array with length:', results.length);
                if (results.length > 0) {
                    console.log('[Suggestions] First result structure:', Object.keys(results[0]));
                    console.log('[Suggestions] First result sample:', results[0]);
                }
            } else if (typeof results === 'object') {
                console.log('[Suggestions] Results keys:', Object.keys(results));
                if (results.Search) {
                    console.log('[Suggestions] Results.Search:', results.Search);
                }
            }
            
            displaySuggestions(results, query);
        } catch (error) {
            console.error('[Suggestions] Error fetching suggestions:', error);
            suggestionsContainer.innerHTML = '<div class="suggestion-error">Error fetching suggestions</div>';
        }
    }, DEBOUNCE_DELAY);
    
    // Listen for input events on the search box
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        console.log(`[Suggestions] Input detected: "${query}"`);
        
        if (query.length < MIN_CHARS) {
            console.log(`[Suggestions] Query too short (${query.length} < ${MIN_CHARS}), not searching yet`);
            hideSuggestions();
            return;
        }
        
        debouncedSearch(query);
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            console.log('[Suggestions] Click outside, hiding suggestions');
            hideSuggestions();
        }
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (!suggestionsVisible) return;
        
        console.log(`[Suggestions] Key pressed: ${e.key}`);
        
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        let activeIndex = Array.from(suggestions).findIndex(item => item.classList.contains('active'));
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                console.log('[Suggestions] Arrow down, navigating down');
                navigateSuggestion(suggestions, activeIndex, 1);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                console.log('[Suggestions] Arrow up, navigating up');
                navigateSuggestion(suggestions, activeIndex, -1);
                break;
                
            case 'Enter':
                const activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
                if (activeItem) {
                    e.preventDefault();
                    console.log('[Suggestions] Enter pressed on active item, clicking');
                    activeItem.click();
                }
                break;
                
            case 'Escape':
                console.log('[Suggestions] Escape pressed, hiding suggestions');
                hideSuggestions();
                break;
        }
    });
    
    /**
     * Display suggestions in the dropdown
     * @param {Array} results - The search results to display
     * @param {string} query - The search query
     */
    function displaySuggestions(results, query) {
        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';
        
        // Handle different result structures
        let movies = [];
        
        // Check if results is a direct array of movies
        if (Array.isArray(results)) {
            console.log('[Suggestions] Processing results as array');
            movies = results.slice(0, MAX_SUGGESTIONS);
        } 
        // Check if results has a Search property (API dependent)
        else if (results && results.Search && Array.isArray(results.Search)) {
            console.log('[Suggestions] Processing results.Search as array');
            movies = results.Search.slice(0, MAX_SUGGESTIONS);
        }
        
        if (movies.length === 0) {
            console.log('[Suggestions] No movies found in results');
            suggestionsContainer.innerHTML = '<div class="suggestion-no-results">No results found</div>';
            setTimeout(hideSuggestions, 2000); // Hide after 2 seconds
            return;
        }
        
        console.log(`[Suggestions] Displaying ${movies.length} suggestions`);
        
        // Create suggestion items - adapt to the structure we actually have
        movies.forEach(movie => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            // Extract title and year based on the available properties
            // Check for properties with "#" prefix first (based on log output)
            const title = movie["#TITLE"] || movie.Title || movie.title || movie.name || "Unknown";
            const year = movie["#YEAR"] || movie.Year || movie.year || movie.release_date || "";
            // Get the imdb ID for click action
            const imdbId = movie["#IMDB_ID"] || movie.imdbID || movie.id || "";
            
            console.log(`[Suggestions] Adding suggestion: ${title} (${year})`);
            
            // Highlight matching text
            const highlightedTitle = highlightMatch(title, query);
            
            item.innerHTML = `
                <span class="suggestion-title">${highlightedTitle}</span>
                <span class="suggestion-year">${year}</span>
            `;
            
            // Store the ID as data attribute for later use
            if (imdbId) {
                item.dataset.imdbId = imdbId;
            }
            
            // Handle click on suggestion
            item.addEventListener('click', () => {
                console.log(`[Suggestions] Suggestion clicked: "${title}"`);
                searchInput.value = title;
                hideSuggestions();
                
                // Store this movie for prioritizing in results
                if (imdbId) {
                    localStorage.setItem('last_selected_movie', JSON.stringify({
                        id: imdbId,
                        title: title
                    }));
                }
                
                // Trigger a search with this movie
                const searchButton = document.getElementById('search-button');
                if (searchButton) {
                    console.log('[Suggestions] Triggering search button click');
                    searchButton.click();
                }
            });
            
            suggestionsContainer.appendChild(item);
        });
        
        // Make suggestions visible
        suggestionsContainer.classList.add('active');
        suggestionsVisible = true;
        console.log('[Suggestions] Suggestions are now visible');
    }
    
    /**
     * Hide the suggestions dropdown
     */
    function hideSuggestions() {
        console.log('[Suggestions] Hiding suggestions');
        suggestionsContainer.classList.remove('active');
        suggestionsVisible = false;
    }
    
    /**
     * Navigate through suggestions with keyboard
     * @param {NodeList} suggestions - The list of suggestion elements
     * @param {number} currentIndex - Current active index
     * @param {number} direction - Direction to move (1 for down, -1 for up)
     */
    function navigateSuggestion(suggestions, currentIndex, direction) {
        // Remove active class from current item
        if (currentIndex >= 0) {
            suggestions[currentIndex].classList.remove('active');
        }
        
        // Calculate new index
        let newIndex = currentIndex + direction;
        
        // Handle wrapping around the list
        if (newIndex < 0) newIndex = suggestions.length - 1;
        if (newIndex >= suggestions.length) newIndex = 0;
        
        // Add active class to new item
        suggestions[newIndex].classList.add('active');
        
        // Update the input value
        const title = suggestions[newIndex].querySelector('.suggestion-title').textContent;
        searchInput.value = stripHighlight(title);
    }
    
    /**
     * Highlight matched text in the suggestion
     * @param {string} text - The full text
     * @param {string} query - The query to highlight
     * @returns {string} - HTML with highlighted text
     */
    function highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
    }
    
    /**
     * Remove highlight HTML tags from text
     * @param {string} text - The text with HTML
     * @returns {string} - Clean text
     */
    function stripHighlight(text) {
        return text.replace(/<\/?span[^>]*>/g, '');
    }
}

/**
 * Create a debounced version of a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} - Debounced function
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
 * Escape special regex characters in a string
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
