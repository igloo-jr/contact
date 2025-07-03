import re

def validate_name(name):
    if not name.strip(): return False, "Name cannot be empty"
    if not re.match(r'^[a-zA-Z\s]+$', name): return False, "Name must only contain letters and spaces"
    return True, ""

def validate_phone(phone):
    digits = ''.join(filter(str.isdigit, phone))
    if len(digits) != 10: return False, "Phone number must be 10 digits"
    return True, ""

def validate_email(email):
    if not email: return True, ""
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email): return False, "Invalid email"
    return True, ""

def validate_contact_data(name, phone, email="", address=""):
    errors = []
    valid, msg = validate_name(name)
    if not valid: errors.append(msg)
    valid, msg = validate_phone(phone)
    if not valid: errors.append(msg)
    valid, msg = validate_email(email)
    if not valid: errors.append(msg)
    return len(errors) == 0, errors
