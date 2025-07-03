import json
import os
from contact import Contact

class StorageHandler:
    def __init__(self, file_path="data/contacts.json"):
        self.file_path = file_path
        self._ensure_data_directory()

    def _ensure_data_directory(self):
        directory = os.path.dirname(self.file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

    def save_contacts(self, contacts):
        try:
            data = [contact.to_dict() for contact in contacts]
            with open(self.file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving contacts: {e}")
            return False

    def load_contacts(self):
        if not os.path.exists(self.file_path):
            return []
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                return [Contact.from_dict(item) for item in data]
        except Exception as e:
            print(f"Error loading contacts: {e}")
            return []

    def backup_contacts(self, backup_path=None):
        if not backup_path:
            backup_path = f"{self.file_path}.backup"
        try:
            if os.path.exists(self.file_path):
                with open(self.file_path, 'r') as source:
                    with open(backup_path, 'w') as backup:
                        backup.write(source.read())
                return True
        except Exception as e:
            print(f"Error creating backup: {e}")
            return False
