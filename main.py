from contact_manager import ContactManager
from storage import StorageHandler
from ui_handler import UIHandler


def main():
    print("Welcome to Contact Book!")
    storage = StorageHandler()
    manager = ContactManager(storage)
    ui = UIHandler(manager)

    while True:
        try:
            ui.display_main_menu()
            choice = ui.get_menu_choice()

            if choice == 1:
                name, phone, email, address = ui.get_contact_input()
                success, messages = manager.add_contact(name, phone, email, address)
                for msg in messages:
                    print("✓" if success else "✗", msg)

            elif choice == 2:
                ui.display_contact_list()

            elif choice == 3:
                ui.search_interface()

            elif choice == 4:
                phone = input("\nEnter phone number of contact to update: ").strip()
                contact = manager.find_contact_by_phone(phone)
                if not contact:
                    print("Contact not found.")
                    continue
                print("\nCurrent contact information:")
                ui.display_contact(contact)
                print("\nEnter new information (press Enter to keep current):")
                new_name = input(f"Name ({contact.name}): ").strip()
                new_phone = input(f"Phone ({contact.phone}): ").strip()
                new_email = input(f"Email ({contact.email}): ").strip()
                new_address = input(f"Address ({contact.address}): ").strip()
                updates = {}
                if new_name: updates['name'] = new_name
                if new_phone: updates['phone'] = new_phone
                if new_email: updates['email'] = new_email
                if new_address: updates['address'] = new_address
                if updates:
                    success, messages = manager.update_contact(phone, **updates)
                    for msg in messages:
                        print("✓" if success else "✗", msg)
                else:
                    print("No changes made.")

            elif choice == 5:
                phone = input("\nEnter phone number of contact to delete: ").strip()
                contact = manager.find_contact_by_phone(phone)
                if not contact:
                    print("Contact not found.")
                    continue
                ui.display_contact(contact)
                confirm = input("Are you sure you want to delete this contact? (y/N): ").strip().lower()
                if confirm == 'y':
                    success, messages = manager.delete_contact(phone)
                    for msg in messages:
                        print("✓" if success else "✗", msg)
                else:
                    print("Deletion cancelled.")

            elif choice == 6:
                count = manager.get_contact_count()
                print("\nContact Statistics:")
                print(f"Total contacts: {count}")
                if count > 0:
                    with_email = sum(1 for c in manager.contacts if c.email)
                    with_address = sum(1 for c in manager.contacts if c.address)
                    print(f"Contacts with email: {with_email}")
                    print(f"Contacts with address: {with_address}")

            elif choice == 7:
                print("\nThank you for using Contact Book!")
                break

            input("\nPress Enter to continue...")

        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"\nAn error occurred: {e}")
            input("Press Enter to continue...")


if __name__ == "__main__":
    main()
