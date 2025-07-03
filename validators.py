import re

def validate_name(name):
    if not name or not name.strip():
        return False, "Name cannot be empty"
    if len(name.strip()) < 2:
        return False, "Name must be at least 2 characters long"
    if not re.match(r'^[a-zA-Z\s]+$', name.strip()):
        return False, "Name can only contain letters and spaces"
    return True, ""

def validate_phone(phone):
    if not phone or not phone.strip():
        return False, "Phone number cannot be empty"
    digits = ''.join(filter(str.isdigit, phone))
    if len(digits) != 10:
        return False, "Phone number must be 10 digits"
    return True, ""

def validate_email(email):
    if not email or not email.strip():
        return True, ""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email.strip()):
        return False, "Invalid email format"
    return True, ""

def validate_contact_data(name, phone, email="", address=""):
    errors = []
    name_valid, name_error = validate_name(name)
    if not name_valid:
        errors.append(name_error)
    phone_valid, phone_error = validate_phone(phone)
    if not phone_valid:
        errors.append(phone_error)
    email_valid, email_error = validate_email(email)
    if not email_valid:
        errors.append(email_error)
    return len(errors) == 0, errors
