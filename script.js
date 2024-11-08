// Map Initialize 
const map = L.map('map').setView([28.679079, 77.069710], 4); // Centered at delhi

// show the OpenStreetMap tiles on the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let location1Marker = null;
let location2Marker = null;
let location1Coords = null;
let location2Coords = null;
let midpointMarker = null;
let selectedVenueMarker = null;
let routeControl1 = null;
let routeControl2 = null;

// checking both locations are set enable FindSpotbutton
function checkIfLocationsSet() {
    const findSpotButton = document.getElementById("findSpotButton");
    if (location1Coords && location2Coords) {
        findSpotButton.disabled = false;
    } else {
        findSpotButton.disabled = true;
    }
}

// Geocode address to get coordinates 
async function geocodeAddress(address) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    if (data && data[0]) {
        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
        };
    } else {
        throw new Error('Location not found');
    }
}

// Set locations
async function setLocationFromSearch(locationNumber) {
    const locationInput = document.getElementById(`location${locationNumber}`);
    const address = locationInput.value;

    try {
        const coords = await geocodeAddress(address);
        setLocationMarker(coords, locationNumber);
    } catch (error) {
        alert("Location not found. Try another address.");
    }
}

// Set location marker 
function setLocationMarker(coords, locationNumber) {
    if (locationNumber === 1) {
        if (location1Marker) map.removeLayer(location1Marker);
        location1Marker = L.marker([coords.lat, coords.lon]).addTo(map).bindPopup("Location 1").openPopup();
        location1Coords = coords;
    } else if (locationNumber === 2) {
        if (location2Marker) map.removeLayer(location2Marker);
        location2Marker = L.marker([coords.lat, coords.lon]).addTo(map).bindPopup("Location 2").openPopup();
        location2Coords = coords;
    }

    checkIfLocationsSet(); // Enable "FindSpotButton" button if both locations are set
}

// Find midpoint and fetch nearby places
async function findMeetingPoint() {
    if (!location1Coords || !location2Coords) {
        alert("Please set both Location 1 and Location 2.");
        return;
    }

    // Calculate midpoint
    const midpoint = {
        lat: (location1Coords.lat + location2Coords.lat) / 2,
        lon: (location1Coords.lon + location2Coords.lon) / 2,
    };

    if (midpointMarker) map.removeLayer(midpointMarker);
    midpointMarker = L.marker([midpoint.lat, midpoint.lon]).addTo(map).bindPopup("Midpoint").openPopup();
    map.setView([midpoint.lat, midpoint.lon], 13);

    await fetchNearbyPlaces(midpoint, 100000);
}

// Fetch places near the midpoint and display them
async function fetchNearbyPlaces(midpoint, radius) {
    let query = `
        [out:json];
        (
            node["amenity"="restaurant"](around:${radius}, ${midpoint.lat}, ${midpoint.lon});
            node["amenity"="bar"](around:${radius}, ${midpoint.lat}, ${midpoint.lon});
            node["amenity"="cafe"](around:${radius}, ${midpoint.lat}, ${midpoint.lon});
        );
        out body;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    const data = await response.json();

    displayVenues(data.elements, midpoint); // Passing midpoint for distance calculation
}

// Display nearest 10 venues 
function displayVenues(places, midpoint) {
    // Sorting venues based on distance from midpoint
    places.sort((a, b) => {
        const distanceA = getDistance(midpoint, { lat: a.lat, lon: a.lon });
        const distanceB = getDistance(midpoint, { lat: b.lat, lon: b.lon });
        return distanceA - distanceB;
    });

    // Only nearest 10 places
    const nearestPlaces = places.slice(0, 10);

    const venueList = document.getElementById("venueOptions");
    venueList.innerHTML = "";  // Clear any previous venues

    nearestPlaces.forEach((place, index) => {
        const name = place.tags.name || "Unnamed";
        const type = place.tags.amenity.charAt(0).toUpperCase() + place.tags.amenity.slice(1);

        const listItem = document.createElement("li");
        listItem.textContent = `${name} - ${type}`;
        listItem.onclick = () => selectVenue(place);
        venueList.appendChild(listItem);

        // Add marker to the map
        const marker = L.marker([place.lat, place.lon]).addTo(map);
        marker.bindPopup(`<strong>${name}</strong><br>Type: ${type}`);
    });
}

// Calculate distance between two points
function getDistance(point1, point2) {
    const R = 6371e3; // Earth radius in meters
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const DFlat = (point2.lat - point1.lat) * Math.PI / 180;
    const DFlong = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(DFlat / 2) * Math.sin(DFlat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(DFlong / 2) * Math.sin(DFlong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    return distance;
}

// Select a venue and show navigation routes
function selectVenue(venue) {
    if (selectedVenueMarker) map.removeLayer(selectedVenueMarker);
    if (routeControl1) map.removeControl(routeControl1);
    if (routeControl2) map.removeControl(routeControl2);

    // Place marker on the selected venue
    selectedVenueMarker = L.marker([venue.lat, venue.lon]).addTo(map).bindPopup("Selected Venue").openPopup();

    // Route from Location 1 to the selected venue
    if (location1Coords) {
        routeControl1 = L.Routing.control({
            waypoints: [
                L.latLng(location1Coords.lat, location1Coords.lon),
                L.latLng(venue.lat, venue.lon)
            ],
            routeWhileDragging: false,
            createMarker: () => null,  // Remove default markers
            lineOptions: {
                styles: [{ color: 'blue', opacity: 0.7, weight: 5 }]
            }
        }).addTo(map);
    }

    // Route from Location 2 to the selected venue
    if (location2Coords) {
        routeControl2 = L.Routing.control({
            waypoints: [
                L.latLng(location2Coords.lat, location2Coords.lon),
                L.latLng(venue.lat, venue.lon)
            ],
            routeWhileDragging: false,
            createMarker: () => null,  // Remove default markers
            lineOptions: {
                styles: [{ color: 'green', opacity: 0.7, weight: 5 }]
            }
        }).addTo(map);
    }
}
