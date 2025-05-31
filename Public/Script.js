async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const { token, role } = await response.json();
        if (token) {
            localStorage.setItem('token', token);
            document.getElementById('auth-forms').style.display = 'none';
            document.getElementById('subscription-form').style.display = 'block';
            if (role === 'admin') {
                document.getElementById('admin-panel').style.display = 'block';
            }
            checkStatus();
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

async function signup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const { token } = await response.json();
        if (token) {
            localStorage.setItem('token', token);
            document.getElementById('auth-forms').style.display = 'none';
            document.getElementById('subscription-form').style.display = 'block';
            checkStatus();
        } else {
            alert('Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed');
    }
}

async function submitPayment() {
    const plan = document.getElementById('plan-select').value;
    const cardNumber = document.getElementById('card-number').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    try {
        const response = await fetch('/api/payment/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ plan, cardNumber, cardExpiry, cardCvv })
        });
        const result = await response.json();
        if (result.success) {
            alert('Payment request submitted. Await admin approval.');
        } else {
            alert('Payment submission failed: ' + result.error);
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment submission failed');
    }
}

async function getAllUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const users = await response.json();
        document.getElementById('user-list').innerHTML = users.map(user => `<p>${user.email} (${user.subscription})</p>`).join('');
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users');
    }
}

async function getPaymentRequests() {
    try {
        const response = await fetch('/api/admin/payment-requests', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const requests = await response.json();
        document.getElementById('payment-requests').innerHTML = requests.map(req => `
            <div class="payment-request">
                <p>Email: ${req.email}</p>
                <p>Plan: ${req.plan}</p>
                <p>Card: **** **** **** ${req.cardNumber.slice(-4)}</p>
                <p>Status: ${req.status}</p>
                <button onclick="managePayment('${req._id}', 'approve')">Approve</button>
                <button onclick="managePayment('${req._id}', 'reject')">Reject</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching payment requests:', error);
        alert('Failed to fetch payment requests');
    }
}

async function managePayment(requestId, action) {
    try {
        const response = await fetch(`/api/admin/payment-requests/${requestId}/${action}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        if (result.success) {
            alert(`Payment request ${action}d`);
            getPaymentRequests();
        } else {
            alert(`Failed to ${action} payment: ` + result.error);
        }
    } catch (error) {
        console.error(`${action} error:`, error);
        alert(`Failed to ${action} payment`);
    }
}

async function loadWebsite() {
    const urlInput = document.getElementById('url-input').value;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
    }
    try {
        const response = await fetch('/api/search/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ url: urlInput })
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('browser-frame').src = urlInput;
            if (result.remainingSearches !== undefined) {
                document.getElementById('searches-remaining').textContent = result.remainingSearches;
            }
        } else {
            alert('Search failed: ' + result.error);
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('Search failed');
    }
}

function goBack() {
    document.getElementById('browser-frame').contentWindow.history.back();
}

function goForward() {
    document.getElementById('browser-frame').contentWindow.history.forward();
}

async function checkStatus() {
    try {
        const response = await fetch('/api/auth/status', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const { loggedIn, subscription, role, remainingSearches } = await response.json();
        document.getElementById('auth-status').textContent = loggedIn ? 'Logged in' : 'Not logged in';
        document.getElementById('subscription-status').textContent = subscription || 'No subscription';
        document.getElementById('admin-panel').style.display = role === 'admin' ? 'block' : 'none';
        document.getElementById('auth-forms').style.display = loggedIn ? 'none' : 'block';
        document.getElementById('subscription-form').style.display = loggedIn && subscription === 'none' ? 'block' : 'none';
        document.getElementById('search-limit').style.display = loggedIn && subscription === 'none' && remainingSearches !== undefined ? 'block' : 'none';
        if (remainingSearches !== undefined) {
            document.getElementById('searches-remaining').textContent = remainingSearches;
        }
    } catch (error) {
        console.error('Status check error:', error);
    }
}

checkStatus();
