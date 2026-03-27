# AUIDO Admission Form

A static school brochure and admission enquiry website for **Savitri Balika Inter College**. The project combines a multi-page brochure-style landing page with an interactive admission popup that submits leads to Google Forms, opens WhatsApp contact, and links users to the school app, map, and website.

## Highlights

- Static HTML, CSS, and JavaScript project with no build step
- Brochure-style presentation with A4 page layout
- Admission enquiry overlay with client-side validation
- Google Form submission using mapped hidden fields
- WhatsApp contact CTA for follow-up
- Background audio with autoplay fallback handling
- Responsive behavior for mobile screens
- Reduced-motion friendly animations

## Project Structure

```text
AUIDO-ADMISSION-FORM-/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   ├── effects.css
    │   ├── form.css
    │   └── responsive.css
    ├── js/
    │   ├── animations.js
    │   ├── formHandler.js
    │   └── integrations.js
    ├── media/
    │   ├── background.mp3
    │   └── welcome.mp3
    └── svg/
        └── blob.svg
```

## Features

### Brochure Experience

`index.html` contains the full brochure-style landing page with school branding, admissions messaging, and CTA buttons. The layout is designed to feel like a printable prospectus while still working in the browser.

### Admission Enquiry Form

The admission popup collects:

- Student name
- Requested class
- Mobile number

The class selector currently supports:

- Nursery
- LKG
- UKG
- Class 1 to Class 12

### Google Form Integration

The form does not require a backend. Submission is posted directly to a Google Form through the configuration in `assets/js/integrations.js`.

Configured fields:

- `entry.864934871` for name
- `entry.1333542661` for class
- `entry.445818611` for mobile number

### Contact and External Links

The project also includes configurable links for:

- WhatsApp contact
- School app
- Google Maps location
- School website

## Local Setup

Clone the repository:

```bash
git clone https://github.com/yakash4184/AUIDO-ADMISSION-FORM-.git
cd AUIDO-ADMISSION-FORM-
```

You can run it in either of these simple ways:

1. Open `index.html` directly in a browser.
2. Serve it locally with a lightweight HTTP server:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## Configuration

Most project-specific settings live in:

`assets/js/integrations.js`

Update this file to change:

- Google Form action URL
- Google Form entry IDs
- WhatsApp destination number and message template
- App, map, and website links
- Audio behavior such as volume, autoplay, looping, and gain boost

## How the Form Works

1. A user clicks an admissions CTA.
2. The enquiry overlay opens.
3. The form validates required fields in the browser.
4. JavaScript maps the values to Google Form entry IDs.
5. The form is submitted to a hidden iframe.
6. A success message is shown and the overlay closes.

This logic is handled mainly in `assets/js/formHandler.js`.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Google Forms
- WhatsApp deep links

## Notes

- No package manager or bundler is required.
- Google Fonts are loaded from the web at runtime.
- Audio autoplay behavior may vary by browser due to browser media policies.
- Print mode hides the interactive admission overlay.

## Repository

GitHub: [yakash4184/AUIDO-ADMISSION-FORM-](https://github.com/yakash4184/AUIDO-ADMISSION-FORM-)
