// Google Apps Script for Contact Book - Google Sheets Integration
// This script should be deployed as a web app with "Anyone" access

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const contact = data.contact;
    
    switch (action) {
      case 'ADD':
        return addContact(contact);
      case 'UPDATE':
        return updateContact(contact);
      case 'DELETE':
        return deleteContact(contact);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'GET_ALL') {
      return getAllContacts();
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSpreadsheet() {
  // Get the active spreadsheet or create a new one
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create('Contact Book Data');
  }
  
  let sheet = spreadsheet.getSheetByName('Contacts');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Contacts');
    // Add headers
    sheet.getRange(1, 1, 1, 8).setValues([
      ['ID', 'First Name', 'Last Name', 'Phone', 'Email', 'Category', 'Company', 'Notes', 'Date Added']
    ]);
    // Format header row
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#3498db').setFontColor('white');
  }
  
  return sheet;
}

function addContact(contact) {
  try {
    const sheet = getSpreadsheet();
    const newRow = [
      contact.id,
      contact.firstName,
      contact.lastName,
      contact.phone,
      contact.email,
      contact.category,
      contact.company,
      contact.notes,
      contact.dateAdded
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Contact added successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateContact(contact) {
  try {
    const sheet = getSpreadsheet();
    const data = sheet.getDataRange().getValues();
    
    // Find the row with matching ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == contact.id) {
        // Update the row
        const updatedRow = [
          contact.id,
          contact.firstName,
          contact.lastName,
          contact.phone,
          contact.email,
          contact.category,
          contact.company,
          contact.notes,
          contact.dateAdded
        ];
        
        sheet.getRange(i + 1, 1, 1, 9).setValues([updatedRow]);
        
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, message: 'Contact updated successfully' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Contact not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteContact(contact) {
  try {
    const sheet = getSpreadsheet();
    const data = sheet.getDataRange().getValues();
    
    // Find the row with matching ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == contact.id) {
        sheet.deleteRow(i + 1);
        
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, message: 'Contact deleted successfully' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Contact not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllContacts() {
  try {
    const sheet = getSpreadsheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ contacts: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const contacts = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      contacts.push({
        id: row[0],
        firstName: row[1],
        lastName: row[2],
        phone: row[3],
        email: row[4],
        category: row[5],
        company: row[6],
        notes: row[7],
        dateAdded: row[8]
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ contacts: contacts }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Utility function to clear all contacts (for testing)
function clearAllContacts() {
  const sheet = getSpreadsheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'All contacts cleared' }))
    .setMimeType(ContentService.MimeType.JSON);
}
