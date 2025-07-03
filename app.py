from flask import Flask, render_template, request, redirect, url_for
from contact_manager import ContactManager
from storage import StorageHandler
import os

app = Flask(__name__)
manager = ContactManager(StorageHandler("data/contacts.json"))

@app.route('/')
def index():
    contacts = manager.view_all_contacts()
    return render_template('index.html', contacts=contacts)

@app.route('/add', methods=['POST'])
def add_contact():
    name = request.form['name']
    phone = request.form['phone']
    email = request.form.get('email', '')
    address = request.form.get('address', '')
    success, _ = manager.add_contact(name, phone, email, address)
    return redirect(url_for('index'))

@app.route('/delete/<phone>')
def delete_contact(phone):
    manager.delete_contact(phone)
    return redirect(url_for('index'))

@app.route('/edit/<phone>')
def edit_contact(phone):
    contact = manager.find_contact_by_phone(phone)
    return render_template('update.html', contact=contact)

@app.route('/update/<phone>', methods=['POST'])
def update_contact(phone):
    updates = {
        'name': request.form['name'],
        'phone': request.form['phone'],
        'email': request.form['email'],
        'address': request.form['address']
    }
    manager.update_contact(phone, **updates)
    return redirect(url_for('index'))

if __name__ == "__main__":
    # Required for deployment platforms like Render
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
