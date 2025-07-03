
from datetime import datetime

class Contact:
    def __init__(self, name, phone, email="", address=""):
        self.name = self._format_name(name)
        self.phone = self._format_phone(phone)
        self.email = email.strip().lower() if email else ""
        self.address = address.strip() if address else ""
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.updated_at = self.created_at

    def _format_name(self, name):
        return ' '.join(word.capitalize() for word in name.strip().split())

    def _format_phone(self, phone):
        digits = ''.join(filter(str.isdigit, phone))
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        return phone

    def update_contact(self, **kwargs):
        if 'name' in kwargs:
            self.name = self._format_name(kwargs['name'])
        if 'phone' in kwargs:
            self.phone = self._format_phone(kwargs['phone'])
        if 'email' in kwargs:
            self.email = kwargs['email'].strip().lower()
        if 'address' in kwargs:
            self.address = kwargs['address'].strip()
        self.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def to_dict(self):
        return {
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def from_dict(cls, data):
        contact = cls(data['name'], data['phone'], data.get('email', ""), data.get('address', ""))
        contact.created_at = data.get('created_at', contact.created_at)
        contact.updated_at = data.get('updated_at', contact.updated_at)
        return contact

    def __str__(self):
        return f"{self.name} - {self.phone}"

