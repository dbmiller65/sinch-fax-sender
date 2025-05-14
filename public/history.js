document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading');
  const historyError = document.getElementById('historyError');
  const historyContent = document.getElementById('historyContent');
  const historyTableBody = document.getElementById('historyTableBody');
  const faxDetails = document.getElementById('faxDetails');
  const faxDetailsContent = document.getElementById('faxDetailsContent');
  const closeModal = document.querySelector('.close');
  
  // Close modal when clicking the X
  closeModal.addEventListener('click', () => {
    faxDetails.classList.add('hidden');
  });
  
  // Close modal when clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target === faxDetails) {
      faxDetails.classList.add('hidden');
    }
  });
  
  // Format phone number from +1XXXXXXXXXX to (XXX) XXX-XXXX
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return 'Unknown';
    
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a US number (10 or 11 digits with leading 1)
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    } else if (digits.length === 11 && digits.charAt(0) === '1') {
      return `(${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
    }
    
    // Return original if not a standard US number
    return phoneNumber;
  };
  
  // Format date/time
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Unknown';
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  // Show fax details in modal
  const showFaxDetails = (fax) => {
    // Format error message if present
    let errorInfo = '';
    if (fax.status === 'FAILURE') {
      errorInfo = `
        <div class="error-details">
          <p><strong>Error Type:</strong> ${fax.errorType || 'Unknown'}</p>
          <p><strong>Error Message:</strong> ${fax.errorMessage || 'Unknown'}</p>
          <p><strong>Error Code:</strong> ${fax.errorCode || 'Unknown'}</p>
        </div>
      `;
    }
    
    // Format retry information
    const retryInfo = `
      <p><strong>Retry Count:</strong> ${fax.retryCount || '0'} of ${fax.maxRetries || '0'}</p>
      <p><strong>Retry Delay:</strong> ${fax.retryDelaySeconds || '0'} seconds</p>
    `;
    
    // Format dates
    const createTime = formatDateTime(fax.createTime);
    const completedTime = fax.completedTime ? formatDateTime(fax.completedTime) : 'Not completed';
    
    // Build details HTML
    faxDetailsContent.innerHTML = `
      <div class="fax-detail-grid">
        <p><strong>Fax ID:</strong> ${fax.id}</p>
        <p><strong>Status:</strong> <span class="status-${fax.status.toLowerCase()}">${fax.status}</span></p>
        <p><strong>To:</strong> ${formatPhoneNumber(fax.to)}</p>
        <p><strong>Pages:</strong> ${fax.numberOfPages || '0'}</p>
        <p><strong>Created:</strong> ${createTime}</p>
        <p><strong>Completed:</strong> ${completedTime}</p>
        <p><strong>Direction:</strong> ${fax.direction || 'Unknown'}</p>
        <p><strong>Resolution:</strong> ${fax.resolution || 'Unknown'}</p>
        ${errorInfo}
        ${retryInfo}
      </div>
    `;
    
    // Show the modal
    faxDetails.classList.remove('hidden');
  };
  
  // Fetch fax history
  const fetchHistory = async () => {
    try {
      loading.classList.remove('hidden');
      historyError.classList.add('hidden');
      historyContent.classList.add('hidden');
      
      const response = await fetch('/api/fax-history');
      const data = await response.json();
      
      if (!data.faxes || !Array.isArray(data.faxes)) {
        throw new Error('Invalid response format');
      }
      
      // Sort faxes by create time (newest first)
      const faxes = data.faxes.sort((a, b) => {
        return new Date(b.createTime) - new Date(a.createTime);
      });
      
      // Clear existing rows
      historyTableBody.innerHTML = '';
      
      if (faxes.length === 0) {
        historyTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="no-data">No fax history found</td>
          </tr>
        `;
      } else {
        // Add fax history rows
        faxes.forEach(fax => {
          const row = document.createElement('tr');
          
          // Determine status class
          let statusClass = 'status-unknown';
          if (fax.status === 'SUCCESS') {
            statusClass = 'status-success';
          } else if (fax.status === 'FAILURE') {
            statusClass = 'status-failure';
          } else if (fax.status === 'IN_PROGRESS') {
            statusClass = 'status-in-progress';
          }
          
          row.innerHTML = `
            <td>${formatDateTime(fax.createTime)}</td>
            <td>${formatPhoneNumber(fax.to)}</td>
            <td class="${statusClass}">${fax.status}</td>
            <td>${fax.numberOfPages || '0'}</td>
            <td><button class="details-btn" data-fax-id="${fax.id}">View Details</button></td>
          `;
          
          historyTableBody.appendChild(row);
        });
        
        // Add event listeners to detail buttons
        document.querySelectorAll('.details-btn').forEach(button => {
          button.addEventListener('click', () => {
            const faxId = button.getAttribute('data-fax-id');
            const fax = faxes.find(f => f.id === faxId);
            if (fax) {
              showFaxDetails(fax);
            }
          });
        });
      }
      
      // Show content
      loading.classList.add('hidden');
      historyContent.classList.remove('hidden');
      
    } catch (error) {
      console.error('Error fetching fax history:', error);
      loading.classList.add('hidden');
      historyError.classList.remove('hidden');
      historyError.textContent = `Error loading fax history: ${error.message}`;
    }
  };
  
  // Add refresh button functionality
  const addRefreshButton = () => {
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh';
    refreshButton.classList.add('refresh-btn');
    refreshButton.addEventListener('click', fetchHistory);
    
    const historyHeading = document.querySelector('.card h2');
    historyHeading.appendChild(document.createTextNode(' '));
    historyHeading.appendChild(refreshButton);
  };
  
  // Initialize
  addRefreshButton();
  fetchHistory();
});
