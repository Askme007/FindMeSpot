document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const locationForm = document.getElementById('location-form');
    const venueList = document.getElementById('venue-list');

    // Dummy Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simple validation for demonstration
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
        const user1Location = document.getElementById('user1-location').value;
        const user2Location = document.getElementById('user2-location').value;
        const venueType = document.getElementById('venue-type').value;

        // Display the suggestions section
        document.getElementById('location-section').style.display = 'none';
        document.getElementById('suggestions-section').style.display = 'block';

        // Fetch venue suggestions (dummy data for now)
        const venues = await getVenueSuggestions(user1Location, user2Location, venueType);
        displayVenues(venues);
    });

    // Dummy function to simulate fetching venue suggestions
    async function getVenueSuggestions(location1, location2, type) {
        // Replace with actual API call to get venues based on the locations and type
        return [
            { name: 'Music Cafe', type: 'cafe', distance: '1.2 km', rating: 4.5 },
            { name: 'Chill Park', type: 'park', distance: '2.0 km', rating: 4.2 },
            { name: 'Groovy Bar', type: 'bar', distance: '1.8 km', rating: 4.6 }
        ];
    }

    // Display venue suggestions in the list
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
