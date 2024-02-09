// Dictionary to store publications data
let publicationsData = [];

// Function to parse BibTeX data and extract specific fields for a single entry
function parseBibTeXEntry(entryData) {
    // Initialize variables to store extracted fields
    let year = "";
    let title = "";
    let authors = [];
    let journal = "";
    let keywords = [];
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
        } else if (line.includes("keywords = {")) {
            keywords = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).split(",").map(keyword => keyword.trim().toLowerCase()); // Convert to lowercase
        } else if (line.includes("doi = {")) {
            doi = line.substring(line.indexOf("{") + 1, line.lastIndexOf("}")).trim();
        }
    });

    // Construct and return an object with the extracted fields
    return { year, title, authors, journal, keywords, doi };
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


// Function to add years to the list
function addYearsToList() {
    const yearsList = document.getElementById("years-list");

    // Extract unique years from publicationsData
    const uniqueYears = [...new Set(publicationsData.map((publication) => publication.year))];

    // Sort the unique years array in descending order
    uniqueYears.sort((a, b) => b - a);

    uniqueYears.forEach((year) => {
        const listItem = createYearListItem(year);
        yearsList.appendChild(listItem);
    });
}

// Call the function to add years to the list
addYearsToList();


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
            addYearsToList(); // Call function to add years to the list
        })
        .catch(error => {
            console.error('Error loading BibTeX data:', error);
        });
}

// Call the function to load BibTeX data
loadBibTeXData();

// Function to create a timeline item
function createTimelineItem(year, title, authors, journal, tags, doi) {
    const timelineItem = document.createElement("div");
    timelineItem.classList.add("timeline-item");

    // Map each tag to a Bootstrap badge
    const tagsHTML = tags.map(tag => `<span class="badge bg-primary-subtle border border-primary-subtle text-primary-emphasis rounded-pill">${tag}</span>`).join(' ');

    // Create a string of authors separated by commas
    const authorsString = authors.join(', ').replace(/, and/, ' and'); // Replace comma before 'and'

    const content = `
    <div class="timeline-content">
        <div class="altmetric-embed" data-badge-type="bar" data-link-target="_blank" data-doi="${doi}" style="display: inline-block"></div>
        <h3>${title}</h3>
        <small>${authorsString}<br>
        <i>${journal}, ${year}</small></i>
        <p>${tagsHTML}</p>
    </div>
    `;

    timelineItem.innerHTML = content;

    return timelineItem;
}


// Function to filter publications by year
let isExpanded = 0; // Declare isExpanded in the global scope

function filterPublications(selectedYear) {
    const timeline = document.querySelector(".timeline");

    // Clear existing timeline items
    timeline.innerHTML = '';

    // Filter publications based on the selected year
    const filteredPublications = publicationsData.filter(publication => publication.year == selectedYear);

    if (filteredPublications.length === 0) {
        const noPublicationItem = document.createElement("div");
        noPublicationItem.textContent = "No publications for the selected year.";
        timeline.appendChild(noPublicationItem);
        return;
    }

    filteredPublications.forEach((publication) => {
        const { year, title, authors, journal, keywords, doi } = publication;
        const timelineItem = createTimelineItem(year, title, authors, journal, keywords, doi);
        timeline.appendChild(timelineItem);
    });

    // Hide other buttons if the timeline is not collapsed
    const yearsList = document.getElementById("years-list");
    let buttons = yearsList.querySelectorAll("button");
    let parentRect = yearsList.getBoundingClientRect(); // Get the bounding rectangle of the parent element
    let parentCenter = (parentRect.left + parentRect.right) / 2; // Calculate the center of the parent element

    // Proceed with hiding/showing buttons based on collapse state
    console.log("isExpanded:", isExpanded);
    if (isExpanded === 0) {
        console.log("Collapsing timeline...");
        buttons.forEach(button => {
            if (button.textContent == selectedYear.toString()) {
                // Centering the button horizontally
                let buttonRect = button.getBoundingClientRect(); // Get the bounding rectangle of the button
                let buttonCenter = (buttonRect.left + buttonRect.right) / 2; // Calculate the center of the button
                let translateXValue = parentCenter - buttonCenter; // Calculate the translation value
                button.style.transition = "transform 0.5s ease";
                button.style.transform = `translateX(${translateXValue}px)`; // Correctly center the button
            } else {
                // Hiding buttons for years other than the selected one
                button.style.transition = "opacity 0.5s ease, transform 0.5s ease";
                button.style.opacity = "0";
                button.style.transform = "translateY(-50%)";
                setTimeout(() => {
                    button.style.visibility = "hidden"; // Use "none" to hide the button
                }, 500);
            }
        });
        isExpanded = 1; // Update flag variable
    } else { // If timeline is expanded
        console.log("Expanding timeline...");
        buttons.forEach(button => {
            console.log("Showing button:", button.textContent);
            button.style.transition = "opacity 0.5s ease, transform 0.5s ease"; // Adding transition effect
            button.style.visibility = "visible"; // Set display to inline before opacity transition
            setTimeout(() => {
                button.style.opacity = "1"; // Set opacity to 1 after display change
                button.style.transform = "translateY(0)"; // Move the button back to its original position
            }, 50); // Delay opacity change after display transition
        });
        isExpanded = 0; // Update flag variable
    }

    _altmetric_embed_init(); // Assuming this function is correctly defined elsewhere
}

function createYearListItem(year) {
    const listItem = document.createElement("li");
    listItem.classList.add("me-3");
    listItem.innerHTML = `<button class="btn btn-link" data-bs-toggle="collapse" data-bs-target="#timelineitems" onclick="filterPublications(${year})">${year}</button>`;
    return listItem;
}


// Scroll Top Button
document.addEventListener("DOMContentLoaded", function () {

    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    // Show or hide the button based on scroll position
    window.onscroll = function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.opacity = "1";
        } else {
            scrollToTopBtn.style.opacity = "0";
        }
    };

    // Scroll to the top when the button is clicked
    scrollToTopBtn.addEventListener("click", function () {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
    });
});

// Function to generate a random delay between min and max seconds before showing toast
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000; // Convert seconds to milliseconds
}

// Function to show the toast after a random delay between 5 and 10 seconds
function showRandomToast() {
    var toastElement = document.getElementById('myToast');
    var toast = new bootstrap.Toast(toastElement);
    var delay = getRandomDelay(5, 10); // Random delay between 5 and 10 seconds
    setTimeout(function () {
        toast.show();
    }, delay);
}

// Call the function to show the toast
showRandomToast();




// JavaScript code to handle screensaver behavior
let screensaver = document.getElementById('screensaver');
let video = document.getElementById('screensaver-video');
let activityTimeout;

function startScreensaver() {
    screensaver.classList.add('active'); // Apply CSS class for smooth transition
    video.play();
}

function stopScreensaver() {
    screensaver.classList.remove('active'); // Remove CSS class to fade out
    video.pause();
    video.currentTime = 0; // Reset video to beginning
}

function resetTimer() {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(startScreensaver, 10000); // 10 seconds of inactivity
}

document.addEventListener('mousemove', function() {
    resetTimer();
    stopScreensaver();
});

document.addEventListener('keypress', function() {
    resetTimer();
    stopScreensaver();
});

resetTimer(); // Start timer initially

