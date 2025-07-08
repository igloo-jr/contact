// Contact storage and management
let contacts = [];
let editingId = null;
let webAppUrl = '';

// Load contacts and configuration on page load
document.addEventListener('DOMContentLoaded', function() {
    loadConfiguration();
    loadContacts();
    updateStats();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Contact form submission
    document.getElementById('contactForm').addEventListener('submit', handleFormSubmit);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Clear form button
    document.getElementById('clearForm').addEventListener('click', clearForm);
    
    // Sync button
    document.getElementById('syncBtn').addEventListener('click', syncWithGoogleSheets);
    
    // Modal functionality
    const modal = document.getElementById('configModal');
    const closeModal = document.querySelector('.close');
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Show config modal if no web app URL is set
    if (!webAppUrl) {
        setTimeout(() => {
            modal.style.display = 'block';
        }, 1000);
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    
    try {
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            category: document.getElementById('category').value,
            company: document.getElementById('company').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            dateAdded: new Date().toISOString()
        };

        if (editingId) {
            await updateContact(editingId, formData);
        } else {
            await addContact(formData);
        }

        clearForm();
        await loadContacts();
        updateStats();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Error saving contact. Please try again.', 'error');
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
    }
}

// Add contact function
async function addContact(contactData) {
    const contact = {
        id: Date.now(),
        ...contactData
    };
    
    // Add to local storage immediately
    contacts.push(contact);
    saveContactsLocally();
    
    // Sync with Google Sheets if configured
    if (webAppUrl) {
        try {
            await syncContactToGoogleSheets(contact, 'ADD');
            showNotification('Contact added and synced to Google Sheets!', 'success');
        } catch (error) {
            console.error('Sync error:', error);
            showNotification('Contact added locally. Sync failed - check your Google Sheets configuration.', 'info');
            updateSyncStatus('❌');
        }
    } else {
        showNotification('Contact added locally!', 'success');
    }
}

// Update contact function
async function updateContact(id, contactData) {
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
        const updatedContact = { ...contacts[index], ...contactData };
        contacts[index] = updatedContact;
        saveContactsLocally();
        
        // Sync with Google Sheets if configured
        if (webAppUrl) {
            try {
                await syncContactToGoogleSheets(updatedContact, 'UPDATE');
                showNotification('Contact updated and synced to Google Sheets!', 'success');
            } catch (error) {
                console.error('Sync error:', error);
                showNotification('Contact updated locally. Sync failed.', 'info');
                updateSyncStatus('❌');
            }
        } else {
            showNotification('Contact updated locally!', 'success');
        }
    }
    editingId = null;
}

// Delete contact function
async function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        const contactToDelete = contacts.find(c => c.id === id);
        contacts = contacts.filter(c => c.id !== id);
        saveContactsLocally();
        displayContacts();
        updateStats();
        
        // Sync deletion with Google Sheets if configured
        if (webAppUrl && contactToDelete) {
            try {
                await syncContactToGoogleSheets(contactToDelete, 'DELETE');
                showNotification('Contact deleted and synced to Google Sheets!', 'success');
            } catch (error) {
                console.error('Sync error:', error);
                showNotification('Contact deleted locally. Sync failed.', 'info');
                updateSyncStatus('❌');
            }
        } else {
            showNotification('Contact deleted locally!', 'success');
        }
    }
}

// Edit contact function
function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        document.getElementById('firstName').value = contact.firstName;
        document.getElementById('lastName').value = contact.lastName;
        document.getElementById('phone').value = contact.phone;
        document.getElementById('email').value = contact.email;
        document.getElementById('category').value = contact.category;
        document.getElementById('company').value = contact.company;
        document.getElementById('notes').value = contact.notes;
        editingId = id;
        
        // Update submit button text
        document.getElementById('submitText').textContent = 'Update Contact';
        
        // Scroll to form
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    }
}

// Clear form function
function clearForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('submitText').textContent = 'Add Contact';
    editingId = null;
}

// Display contacts function
function displayContacts(contactsToShow = contacts) {
    const container = document.getElementById('contactsContainer');
    
    if (contactsToShow.length === 0) {
        container.innerHTML = `
            <div class="no-contacts">
                <h3>No contacts found</h3>
                <p>Try adjusting your search or add a new contact!</p>
            </div>
        `;
        return;
    }

    const contactsHTML = contactsToShow.map(contact => `
        <div class="contact-card">
            <div class="contact-name">${contact.firstName} ${contact.lastName}</div>
            <div class="contact-info">📞 ${contact.phone}</div>
            ${contact.email ? `<div class="contact-info">✉️ ${contact.email}</div>` : ''}
            ${contact.company ? `<div class="contact-info">🏢 ${contact.company}</div>` : ''}
            <div class="contact-info">📂 ${contact.category}</div>
            ${contact.notes ? `<div class="contact-info">📝 ${contact.notes}</div>` : ''}
            <div class="contact-actions">
                <button class="btn btn-small" onclick="editContact(${contact.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteContact(${contact.id})">Delete</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="contacts-grid">${contactsHTML}</div>`;
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredContacts = contacts.filter(contact =>
        contact.firstName.toLowerCase().includes(searchTerm) ||
        contact.lastName.toLowerCase().includes(searchTerm) ||
        contact.phone.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.company.toLowerCase().includes(searchTerm)
    );
    displayContacts(filteredContacts);
}

// Google Sheets Integration Functions
async function syncContactToGoogleSheets(contact, action) {
    if (!webAppUrl) {
        throw new Error('Google Sheets not configured');
    }
    
    const payload = {
        action: action,
        contact: contact
    };
    
    const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.error) {
        throw new Error(result.error);
    }
    
    updateSyncStatus('✅');
    return result;
}

async function syncWithGoogleSheets() {
    if (!webAppUrl) {
        showNotification('Please configure Google Sheets first', 'error');
        document.getElementById('configModal').style.display = 'block';
        return;
    }
    
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.disabled = true;
    syncBtn.innerHTML = '<span class="loader"></span> Syncing...';
    
    try {
        // Load all contacts from Google Sheets
        const response = await fetch(webAppUrl + '?action=GET_ALL');
        if (!response.ok) {
            throw new Error('Failed to fetch from Google Sheets');
        }
        
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Update local contacts with Google Sheets data
        contacts = result.contacts || [];
        saveContactsLocally();
        displayContacts();
        updateStats();
        updateSyncStatus('✅');
        
        showNotification('Successfully synced with Google Sheets!', 'success');
        
    } catch (error) {
        console.error('Sync error:', error);
        showNotification('Sync failed. Please check your configuration.', 'error');
        updateSyncStatus('❌');
    } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = 'Sync with Google Sheets';
    }
}

// Local storage functions
function saveContactsLocally() {
    try {
        localStorage.setItem('contactBookData', JSON.stringify(contacts));
    } catch (error) {
        console.error('Error saving contacts locally:', error);
    }
}

function loadContacts() {
    try {
        const saved = localStorage.getItem('contactBookData');
        if (saved) {
            contacts = JSON.parse(saved);
            displayContacts();
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
        contacts = [];
    }
}

// Configuration functions
function saveConfig() {
    const url = document.getElementById('webAppUrl').value.trim();
    if (url) {
        webAppUrl = url;
        localStorage.setItem('googleSheetsWebAppUrl', url);
        document.getElementById('configModal').style.display = 'none';
        showNotification('Google Sheets configuration saved!', 'success');
        updateSyncStatus('✅');
    } else {
        showNotification('Please enter a valid Web App URL', 'error');
    }
}

function loadConfiguration() {
    const saved = localStorage.getItem('googleSheetsWebAppUrl');
    if (saved) {
        webAppUrl = saved;
        document.getElementById('webAppUrl').value = saved;
        updateSyncStatus('✅');
    }
}

// Update statistics
function updateStats() {
    const totalContacts = contacts.length;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentContacts = contacts.filter(c => new Date(c.dateAdded) > weekAgo).length;

    document.getElementById('totalContacts').textContent = totalContacts;
    document.getElementById('recentContacts').textContent = recentContacts;
}

// Update sync status
function updateSyncStatus(status) {
    document.getElementById('syncStatus').textContent = status;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Export contacts function
function exportContacts() {
    const csvHeader = 'First Name,Last Name,Phone,Email,Category,Company,Notes,Date Added\n';
    const csvContent = contacts.map(contact => 
        `"${contact.firstName}","${contact.lastName}","${contact.phone}","${contact.email}","${contact.category}","${contact.company}","${contact.notes}","${contact.dateAdded}"`
    ).join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Make functions available globally
window.editContact = editContact;
window.deleteContact = deleteContact;
window.exportContacts = exportContacts;
window.saveConfig = saveConfig;
