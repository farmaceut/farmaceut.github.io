// Publications data - easily extendable
const publicationsData = [
    { year: 2020, title: "Flavones’ and Flavonols’ Antiradical Structure–Activity Relationship—A Quantum Chemical Study", authors: "Spiegel M.*, Andruniów T., Sroka Z.", journal: "Antioxidants", doi: "10.3390/antiox9060461", tags: ["Q1", "IF: 6.313", "Ministerial Score: 100", "Article"] },
    { year: 2020, title: "Antioxidant Activity of Selected Phenolic Acids–Ferric Reducing Antioxidant Power Assay and QSAR Analysis of the Structural Features", authors: "Spiegel M., Kapusta K.*, Kołodziejczyk W., Saloni J., Żbikowska B., Hill G.A., Sroka Z.", journal: "Molecules", doi: "10.3390/molecules25133088", tags: ["Q2", "IF: 4.412", "Ministerial Score: 140", "Article"] },
    { year: 2021, title: "Antiradical Activity of Beetroot (<i>Beta vulgaris</i> L.) Betalains", authors: "Spiegel M.*, Gamian A., Sroka Z.", journal: "Molecules", doi: "10.3390/molecules26092439", tags: ["Q2", "IF: 4.927", "Ministerial Score: 140", "Article"] },
    { year: 2021, title: "One Year of the COVID‐19 Pandemic. What Do We Know and What Is Yet to Come? — The Summarising Review", authors: "Malchrzak W., Mastalerz-Migas A., Sroka Z., Spiegel M.*", journal: "International Journal of Public Health", doi: "10.3389/ijph.2021.1603975", tags: ["Q1", "IF: 5.100", "Ministerial Score: 100", "Review"] },
    { year: 2021, title: "A Statistically Supported Antioxidant Activity DFT Benchmark—The Effects of Hartree–Fock Exchange and Basis Set Selection on Accuracy and Resources Uptake", authors: "Spiegel M.*, Gamian A., Sroka Z.", journal: "Molecules", doi: "10.3390/molecules26165058", tags: ["Q2", "IF: 4.927", "Ministerial Score: 140", "Article"] },
    { year: 2021, title: "Recognition of the True and False Resonance Raman Optical Activity", authors: "Machalska E.⁺, Zając G.⁺, Wierzba A.J., Kapitán J.*, Andruniów T., Spiegel M., Gryko D.*, Bouř P.*, Barańska M.*", journal: "Angewandte Chemie International Edition", doi: "10.1002/anie.202107600", tags: ["Q1", "IF: 16.823", "Ministerial Score: 200", "Article"] },
    { year: 2021, title: "In Silico Screening and In Vitro Assessment of Natural Products with Anti-Virulence Activity against Helicobacter pylori", authors: "Spiegel M.⁺*, Krzyżek P.⁺*, Dworniczek E., Adamski R., Sroka Z.", journal: "Molecules", doi: "10.3390/molecules27010020", tags: ["Q2", "IF: 4.927", "Ministerial Score: 140", "Article"] },
    { year: 2022, title: "Antioxidant and copper-chelating power of new molecules suggested as multiple target agents against Alzheimer's disease. A theoretical comparative study", authors: "Spiegel M., Marino T., Prejanò M., Russo N.*", journal: "Physical Chemistry Chemical Physics", doi: "10.1039/D2CP01918C", tags: ["Q2", "IF: 3.3", "Ministerial Score: 100", "Article"] },
    { year: 2022, title: "On the Scavenging Ability of Scutellarein against the OOH Radical in Water and Lipid-like Environments: A Theoretical Study", authors: "Spiegel M., Marino T., Prejanò M., Russo N.*", journal: "Antioxidants", doi: "10.3390/antiox11020224", tags: ["Q1", "IF: 7.0", "Ministerial Score: 100", "Article"] },
    { year: 2022, title: "Current Trends in Computational Quantum Chemistry Studies on Antioxidant Radical Scavenging Activity", authors: "Spiegel M.*", journal: "Journal of Chemical Information and Modeling", doi: "10.1021/acs.jcim.2c00104", tags: ["Q1", "IF: 5.6", "Ministerial Score: 100", "Review"] },
    { year: 2022, title: "Analytical and Theoretical Studies of Antioxidant Properties of Chosen Anthocyanins; A Structure-Dependent Relationships", authors: "Dudek A., Spiegel M.*, Strugała-Danak P.*, Gabrielska P.", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms23105432", tags: ["Q1", "IF: 5.6", "Ministerial Score: 140", "Article"] },
    { year: 2022, title: "Natural dihydroisobenzofuran derivatives as a template for promising radical scavengers: theoretical insights into structure–activity relationships, thermochemistry and kinetics", authors: "Spiegel M.*, Sroka Z.", journal: "Theoretical Chemistry Accounts", doi: "10.1007/s00214-022-02922-5", tags: ["Q4", "IF: 1.7", "Ministerial Score: 70", "Article"] },
    { year: 2022, title: "Primary and secondary antioxidant properties of scutellarin and scutellarein in water and lipid-like environments: A theoretical investigation", authors: "Spiegel M.*, Marino T., Prejanò M., Russo N.*", journal: "Journal of Molecular Liquids", doi: "10.1016/j.molliq.2022.120343", tags: ["Q1", "IF: 6.0", "Ministerial Score: 100", "Article"] },
    { year: 2022, title: "Interference of malvidin and its mono- and di-glucosides on the membrane — Combined in vitro and computational chemistry study", authors: "Strugała-Danak P.*, Spiegel M., Hurynowicz K., Gabrielska J.", journal: "Journal of Functional Foods", doi: "10.1016/j.jff.2022.105340", tags: ["Q1", "IF: 5.6", "Ministerial Score: 100", "Article"] },
    { year: 2022, title: "The Appliance of A-PRF and CGF in the Treatment of Impacted Mandibular Third Molar Extraction Sockets—Narrative Review", authors: "Selahi D.⁺, Spiegel M.⁺*, Hadzik J.*, Pitułaj A., Michalak F., Kubasiewicz-Ross P., Dominiak M.", journal: "Applied Sciences", doi: "10.3390/app13010165", tags: ["Q2", "IF: 2.7", "Ministerial Score: 100", "Review"] },
    { year: 2023, title: "Computational assessment of the primary and secondary antioxidant potential of alkylresorcinols in physiological media", authors: "Boulebd H.*, Spiegel M.", journal: "RSC Advances", doi: "10.1039/D3RA05967G", tags: ["Q2", "IF: 3.9", "Ministerial Score: 100", "Article"] },
    { year: 2023, title: "Quantum-mechanical characteristics of apigenin: Antiradical, metal chelation and inhibitory properties in physiologically relevant media", authors: "Spiegel M.*, Sroka Z.", journal: "Fitoterapia", doi: "10.1016/j.fitote.2022.105352", tags: ["Q3", "IF: 2.5", "Ministerial Score: 100", "Article"] },
    { year: 2023, title: "Computational investigation on the antioxidant activities and on the Mpro SARS-CoV-2 non-covalent inhibition of isorhamnetin", authors: "Spiegel M., Ciardullo G., Marino T., Russo N.", journal: "Frontiers in Chemistry", doi: "10.3389/fchem.2023.1122880", tags: ["Q2", "IF: 3.8", "Ministerial Score: 100", "Article"] },
    { year: 2023, title: "Tuning the Photophysical Properties of Ru(II) Photosensitizers for PDT by Protonation and Metallation: A DFT Study", authors: "Spiegel M.*, Adamo C.", journal: "The Journal of Physical Chemistry A", doi: "10.1021/acs.jpca.3c00839", tags: ["Q2", "IF: 2.7", "Ministerial Score: 100", "Article"] },
    { year: 2023, title: "The mechanistic insights into the role of pH and solvent on antiradical and prooxidant properties of polyphenols — Nine compounds case study", authors: "Spiegel M.*, Cel K., Sroka Z.", journal: "Food Chemistry", doi: "10.1016/j.foodchem.2022.134677", tags: ["Q1", "IF: 8.5", "Ministerial Score: 200", "Article"] },
    { year: 2023, title: "Post-CCSD(T) corrections to bond distances and vibrational frequencies: the power of Λ", authors: "Spiegel M.⁺, Semidalas E.⁺, Martin J.M.L.*, Bentley M.R., Stanton J.F.", journal: "Molecular Physics", doi: "10.1080/00268976.2023.2252114", tags: ["Q3", "IF: 1.6", "Ministerial Score: 70", "Article"] },
    { year: 2023, title: "Theoretical Insights into the Oxidative Stress-Relieving Properties of Pinocembrin─An Isolated Flavonoid from Honey and Propolis", authors: "Spiegel M.*", journal: "The Journal of Physical Chemistry B", doi: "10.1021/acs.jpcb.3c03545", tags: ["Q3", "IF: 2.8", "Ministerial Score: 140", "Article"] },
    { year: 2023, title: "Malvidin and Its Mono- and Di-Glucosides Forms: A Study of Combining Both In Vitro and Molecular Docking Studies Focused on Cholinesterase, Butyrylcholinesterase, COX-1 and COX-2 Activities", authors: "Strugała-Danak P.*, Spiegel M.*, Gabrielska J.", journal: "Molecules", doi: "10.3390/molecules28237872", tags: ["Q2", "IF: 4.2", "Ministerial Score: 140", "Article"] },
    { year: 2024, title: "Primary Antioxidant Power and Mpro SARS‐CoV‐2 Non‐Covalent Inhibition Capabilities of Miquelianin", authors: "Spiegel M., Prejanò M., Russo N.*, Marino T.", journal: "Chemistry – An Asian Journal", doi: "10.1002/asia.202400079", tags: ["Q2", "IF: 3.5", "Ministerial Score: 100", "Article"] },
    { year: 2024, title: "Unveiling the Antioxidative Potential of Galangin: Complete and Detailed Mechanistic Insights through Density Functional Theory Studies", authors: "Spiegel M.*", journal: "The Journal of Organic Chemistry", doi: "10.1021/acs.joc.4c00611", tags: ["Q1", "IF: 3.6", "Ministerial Score: 140", "Article"] },
    { year: 2024, title: "A green approach to synthesize polybutene lubricants from mixed C4 monomers using supported dendritic ionic liquids", authors: "Ghavampoor A., Bahri-Laleh N.*, Sadjadi S.*, Nekoomanesh M., Vahid A., Duran J., Spiegel M., Poater A.*", journal: "Journal of Molecular Liquids", doi: "10.1016/j.molliq.2024.125814", tags: ["Q1", "IF: 5.2", "Ministerial Score: 100", "Article"] },
    { year: 2025, title: "Fisetin as a Blueprint for Senotherapeutic Agents – Elucidating Geroprotective and Senolytic Properties with Molecular Modeling", authors: "Spiegel M.*", journal: "Chemistry – A European Journal", doi: "10.1002/chem.202403755", tags: ["Q2", "IF: 3.7", "Ministerial Score: 100", "Article"] },
    { year: 2025, title: "A Comprehensive Experimental and Theoretical Investigation of the Antioxidant Properties of Hispidin and Isohispidin", authors: "Boulebd H., Amine Khodja I., Benarous K., Mączyński M., Spiegel M.*", journal: "The Journal of Organic Chemistry", doi: "10.1021/acs.joc.4c02837", tags: ["Q1", "IF: 3.6", "Ministerial Score: 140", "Article"] },
    { year: 2025, title: "Understanding the Photophysical Properties of Pd and Pt Transition‐Metal Isocorroles: A Theoretical Investigation", authors: "Spiegel M., Russo N.*", journal: "Chemistry – A European Journal", doi: "10.1002/chem.202403725", tags: ["Q2", "IF: 3.7", "Ministerial Score: 100", "Article"] },
    { year: 2025, title: "Late-stage functionalization of pharmaceuticals by C–C cross-coupling enabled by wingtip-flexible N-heterocyclic carbenes", authors: "Yang S., Zhou T., Yu X., Poater A.*, Duran J., Spiegel M.*, Cavallo L., Nolan S.P.*, Szostak M.*", journal: "Chem Catalysis", doi: "10.1016/j.checat.2025.101297", tags: ["Q1", "IF: 11.6", "Ministerial Score: 20", "Article"] },
    { year: 2025, title: "Photophysical Properties of a Chiral Iridium-Based Photosensitizer as an Efficient Photodynamic Therapy Agent: A Theoretical Investigation", authors: "Spiegel M.*", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms26115062", tags: ["Q1", "IF: 4.9", "Ministerial Score: 140", "Article"] },
    { year: 2025, title: "On the Photosensitizing Properties of Aloe-Emodin in Photodynamic Therapy: Insights from the Molecular Modeling", authors: "Spiegel M.*", journal: "The Journal of Physical Chemistry B", doi: "10.1021/acs.jpcb.5c01117", tags: ["Q3", "IF: 2.9", "Ministerial Score: 140", "Article"] },
    { year: 2025, title: "Aglycone, Glycoside, or Glucuronide? Experimental and Mechanistic Insights into the Antioxidative Potential of Gossypetin, Gossypin, and Hibifolin", authors: "Spiegel M.*, Kowalczyk A.", journal: "The Journal of Physical Chemistry B", doi: "10.1021/acs.jpcb.5c03338", tags: ["Q3", "IF: 2.9", "Ministerial Score: 140", "Article"] },
    { year: 2025, title: "Soranjidiol as a photosensitizer: Mechanistic insights into its photochemistry and photoinduced tautomerization", authors: "Spiegel M.*", journal: "Journal of Photochemistry and Photobiology B: Biology", doi: "10.1016/j.jphotobiol.2025.113203", tags: ["Q1", "IF: 3.7", "Ministerial Score: 100", "Article"] },
    { year: 2025, title: "Are Algae a Good Source of Antioxidants? Mechanistic Insights into Antiradical Activity of Eckol", authors: "Spiegel M.*", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms26189223", tags: ["Q1", "IF: 4.9", "Ministerial Score: 140", "Article"] },
    { year: 2025, title: "Impact of α-tocopherol derivatives on the structural and functional properties of model lipid nanocarriers: A biophysical modeling study", authors: "Dudek A., Spiegel M., Benkowska-Biernacka D., Domańska M., Pruchnik H.*", journal: "Chemistry and Physics of Lipids", doi: "10.1016/j.chemphyslip.2025.105539", tags: ["Q2", "IF: 2.8", "Ministerial Score: 100", "Article"] },
    { year: 2025, title: "Antioxidant Power of Vitexin and Isovitexin Against OOH Radicals: A Comparative Theoretical Investigation", authors: "Spiegel M., Russo N.*", journal: "The Journal of Organic Chemistry", doi: "10.1021/acs.joc.5c01680", tags: ["Q1", "IF: 3.6", "Ministerial Score: 140", "Article"] },
    { year: 2025, title: "Evaluation of 2,7-Naphthyridines as Targeted Anti-Staphylococcal Candidates with Microbiota-Sparing Properties", authors: "Wójcicka A.*, Spiegel M., Dudek B., Brożyna M., Junka A., Mączyński M.", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms262110442", tags: ["Q1", "IF: 4.9", "Ministerial Score: 140", "Article"] },
];

// Get current year
const currentYear = new Date().getFullYear().toString();

// Generate year badges automatically
function generateYearBadges() {
    const years = [...new Set(publicationsData.map(p => p.year))].sort((a, b) => a - b);
    const yearsFilter = document.getElementById('years-filter');
    
    yearsFilter.innerHTML = years.map(year => 
        `<span class="year-badge ${year.toString() === currentYear ? 'active' : ''}" data-year="${year}">${year}</span>`
    ).join('');
    
    // Attach click handlers after creating badges
    document.querySelectorAll('.year-badge').forEach(badge => {
        badge.addEventListener('click', function() {
            document.querySelectorAll('.year-badge').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderPublications(this.dataset.year);
        });
    });
}

// Render publications
function renderPublications(year) {
    const container = document.getElementById('publications-list');
    const filtered = publicationsData.filter(p => p.year.toString() === year);
    
    // Fade out current publications
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        container.innerHTML = filtered.map(pub => `
            <div class="col-md-6 d-flex">
                <div class="publication-item flex-fill animate" data-year="${pub.year}">
                    <div class="publication-title">${pub.title}</div>
                    <div class="publication-meta mb-2">
                        <strong>${pub.authors}</strong> | ${pub.journal} (${pub.year}) | 
                        <a href="https://doi.org/${pub.doi}" target="_blank"><i class="bi bi-box-arrow-up-right"></i></a>
                    </div>
                    <div>
                        ${pub.tags.map(tag => {
                            let badgeClass = 'bg-dark';
                            if (tag === 'Q1' || tag === 'Q2' || tag === 'Q3' || tag === 'Q4') badgeClass = 'bg-secondary';                
                            else if (tag.startsWith('IF:')) badgeClass = 'bg-success';
                            else if (tag.startsWith('Ministerial Score:')) badgeClass = 'bg-primary';
                            return `<span class="badge ${badgeClass}">${tag}</span>`;
                        }).join(' ')}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Fade in container
        setTimeout(() => {
            container.style.opacity = '1';
        }, 50);
    }, 300);
}

// Initialize everything
generateYearBadges();
renderPublications(currentYear);

// Timeline interactions
document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
    });
});

// Globe visualization
const locationsData = [
    { lat: 51.11, lng: 17.06, name: 'Wroclaw Medical University', location: 'Wrocław, Poland', period: 'Ongoing', type: 'home', description: '...' },
    { lat: 41.984, lng: 2.821, name: 'University of Girona', location: 'Girona, Spain', period: 'TBD', type: 'internship', description: '...' },
    { lat: 48.841, lng: 2.344, name: 'Chimie ParisTech', location: 'Paris, France', period: 'TBD', type: 'internship', description: '...' },
    { lat: 31.907, lng: 34.809, name: 'Weizmann Institute', location: 'Rehovot, Israel', period: 'TBD', type: 'internship', description: '...' },
    { lat: 39.309, lng: 16.25, name: 'University of Calabria', location: 'Cosenza, Italy', period: 'TBD', type: 'internship', description: '...' },
    { lat: 41.15, lng: -8.616, name: 'University of Porto', location: 'Porto, Portugal', period: '2023', type: 'internship', 
    description: '...' }, 
    { lat: 32.266, lng: -16.924, name: 'PSE 2025', location: 'Porto, Portugal', period: '2023', type: 'conference', description: '...' },
    { lat: 32.266, lng: -16.924, name: 'PSE 2025', location: 'Porto, Portugal', period: '2023', type: 'conference', description: '...' }
];


let myGlobe;

fetch('ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries =>
{
    myGlobe = Globe()
        (document.getElementById('globeViz'))
        .width(document.getElementById('globeViz').offsetWidth)
        .height(600)
        .globeImageUrl('https://unpkg.com/three-globe@2.27.4/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe@2.27.4/example/img/earth-topology.png')
        .backgroundColor('#1a1a1a')
        .polygonsData(countries.features)
        .polygonCapColor(() => 'rgba(0,0,0,0)')      // transparent fill
        .polygonSideColor(() => 'rgba(0,0,0,0)')     // no sides
        .polygonStrokeColor(() => 'black')         // visible border
        .polygonAltitude(0.001)                      // slight elevation for visibility
        .showAtmosphere(true)
        .atmosphereColor('#ffffff')
        .atmosphereAltitude(0.15)
        .pointOfView({ lat: 51.11, lng: 17.06, altitude: 1.5 }, 0)
        .pointsData(locationsData)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(point => {
            if (point.type === 'home') return '#FFD700'; // Gold for home
            if (point.type === 'internship') return '#00ff00'; // Green for internships
            if (point.type === 'conference') return '#ff4444'; // Red for conferences
            return '#ff4444'; // Default
        })
        .pointAltitude(0.02)
        .pointRadius(0.6)
        .pointLabel('name')
        .onPointClick(point => {
            document.getElementById('locationInfo').innerHTML = `
                <h4>${point.name}</h4>
                <p class="text-muted mb-2"><strong>Location:</strong> ${point.location}</p>
                <p class="text-muted mb-2"><strong>Period:</strong> ${point.period}</p>
                <p>${point.description}</p>
            `;
            
            myGlobe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.5 }, 2000);
        });
});

// Handle window resize
window.addEventListener('resize', () => {
    myGlobe.width(document.getElementById('globeViz').offsetWidth);
});

// Toast notification
window.addEventListener('load', () => {
    new bootstrap.Toast(document.getElementById('myToast')).show();
});

// Smooth scroll with dynamic offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            const navbarHeight = document.querySelector('.navbar-custom').offsetHeight;
            const offset = navbarHeight; // navbar height + 20px padding
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Fade in observer
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in-up').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar-custom');
    navbar.style.boxShadow = window.scrollY > 50 ? '0 2px 30px rgba(0,0,0,0.15)' : '0 2px 20px rgba(0,0,0,0.08)';
    
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 300) {
        backToTop.style.display = 'flex';
        backToTop.style.alignItems = 'center';
        backToTop.style.justifyContent = 'center';
    } else {
        backToTop.style.display = 'none';
    }
});

// Dynamically set timeline line width
function updateTimelineLineWidth() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const firstItem = timelineItems[0];
        const lastItem = timelineItems[timelineItems.length - 1];
        const timelineLine = document.querySelector('.timeline-line');
        
        const firstDot = firstItem.querySelector('.timeline-dot');
        const lastDot = lastItem.querySelector('.timeline-dot');
        
        const firstDotCenter = firstItem.offsetLeft + (firstDot.offsetWidth / 2);
        const lastDotCenter = lastItem.offsetLeft + lastItem.offsetWidth - (lastDot.offsetWidth / 2);
        
        timelineLine.style.left = firstDotCenter + 'px';
        timelineLine.style.width = (lastDotCenter - firstDotCenter) + 'px';
    }
}

// Call on load and resize
window.addEventListener('load', updateTimelineLineWidth);
window.addEventListener('resize', updateTimelineLineWidth);

// Update copyright year dynamically
document.getElementById('copyright-year').textContent = `© ${new Date().getFullYear()} Maciej Spiegel`;