function validateAddresses() {
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone-local').value.trim();

    const shipping = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        street: document.getElementById('street').value.trim(),
        houseNumber: document.getElementById('house-number').value.trim(),
        zip: document.getElementById('zip').value.trim(),
        city: document.getElementById('city').value.trim(),
        country: document.getElementById('country').value.trim()
    };

    const billingSame = document.getElementById('billing-same').checked;

    const errors = [];

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9\s\-]{6,15}$/;

    if (!emailRegex.test(email)) {
        errors.push('Bitte gib eine gültige E-Mail-Adresse ein.');
    }

    if (!phoneRegex.test(phone)) {
        errors.push('Bitte gib eine gültige Telefonnummer ein.');
    }
    if (shipping.firstName.length < 2) {
        errors.push('Der Vorname muss mindestens 2 Zeichen lang sein.');
    }
    if (shipping.lastName.length < 2) {
        errors.push('Der Nachname muss mindestens 2 Zeichen lang sein.');
    }
    if (shipping.street.length < 2) {
        errors.push('Die Straße muss mindestens 2 Zeichen lang sein.');
    }
    if (!/^[0-9]{1,4}[a-zA-Z]?$/.test(shipping.houseNumber)) {
        errors.push('Die Hausnummer ist ungültig.');
    }
    if (shipping.city.length < 2) {
        errors.push('Die Stadt muss mindestens 2 Zeichen lang sein.');
    }
    if (!/^[0-9]{5}$/.test(shipping.zip)) {
        errors.push('Die Postleitzahl muss genau 5 Ziffern haben.');
    }
    if (shipping.country.length < 3) {
        errors.push('Das Land muss mindestens 3 Zeichen lang sein.');
    }

    if (!billingSame) {
        const billing = {
            firstName: document.getElementById('billing-first-name').value.trim(),
            lastName: document.getElementById('billing-last-name').value.trim(),
            street: document.getElementById('billing-street').value.trim(),
            houseNumber: document.getElementById('billing-house-number').value.trim(),
            zip: document.getElementById('billing-zip').value.trim(),
            city: document.getElementById('billing-city').value.trim(),
            country: document.getElementById('billing-country').value.trim()
        };
        if (billing.firstName.length < 2) {
            errors.push('Der Vorname muss mindestens 2 Zeichen lang sein.');
        }
        if (billing.lastName.length < 2) {
            errors.push('Der Nachname muss mindestens 2 Zeichen lang sein.');
        }
        if (billing.street.length < 2) {
            errors.push('Die Straße muss mindestens 2 Zeichen lang sein.');
        }
        if (!/^[0-9]{1,4}[a-zA-Z]?$/.test(billing.houseNumber)) {
            errors.push('Die Hausnummer ist ungültig.');
        }
        if (billing.city.length < 2) {
            errors.push('Die Stadt muss mindestens 2 Zeichen lang sein.');
        }
        if (!/^[0-9]{5}$/.test(billing.zip)) {
            errors.push('Die Postleitzahl muss genau 5 Ziffern haben.');
        }
        if (billing.country.length < 3) {
            errors.push('Das Land muss mindestens 3 Zeichen lang sein.');
        }
    }

    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    return true;
}
