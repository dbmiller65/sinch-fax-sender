document.addEventListener('DOMContentLoaded', () => {
  const faxForm = document.getElementById('faxForm');
  const sendButton = document.getElementById('sendButton');
  const result = document.getElementById('result');
  const resultContent = document.getElementById('resultContent');
  const phoneInput = document.getElementById('to');
  
  // Add phone number formatting
  phoneInput.addEventListener('input', (e) => {
    // Get only the digits from the input
    let digits = e.target.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    digits = digits.substring(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (digits.length > 0) {
      if (digits.length <= 3) {
        e.target.value = '(' + digits;
      } else if (digits.length <= 6) {
        e.target.value = '(' + digits.substring(0, 3) + ') ' + digits.substring(3);
      } else {
        e.target.value = '(' + digits.substring(0, 3) + ') ' + 
                         digits.substring(3, 6) + '-' + digits.substring(6);
      }
    }
  });

  faxForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
    
    // Get form data
    const formData = new FormData(faxForm);
    
    try {
      // Send request to server
      const response = await fetch('/send-fax', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      // Display result
      result.classList.remove('hidden');
      
      if (data.success) {
        resultContent.innerHTML = `
          <div class="success">
            <p><strong>Success!</strong> Your fax has been queued for sending.</p>
            <p>Fax ID: ${data.faxId || 'Processing'}</p>
            <p>Status: ${data.status || 'Processing'}</p>
            <p>Sinch will process your fax and attempt delivery shortly.</p>
          </div>
        `;
      } else {
        resultContent.innerHTML = `
          <div class="error">
            <p><strong>Error:</strong> ${data.message || data.error || 'An unknown error occurred'}</p>
          </div>
        `;
      }
    } catch (error) {
      // Display error
      result.classList.remove('hidden');
      resultContent.innerHTML = `
        <div class="error">
          <p><strong>Error:</strong> Failed to send request. Please try again.</p>
          <p>${error.message}</p>
        </div>
      `;
    } finally {
      // Reset button state
      sendButton.disabled = false;
      sendButton.textContent = 'Send Fax';
    }
  });
});
