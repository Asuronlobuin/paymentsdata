// Replace with your Render backend URL
const RENDER_BACKEND_URL = 'https://paymentsdata.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // Logic for the payment form page
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const amount = document.getElementById('amount').value;
            const messageEl = document.getElementById('message');

            try {
                const response = await fetch(`${RENDER_BACKEND_URL}/api/submit-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, phone, amount }),
                });

                const result = await response.json();
                if (response.ok) {
                    messageEl.textContent = 'Payment submitted successfully!';
                    messageEl.style.color = 'green';
                    paymentForm.reset();
                } else {
                    messageEl.textContent = `Error: ${result.message}`;
                    messageEl.style.color = 'red';
                }
            } catch (error) {
                messageEl.textContent = 'An unexpected error occurred.';
                messageEl.style.color = 'red';
                console.error('Submission error:', error);
            }
        });
    }

    // Logic for the data display page
    const dataTableBody = document.querySelector('#dataTable tbody');
    if (dataTableBody) {
        async function fetchData() {
            try {
                const response = await fetch(`${RENDER_BACKEND_URL}/api/get-payments`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const payments = await response.json();
                
                dataTableBody.innerHTML = ''; // Clear existing data
                
                payments.forEach(payment => {
                    const row = document.createElement('tr');
                    const date = new Date(payment.created_at).toLocaleString();
                    row.innerHTML = `
                        <td>${payment.name}</td>
                        <td>${payment.phone}</td>
                        <td>${payment.amount}</td>
                        <td>${date}</td>
                    `;
                    dataTableBody.appendChild(row);
                });

            } catch (error) {
                console.error('Error fetching data:', error);
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4" style="text-align: center; color: red;">Error loading data. Please try again.</td>`;
                dataTableBody.appendChild(row);
            }
        }
        fetchData();
    }
});