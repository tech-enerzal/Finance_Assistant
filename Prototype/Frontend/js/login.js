/**
 * @fileoverview Manages user authentication interactions, including login and signup processes.
 * Handles UI transitions between login and registration forms, submits authentication requests
 * to the backend API, and manages responses such as jwtToken storage and QR code display for TOTP.
 * @version 1.1
 */

/**
 * Selects the main wrapper element that contains both login and registration forms.
 * @type {HTMLElement}
 */
const wrapper = document.querySelector('.wrapper');

/**
 * Selects the link element that triggers the registration form display.
 * @type {HTMLElement}
 */
const registerLink = document.querySelector('.register-link');

/**
 * Selects the link element that triggers the login form display.
 * @type {HTMLElement}
 */
const loginLink = document.querySelector('.login-link');

/**
 * Event handler for the registration link click.
 * Adds the 'active' class to the wrapper to display the registration form.
 */
registerLink.onclick = () => {
    wrapper.classList.add('active');
    console.log("Switched to the registration form.");
};

/**
 * Event handler for the login link click.
 * Removes the 'active' class from the wrapper to display the login form.
 */
loginLink.onclick = () => {
    wrapper.classList.remove('active');
    console.log("Switched to the login form.");
};

/**
 * Selects the login form element by its ID.
 * @type {HTMLFormElement}
 */
const loginForm = document.getElementById('login-form');

/**
 * Event handler for the login form submission.
 * Prevents the default form submission, collects user input, sends a POST request to the login API,
 * handles the response by storing the jwtToken and redirecting on success, or alerting the user on failure.
 * @param {Event} e - The form submission event.
 */
loginForm.onsubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Retrieve user input values from the form fields
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const totp = document.getElementById('totp').value;

    // Construct the data object to be sent in the POST request
    const data = { email, password, token: totp };  // Ensure TOTP is passed as `token`
    console.log("Login form submitted with data:", data);

    try {
        // Send a POST request to the login API endpoint with the user credentials
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // Convert the data object to a JSON string
        });

        // Parse the JSON response from the server
        const result = await response.json();
        console.log("Received response from login API:", result);

        if (response.ok) {
            // Store the token as "jwtToken" for consistency across pages
            localStorage.setItem('jwtToken', result.token);
            console.log("JWT token stored in localStorage:", result.token);

            // Log whether it's the user's first time
            console.log("User first-time login status:", result.first_time);

            // Redirect user based on first_time flag
            if (result.first_time) {
                console.log("Redirecting to first-time form...");
                window.location.href = '/pages/form.html'; // Redirect to form for first-time login
            } else {
                console.log("Redirecting to dashboard...");
                window.location.href = '/pages/dashboard.html'; // Redirect to dashboard for returning users
            }
        } else {
            alert(result.msg || 'Login failed.');
            console.log("Login failed with message:", result.msg || 'No message provided.');
        }
    } catch (error) {
        console.error("Error during login request:", error);
        alert('Login failed.');
    }
};


/**
 * Selects the signup form element by its ID.
 * @type {HTMLFormElement}
 */
const signupForm = document.getElementById('signup-form');

/**
 * Event handler for the signup form submission.
 * Prevents the default form submission, validates user input, sends a POST request to the signup API,
 * handles the response by displaying a QR code for TOTP setup on success, or alerting the user on failure.
 * @param {Event} e - The form submission event.
 */
signupForm.onsubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Retrieve user input values from the form fields
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Ensure both email and password fields have values
    if (!email || !password) {
        alert('Please provide both email and password.');
        console.log("Signup failed: Email or password missing.");
        return;
    }

    // Construct the data object to be sent in the POST request
    const data = { email, password };
    console.log("Signup form submitted with data:", data);

    try {
        // Send a POST request to the signup API endpoint with the user credentials
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)  // Convert the data object to a JSON string
        });

        // Parse the JSON response from the server
        const result = await response.json();
        console.log("Received response from signup API:", result);

        if (response.ok) {
            // If the response is successful, alert the user with the success message
            alert(result.msg);
            console.log("User registered successfully. Displaying TOTP QR code.");

            // Open a new window to display the QR code for TOTP setup
            const newWindow = window.open("", "_blank", "width=400,height=400");
            newWindow.document.write(`<html><head><title>Scan QR Code for TOTP</title></head>`);
            newWindow.document.write(`<body style="text-align:center;"><h3>Scan this QR Code for TOTP</h3>`);
            newWindow.document.write(`<img src="data:image/png;base64,${result.qrcode}" alt="QR Code" style="width: 200px; height: 200px;">`);
            newWindow.document.write(`</body></html>`);
        } else {
            // If the response is not successful, alert the user with the received message or a default message
            alert(result.msg || 'Signup failed.');
            console.log("Signup failed with message:", result.msg || 'No message provided.');
        }
    } catch (error) {
        // Log any errors to the console and alert the user of the failure
        console.error("Error during signup request:", error);
        alert('An error occurred during signup.');
    }
};
