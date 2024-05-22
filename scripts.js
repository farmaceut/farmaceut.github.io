// Dictionary to store publications data
let publicationsData = [];

// Function to load BibTeX data from external file
function loadBibTeXData() {
    fetch('publications.bib') // Assuming the BibTeX file is named publications.bib
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load BibTeX data');
            }
            return response.text();
        })
        .then(data => {
            publicationsData = parseBibTeX(data);
            addYearButtons(); // Call function to add years to the list
        })
        .catch(error => {
            console.error('Error loading BibTeX data:', error);
        });
}

// Function to parse BibTeX data and extract fields for all entries
function parseBibTeX(bibtex) {
    const entries = bibtex.split('@').filter(entry => entry.trim() !== '');
    const data = [];

    entries.forEach(entry => {
        const parsedEntry = parseBibTeXEntry('@' + entry.trim());
        data.push(parsedEntry);
    });

    return data;
}

// Function to extract authors' names from the author string using 'and' as separator
function extractAuthors(authorString) {
    // Split author string by 'and' and trim whitespace
    const authorNames = authorString.split(/\s+and\s+/).map(name => name.trim());
    // Initialize array to store individual authors' names
    const authors = authorNames.map(authorName => {
        const [surname, ...rest] = authorName.split(/\s*,\s*/);
        return `${rest.join(" ")} ${surname}`;
    });
    return authors;
}

// Function to parse BibTeX data and extract specific fields for a single entry
function parseBibTeXEntry(entryData) {
    // Initialize variables to store extracted fields
    let year = "";
    let title = "";
    let authors = [];
    let journal = "";
    let doi = "";

    // Split the entry data by lines
    const lines = entryData.split('\n');

    // Loop through each line to find and extract the fields
    lines.forEach(line => {
        if (line.includes("year = {")) {
            year = line.match(/(\d{4})/)[0];
        } else if (line.trim().startsWith("title = {")) {
            title = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).replace(/{|}/g, "").trim(); // Extract entire title and remove all { and } characters from the title
        } else if (line.includes("author = {")) {
            // Extract authors using comma and "and" as separators
            const authorString = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).trim();
            authors = extractAuthors(authorString);
        } else if (line.includes("journal = {")) {
            journal = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).trim();
        } else if (line.includes("doi = {")) {
            doi = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).trim();
        }
    });

    // Construct and return an object with the extracted fields
    return { year, title, authors, journal, doi };
}

function createYearButton(year) {
    const yearButton = document.createElement('button');
    yearButton.classList.add('btn', 'btn-primary', 'm-1');
    yearButton.textContent = year;
    yearButton.addEventListener('click', () => showToasts(year));
    return yearButton;
}


// Function to add years to the list
function addYearButtons() {
    const yearsButtons = document.getElementById('years-button');

    // Extract unique years from publicationsData
    const uniqueYears = [...new Set(publicationsData.map((publication) => publication.year))];

    // Sort the unique years array in descending order
    uniqueYears.sort((a, b) => b - a);

    uniqueYears.forEach((year) => {
        const yearButton = createYearButton(year);
        yearsButtons.appendChild(yearButton);
    });
}


// Function to show toast
function showToasts(year) {
    // Get the toast container
    const toastContainer = document.getElementById('toast-container');

    // Clear existing toasts
    toastContainer.innerHTML = '';

    // Get toasts for the selected year and append them to the container
    const toasts = publicationsData.filter(publication => publication.year === year);
    toasts.forEach(publication => {
        const toast = createToast(publication.title, publication.authors.join(', '), publication.doi);
        toastContainer.appendChild(toast);

        // Disable autohide
        const toastInstance = new bootstrap.Toast(toast, { autohide: false });
        toastInstance.show();
    });
}

// Function to create a single toast element
function createToast(title, authors, doi) {
    const toastDiv = document.createElement('div');
    toastDiv.innerHTML = `
        <div class="toast m-1" >
            <div class="toast-header">
                <div>
                <a target="_blank" href="https://www.doi.org/${doi}"><i class="bi bi-box-arrow-up-right"></i></a>
                <strong class="mr-auto">${title}</strong>
                </div>
            </div>
            <div class="toast-body">
                <small>${authors}</small>
            </div>
        </div>
    `;
    return toastDiv.firstElementChild;
}

// Call the function to load BibTeX data
loadBibTeXData();

// Call the function to add years to the list
addYearButtons();

//////////////////////////
// UNDER CONSTRUCTION   //
// * Scroll-up button   //
//////////////////////////
