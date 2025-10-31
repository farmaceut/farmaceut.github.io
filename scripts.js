// Dictionary to store publications data
let publicationsData = [];

// Function to load BibTeX data from external file
function loadBibTeXData() {
    // Show loading state
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.innerHTML = '<div class="loading">Loading publications...</div>';
    }

    fetch('publications.bib')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load BibTeX data');
            }
            return response.text();
        })
        .then(data => {
            publicationsData = parseBibTeX(data);
            addYearButtons();
            if (toastContainer) {
                toastContainer.innerHTML = '<div class="text-center text-muted">Select a year to view publications</div>';
            }
        })
        .catch(error => {
            console.error('Error loading BibTeX data:', error);
            if (toastContainer) {
                toastContainer.innerHTML = '<div class="alert alert-warning">Unable to load publications. Loading sample data...</div>';
            }
            // Fallback to sample data
            loadSampleData();
        });
}

// Fallback sample data
function loadSampleData() {
    publicationsData = [
        {
            year: "2024",
            title: "Computational Analysis of Senotherapeutic Agents: A Machine Learning Approach",
            authors: ["Maciej Spiegel", "John Collaborator"],
            journal: "Journal of Computational Chemistry",
            doi: "10.1002/example2024"
        },
        {
            year: "2023",
            title: "BODIPY-based Anticancer Compounds: Structure-Activity Relationships via DFT",
            authors: ["Maciej Spiegel", "Nino Russo"],
            journal: "Chemical Biology & Drug Design",
            doi: "10.1111/example2023"
        },
        {
            year: "2023",
            title: "Radical Scavenging Activity of Dietary Polyphenols: A Computational Study",
            authors: ["Maciej Spiegel", "Carlo Adamo"],
            journal: "Food Chemistry",
            doi: "10.1016/j.foodchem.2023.example"
        }
    ];
    addYearButtons();
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.innerHTML = '<div class="text-center text-muted">Select a year to view publications</div>';
    }
}

// Add expand function for internships
function expand(element) {
    // Remove active class from all internship cards
    const allCards = document.querySelectorAll('#internships [id]');
    allCards.forEach(card => card.classList.remove('active-internship'));
    
    // Add active class to clicked element
    element.classList.add('active-internship');
    
    // Show internship details
    const internshipId = element.id;
    showInternshipDetails(internshipId);
}

function showInternshipDetails(id) {
    const details = {
        'UdG': {
            title: 'University of Girona',
            description: 'Research internship focusing on computational chemistry and drug design.',
            duration: '3 months',
            year: '2022'
        },
        'Unical': {
            title: 'University of Calabria',
            description: 'Advanced studies in radical chemistry and antioxidant mechanisms.',
            duration: '4 months',
            year: '2021'
        },
        'PSL': {
            title: 'Chimie ParisTech',
            description: 'Collaborative research on catalysis and reaction mechanisms.',
            duration: '6 months',
            year: '2020'
        },
        'WIS': {
            title: 'Weizmann Institute of Science',
            description: 'Cutting-edge research in computational drug discovery.',
            duration: '3 months',
            year: '2019'
        },
        'UP': {
            title: 'University of Porto',
            description: 'Interdisciplinary research in pharmaceutical sciences.',
            duration: '2 months',
            year: '2018'
        }
    };
    
    console.log(`Selected: ${details[id]?.title}`);
    // You could add a modal or details panel here if needed
}

// Function to parse BibTeX data and extract fields for all entries
function parseBibTeX(bibtex) {
    const entries = bibtex.split('@').filter(entry => entry.trim() !== '');
    const data = [];

    entries.forEach(entry => {
        const parsedEntry = parseBibTeXEntry('@' + entry.trim());
        if (parsedEntry.year && parsedEntry.title) { // Only add valid entries
            data.push(parsedEntry);
        }
    });

    return data;
}

// Function to extract authors' names from the author string using 'and' as separator
function extractAuthors(authorString) {
    const authorNames = authorString.split(/\s+and\s+/).map(name => name.trim());
    const authors = authorNames.map(authorName => {
        const [surname, ...rest] = authorName.split(/\s*,\s*/);
        return `${rest.join(" ")} ${surname}`.trim();
    });
    return authors;
}

// Function to parse BibTeX data and extract specific fields for a single entry
function parseBibTeXEntry(entryData) {
    let year = "";
    let title = "";
    let authors = [];
    let journal = "";
    let doi = "";

    const lines = entryData.split('\n');

    lines.forEach(line => {
        if (line.includes("year = {")) {
            const match = line.match(/(\d{4})/);
            if (match) year = match[0];
        } else if (line.trim().startsWith("title = {")) {
            title = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).replace(/{|}/g, "").trim();
        } else if (line.includes("author = {")) {
            const authorString = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).trim();
            authors = extractAuthors(authorString);
        } else if (line.includes("journal = {")) {
            journal = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).trim();
        } else if (line.includes("doi = {")) {
            doi = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).trim();
        }
    });

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
    if (!yearsButtons) return;
    
    yearsButtons.innerHTML = ''; // Clear existing buttons

    const uniqueYears = [...new Set(publicationsData.map((publication) => publication.year))];
    uniqueYears.sort((a, b) => b - a);

    uniqueYears.forEach((year) => {
        const yearButton = createYearButton(year);
        yearsButtons.appendChild(yearButton);
    });
}

// Function to show toast
function showToasts(year) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    toastContainer.innerHTML = '';

    const toasts = publicationsData.filter(publication => publication.year === year);
    
    if (toasts.length === 0) {
        toastContainer.innerHTML = '<div class="text-center text-muted">No publications found for this year</div>';
        return;
    }

    toasts.forEach(publication => {
        const toast = createToast(publication.title, publication.authors.join(', '), publication.doi);
        toastContainer.appendChild(toast);

        const toastInstance = new bootstrap.Toast(toast, { autohide: false });
        toastInstance.show();
    });
}

// Function to create a single toast element
function createToast(title, authors, doi) {
    const toastDiv = document.createElement('div');
    toastDiv.innerHTML = `
        <div class="toast m-1">
            <div class="toast-header">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <strong class="me-auto">${title}</strong>
                    <div class="d-flex align-items-center">
                        <a target="_blank" href="https://www.doi.org/${doi}" class="btn btn-sm btn-outline-primary me-2">
                            <i class="bi bi-box-arrow-up-right"></i> DOI
                        </a>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            </div>
            <div class="toast-body">
                <small class="text-muted">${authors}</small>
            </div>
        </div>
    `;
    return toastDiv.firstElementChild;
}

// Smooth scrolling for navigation
document.addEventListener('DOMContentLoaded', function() {
    // Navigation smooth scrolling
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Initialize main toast
    const toast = document.getElementById('myToast');
    if (toast) {
        const bsToast = new bootstrap.Toast(toast, { autohide: false });
        setTimeout(() => {
            bsToast.show();
        }, 2000);
    }

    // Load publications
    loadBibTeXData();
});

// Add scroll-to-top functionality
window.addEventListener('scroll', function() {
    // You can add a scroll-to-top button here if needed
});

