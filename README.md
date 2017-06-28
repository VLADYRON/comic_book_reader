http://comic-book-reader.com

Comic Book Reader
===================
* Can read CBR, CBZ, CBT, and PDF files
* Runs in the browser as a JavaScript and HTML web page
* Works well on a touch device or desktop
* Saves opened comics in the browser
* Works when offline thanks to Service Workers.
* Regularly tested in Firefox, Chrome, and Internet Explorer

# Run for development
```bash
python3 -m http.server 8000
```

# Install git hooks to automatically generate js/version_date.js file on commit
```bash
./bin/install_hooks.sh
```

# Bugs:
* CSS animations stack on the page number overlay
