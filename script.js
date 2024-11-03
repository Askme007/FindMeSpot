document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const locationForm = document.getElementById('location-form');
    const venueList = document.getElementById('venue-list');

    // Dummy Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (email && password) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('location-section').style.display = 'block';
        }
    });

    // Location Form Handler
    locationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('location-section').style.display = 'none';
        document.getElementById('suggestions-section').style.display = 'block';

        const venues = await getVenueSuggestions();
        displayVenues(venues);
    });

    async function getVenueSuggestions() {
        return [
            { name: 'Music Cafe', type: 'cafe', distance: '1.2 km', rating: 4.5 },
            { name: 'Chill Park', type: 'park', distance: '2.0 km', rating: 4.2 },
            { name: 'Groovy Bar', type: 'bar', distance: '1.8 km', rating: 4.6 }
        ];
    }

    function displayVenues(venues) {
        venueList.innerHTML = '';
        venues.forEach(venue => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>${venue.name}</strong><br>
                Type: ${venue.type} | Distance: ${venue.distance} | Rating: ${venue.rating}
            `;
            venueList.appendChild(listItem);
        });
    }
});
