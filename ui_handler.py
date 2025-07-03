from validators import validate_name, validate_phone, validate_email

class UIHandler:
    def __init__(self, contact_manager):
        self.contact_manager = contact_manager

    def display_main_menu(self):
        print("\n" + "="*50)
        print("                CONTACT BOOK")
        print("="*50)
        print("1. Add New Contact")
        print("2. View All Contacts")
        print("3. Search Contacts")
        print("4. Update Contact")
        print("5. Delete Contact")
        print("6. Contact Statistics")
        print("7. Exit")
        print("-"*50)

    def get_menu_choice(self):
        while True:
            try:
                choice = input("Enter your choice (1-7): ").strip()
                if choice in [str(i) for i in range(1, 8)]:
                    return int(choice)
                print("Please enter a number between 1 and 7.")
            except KeyboardInterrupt:
                print("\nExiting...")
                return 7

    def display_contact(self, contact, show_details=True):
        print(f"\nName: {contact.name}")
        print(f"Phone: {contact.phone}")
        if show_details:
            if contact.email:
                print(f"Email: {contact.email}")
            if contact.address:
                print(f"Address: {contact.address}")
            print(f"Created: {contact.created_at}")
            if contact.updated_at != contact.created_at:
                print(f"Updated: {contact.updated_at}")
        print("-" * 40)

    def display_contact_list(self):
        contacts = self.contact_manager.view_all_contacts()
        if not contacts:
            print("\nNo contacts found.")
            return
        print(f"\nTotal Contacts: {len(contacts)}")
        print("="*50)
        for i, contact in enumerate(contacts, 1):
            print(f"{i}. {contact.name} - {contact.phone}")
            if contact.email:
                print(f"   Email: {contact.email}")
            print()

    def get_contact_input(self):
        print("\nEnter contact information:")
        while True:
            name = input("Name: ").strip()
            valid, error = validate_name(name)
            if valid:
                break
            print(f"Error: {error}")
        while True:
            phone = input("Phone: ").strip()
            valid, error = validate_phone(phone)
            if valid:
                break
            print(f"Error: {error}")
        while True:
            email = input("Email (optional): ").strip()
            valid, error = validate_email(email)
            if valid:
                break
            print(f"Error: {error}")
        address = input("Address (optional): ").strip()
        return name, phone, email, address

    def search_interface(self):
        search_term = input("\nEnter name or phone number to search: ").strip()
        if not search_term:
            print("Search term cannot be empty.")
            return
        results = self.contact_manager.search_contacts(search_term)
        if not results:
            print("No contacts found matching your search.")
            return
        print(f"\nFound {len(results)} contact(s):")
        print("="*40)
        for contact in results:
            self.display_contact(contact)
