from contact import Contact
from validators import validate_contact_data

class ContactManager:
    def __init__(self, storage_handler):
        self.storage = storage_handler
        self.contacts = self.storage.load_contacts()

    def add_contact(self, name, phone, email="", address=""):
        is_valid, errors = validate_contact_data(name, phone, email, address)
        if not is_valid:
            return False, errors

        if self.find_contact_by_phone(phone):
            return False, ["Contact with this phone number already exists"]

        contact = Contact(name, phone, email, address)
        self.contacts.append(contact)
        if self.storage.save_contacts(self.contacts):
            return True, ["Contact added successfully"]
        return False, ["Failed to save contact"]

    def view_all_contacts(self):
        return sorted(self.contacts, key=lambda c: c.name.lower())

    def search_contacts(self, search_term):
        if not search_term:
            return []
        search_term = search_term.lower().strip()
        return [c for c in self.contacts if search_term in c.name.lower() or search_term in ''.join(filter(str.isdigit, c.phone))]

    def find_contact_by_phone(self, phone):
        phone_digits = ''.join(filter(str.isdigit, phone))
        for contact in self.contacts:
            if ''.join(filter(str.isdigit, contact.phone)) == phone_digits:
                return contact
        return None

    def update_contact(self, phone, **kwargs):
        contact = self.find_contact_by_phone(phone)
        if not contact:
            return False, ["Contact not found"]

        name = kwargs.get('name', contact.name)
        new_phone = kwargs.get('phone', contact.phone)
        email = kwargs.get('email', contact.email)
        address = kwargs.get('address', contact.address)

        is_valid, errors = validate_contact_data(name, new_phone, email, address)
        if not is_valid:
            return False, errors

        if new_phone != contact.phone and self.find_contact_by_phone(new_phone):
            return False, ["Another contact with this phone number already exists"]

        contact.update_contact(**kwargs)
        if self.storage.save_contacts(self.contacts):
            return True, ["Contact updated successfully"]
        return False, ["Failed to save changes"]

    def delete_contact(self, phone):
        contact = self.find_contact_by_phone(phone)
        if not contact:
            return False, ["Contact not found"]

        self.contacts.remove(contact)
        if self.storage.save_contacts(self.contacts):
            return True, ["Contact deleted successfully"]
        return False, ["Failed to delete contact"]

    def get_contact_count(self):
        return len(self.contacts)
