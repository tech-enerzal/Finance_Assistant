document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Retrieve the JWT token from localStorage
            const token = localStorage.getItem('jwtToken');

            if (!token) {
                alert('You are not logged in. Please log in first.');
                window.location.href = '/login.html'; // Redirect to login page
                return;
            }

            const response = await fetch('http://127.0.0.1:5000/api/submit_form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Include token in request header
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);  // Show success message
                window.location.href = '/pages/dashboard.html';  // Redirect to dashboard
            } else {
                alert('Error: ' + result.message);  // Show error message if not successful
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting form data');
        }
    });
});
