const API_URL = 'http://localhost:5134/api/auth'; // Backend server URL

function toggleForms() {
  const loginSection = document.getElementById('loginSection');
  const signupSection = document.getElementById('signupSection');
  const loginsignupL = document.getElementById('loginsignupL');
  const loginsignupS = document.getElementById('loginsignupL');

  if (loginSection.classList.contains('hidden')) {
    loginSection.classList.remove('hidden');
    signupSection.classList.add('hidden');

    
    
  } else {
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
  }

}


// Signup function
async function signup(event) {
  event.preventDefault(); // Prevent form submission

  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password }),
  });

  const data = await response.json();
  alert(data.message || 'Signup successful');
}

// Login function
async function login(event) {
  event.preventDefault(); // Prevent form submission

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    alert('Login successful');
    // Redirect to map.html
    window.location.href = 'map.html';
  } else {
    alert(data.message || 'Login failed');
  }
}


// Access protected route
async function getProtectedData() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please log in first.');
    return;
  }

  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    document.getElementById('profile-data').innerText = JSON.stringify(data);
  } else {
    alert('Access denied');
  }
}

// Attach event listeners for form submissions
document.getElementById('signupForm').addEventListener('submit', signup);
document.getElementById('loginForm').addEventListener('submit', login);
