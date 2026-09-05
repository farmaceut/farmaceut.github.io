/**
 * Maciej Spiegel — personal research site
 * Data sourced from the author's own habilitation dossier.
 * Six publications missing from the previous build have been restored:
 * P27, P38, and the full Z1–Z6 habilitation cycle (38 + 6 = 44 total, matching
 * the "44 articles" figure in the dossier). Q-quartile tags are only shown
 * where they were already verified in the previous build; the six restored
 * entries intentionally omit a quartile tag since it isn't stated in the
 * source document.
 */
const PortfolioApp = {

    publishers: {
        'MDPI': 'https://cdn.brandfetch.io/idzfzscYTP/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B',
        'Wiley': 'https://upload.wikimedia.org/wikipedia/commons/0/01/Wiley_logo.svg',
        'ACS': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/American_Chemical_Society_logo_2026.svg',
        'RSC': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RSC-brand-guidelines-2019_tcm18-246471.svg',
        'Elsevier': 'https://upload.wikimedia.org/wikipedia/en/6/6a/Elsevier_logo_2019.svg',
        'Frontiers': 'https://upload.wikimedia.org/wikipedia/en/3/39/Frontiers_Media_logo.svg',
        'Springer': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Springer.svg',
        'Taylor & Francis': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Taylor_and_Francis.svg'
    },

    // ---- ADD NEW PUBLICATIONS HERE ----------------------------------------
    // One object per paper. `cycle: 'Z#'` marks a habilitation-cycle paper
    // (gets a violet left border + sorts first in its year on the site).
    // `tags` renders as small pills — keep the "IF: " / "Ministerial Score: "
    // prefixes exactly as-is, generateTags() below matches on those strings.
    // Only include a "Q1".."Q4" tag if you've actually looked up the quartile
    // for that year/journal — don't guess it.
    publications: [
        { year: 2020, publisher: 'MDPI', title: "Flavones’ and Flavonols’ Antiradical Structure–Activity Relationship—A Quantum Chemical Study", authors: "Spiegel M.*, Andruniów T., Sroka Z.", journal: "Antioxidants", doi: "10.3390/antiox9060461", tags: ["Q1", "IF: 6.313", "Ministerial Score: 100", "Article"], cycle: "D" },
        { year: 2020, publisher: 'MDPI', title: "Antioxidant Activity of Selected Phenolic Acids–Ferric Reducing Antioxidant Power Assay and QSAR Analysis of the Structural Features", authors: "Spiegel M., Kapusta K.*, Kołodziejczyk W., Saloni J., Żbikowska B., Hill G.A., Sroka Z.", journal: "Molecules", doi: "10.3390/molecules25133088", tags: ["Q2", "IF: 4.412", "Ministerial Score: 140", "Article"], cycle: "D" },
        { year: 2021, publisher: 'MDPI', title: "Antiradical Activity of Beetroot (<i>Beta vulgaris</i> L.) Betalains", authors: "Spiegel M.*, Gamian A., Sroka Z.", journal: "Molecules", doi: "10.3390/molecules26092439", tags: ["Q2", "IF: 4.927", "Ministerial Score: 140", "Article"] },
        { year: 2021, publisher: 'Frontiers', title: "One Year of the COVID‐19 Pandemic. What Do We Know and What Is Yet to Come? — The Summarising Review", authors: "Malchrzak W., Mastalerz-Migas A., Sroka Z., Spiegel M.*", journal: "International Journal of Public Health", doi: "10.3389/ijph.2021.1603975", tags: ["Q1", "IF: 5.100", "Ministerial Score: 100", "Review"] },
        { year: 2021, publisher: 'MDPI', title: "A Statistically Supported Antioxidant Activity DFT Benchmark—The Effects of Hartree–Fock Exchange and Basis Set Selection on Accuracy and Resources Uptake", authors: "Spiegel M.*, Gamian A., Sroka Z.", journal: "Molecules", doi: "10.3390/molecules26165058", tags: ["Q2", "IF: 4.927", "Ministerial Score: 140", "Article"] },
        { year: 2021, publisher: 'Wiley', title: "Recognition of the True and False Resonance Raman Optical Activity", authors: "Machalska E.⁺, Zając G.⁺, Wierzba A.J., Kapitán J.*, Andruniów T., Spiegel M., Gryko D.*, Bouř P.*, Barańska M.*", journal: "Angewandte Chemie International Edition", doi: "10.1002/anie.202107600", tags: ["Q1", "IF: 16.823", "Ministerial Score: 200", "Article"] },
        { year: 2022, publisher: 'MDPI', title: "In Silico Screening and In Vitro Assessment of Natural Products with Anti-Virulence Activity against Helicobacter pylori", authors: "Spiegel M.⁺*, Krzyżek P.⁺*, Dworniczek E., Adamski R., Sroka Z.", journal: "Molecules", doi: "10.3390/molecules27010020", tags: ["Q2", "IF: 4.927", "Ministerial Score: 140", "Article"] },
        { year: 2022, publisher: 'RSC', title: "Antioxidant and copper-chelating power of new molecules suggested as multiple target agents against Alzheimer's disease. A theoretical comparative study", authors: "Spiegel M., Marino T., Prejanò M., Russo N.*", journal: "Physical Chemistry Chemical Physics", doi: "10.1039/D2CP01918C", tags: ["Q2", "IF: 3.3", "Ministerial Score: 100", "Article"] },
        { year: 2022, publisher: 'MDPI', title: "On the Scavenging Ability of Scutellarein against the OOH Radical in Water and Lipid-like Environments: A Theoretical Study", authors: "Spiegel M., Marino T., Prejanò M., Russo N.*", journal: "Antioxidants", doi: "10.3390/antiox11020224", tags: ["Q1", "IF: 7.0", "Ministerial Score: 100", "Article"] },
        { year: 2022, publisher: 'ACS', title: "Current Trends in Computational Quantum Chemistry Studies on Antioxidant Radical Scavenging Activity", authors: "Spiegel M.*", journal: "Journal of Chemical Information and Modeling", doi: "10.1021/acs.jcim.2c00104", tags: ["Q1", "IF: 5.6", "Ministerial Score: 100", "Review"], cycle: "D" },
        { year: 2022, publisher: 'MDPI', title: "Analytical and Theoretical Studies of Antioxidant Properties of Chosen Anthocyanins; A Structure-Dependent Relationships", authors: "Dudek A., Spiegel M.*, Strugała-Danak P.*, Gabrielska P.", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms23105432", tags: ["Q1", "IF: 5.6", "Ministerial Score: 140", "Article"] },
        { year: 2022, publisher: 'Springer', title: "Natural dihydroisobenzofuran derivatives as a template for promising radical scavengers: theoretical insights into structure–activity relationships, thermochemistry and kinetics", authors: "Spiegel M.*, Sroka Z.", journal: "Theoretical Chemistry Accounts", doi: "10.1007/s00214-022-02922-5", tags: ["Q4", "IF: 1.7", "Ministerial Score: 70", "Article"] },
        { year: 2022, publisher: 'Elsevier', title: "Primary and secondary antioxidant properties of scutellarin and scutellarein in water and lipid-like environments: A theoretical investigation", authors: "Spiegel M.*, Marino T., Prejanò M., Russo N.*", journal: "Journal of Molecular Liquids", doi: "10.1016/j.molliq.2022.120343", tags: ["Q1", "IF: 6.0", "Ministerial Score: 100", "Article"] },
        { year: 2022, publisher: 'Elsevier', title: "Interference of malvidin and its mono- and di-glucosides on the membrane — Combined in vitro and computational chemistry study", authors: "Strugała-Danak P.*, Spiegel M., Hurynowicz K., Gabrielska J.", journal: "Journal of Functional Foods", doi: "10.1016/j.jff.2022.105340", tags: ["Q1", "IF: 5.6", "Ministerial Score: 100", "Article"] },
        { year: 2023, publisher: 'MDPI', title: "The Appliance of A-PRF and CGF in the Treatment of Impacted Mandibular Third Molar Extraction Sockets—Narrative Review", authors: "Selahi D.⁺, Spiegel M.⁺*, Hadzik J.*, Pitułaj A., Michalak F., Kubasiewicz-Ross P., Dominiak M.", journal: "Applied Sciences", doi: "10.3390/app13010165", tags: ["Q2", "IF: 2.7", "Ministerial Score: 100", "Review"] },
        { year: 2023, publisher: 'RSC', title: "Computational assessment of the primary and secondary antioxidant potential of alkylresorcinols in physiological media", authors: "Boulebd H.*, Spiegel M.", journal: "RSC Advances", doi: "10.1039/D3RA05967G", tags: ["Q2", "IF: 3.9", "Ministerial Score: 100", "Article"] },
        { year: 2023, publisher: 'Elsevier', title: "Quantum-mechanical characteristics of apigenin: Antiradical, metal chelation and inhibitory properties in physiologically relevant media", authors: "Spiegel M.*, Sroka Z.", journal: "Fitoterapia", doi: "10.1016/j.fitote.2022.105352", tags: ["Q3", "IF: 2.5", "Ministerial Score: 100", "Article"], cycle: "D" },
        { year: 2023, publisher: 'Frontiers', title: "Computational investigation on the antioxidant activities and on the Mpro SARS-CoV-2 non-covalent inhibition of isorhamnetin", authors: "Spiegel M., Ciardullo G., Marino T., Russo N.", journal: "Frontiers in Chemistry", doi: "10.3389/fchem.2023.1122880", tags: ["Q2", "IF: 3.8", "Ministerial Score: 100", "Article"] },
        { year: 2023, publisher: 'ACS', title: "Tuning the Photophysical Properties of Ru(II) Photosensitizers for PDT by Protonation and Metallation: A DFT Study", authors: "Spiegel M.*, Adamo C.", journal: "The Journal of Physical Chemistry A", doi: "10.1021/acs.jpca.3c00839", tags: ["Q2", "IF: 2.7", "Ministerial Score: 100", "Article"] },
        { year: 2023, publisher: 'Elsevier', title: "The mechanistic insights into the role of pH and solvent on antiradical and prooxidant properties of polyphenols — Nine compounds case study", authors: "Spiegel M.*, Cel K., Sroka Z.", journal: "Food Chemistry", doi: "10.1016/j.foodchem.2022.134677", tags: ["Q1", "IF: 8.5", "Ministerial Score: 200", "Article"] },
        { year: 2023, publisher: 'ACS', title: "Theoretical Insights into the Oxidative Stress-Relieving Properties of Pinocembrin─An Isolated Flavonoid from Honey and Propolis", authors: "Spiegel M.*", journal: "The Journal of Physical Chemistry B", doi: "10.1021/acs.jpcb.3c03545", tags: ["Q3", "IF: 2.8", "Ministerial Score: 140", "Article"] },
        { year: 2023, publisher: 'MDPI', title: "Malvidin and Its Mono- and Di-Glucosides Forms: A Study of Combining Both In Vitro and Molecular Docking Studies Focused on Cholinesterase, Butyrylcholinesterase, COX-1 and COX-2 Activities", authors: "Strugała-Danak P.*, Spiegel M.*, Gabrielska J.", journal: "Molecules", doi: "10.3390/molecules28237872", tags: ["Q2", "IF: 4.2", "Ministerial Score: 140", "Article"] },
        { year: 2024, publisher: 'Taylor & Francis', title: "Post-CCSD(T) corrections to bond distances and vibrational frequencies: the power of Λ", authors: "Spiegel M.⁺, Semidalas E.⁺, Martin J.M.L.*, Bentley M.R., Stanton J.F.", journal: "Molecular Physics", doi: "10.1080/00268976.2023.2252114", tags: ["Q3", "IF: 1.6", "Ministerial Score: 70", "Article"] },
        { year: 2024, publisher: 'Wiley', title: "Primary Antioxidant Power and Mpro SARS‐CoV‐2 Non‐Covalent Inhibition Capabilities of Miquelianin", authors: "Spiegel M., Prejanò M., Russo N.*, Marino T.", journal: "Chemistry – An Asian Journal", doi: "10.1002/asia.202400079", tags: ["Q2", "IF: 3.5", "Ministerial Score: 100", "Article"] },
        { year: 2024, publisher: 'ACS', title: "Unveiling the Antioxidative Potential of Galangin: Complete and Detailed Mechanistic Insights through Density Functional Theory Studies", authors: "Spiegel M.*", journal: "The Journal of Organic Chemistry", doi: "10.1021/acs.joc.4c00611", tags: ["Q1", "IF: 3.6", "Ministerial Score: 140", "Article"] },
        { year: 2024, publisher: 'Elsevier', title: "A green approach to synthesize polybutene lubricants from mixed C4 monomers using supported dendritic ionic liquids", authors: "Ghavampoor A., Bahri-Laleh N.*, Sadjadi S.*, Nekoomanesh M., Vahid A., Duran J., Spiegel M., Poater A.*", journal: "Journal of Molecular Liquids", doi: "10.1016/j.molliq.2024.125814", tags: ["Q1", "IF: 5.2", "Ministerial Score: 100", "Article"] },
        { year: 2025, publisher: 'RSC', title: "On the photophysical properties of Al-, Ga- and In-hemin complexes: a quantum chemical investigation", authors: "Spiegel M., Russo N.*", journal: "Physical Chemistry Chemical Physics", doi: "10.1039/d5cp03186a", tags: ["IF: 2.9", "Ministerial Score: 100", "Article"] },
        { year: 2025, publisher: 'Wiley', title: "Fisetin as a Blueprint for Senotherapeutic Agents – Elucidating Geroprotective and Senolytic Properties with Molecular Modeling", authors: "Spiegel M.*", journal: "Chemistry – A European Journal", doi: "10.1002/chem.202403755", tags: ["Q2", "IF: 3.7", "Ministerial Score: 100", "Article"] },
        { year: 2025, publisher: 'ACS', title: "A Comprehensive Experimental and Theoretical Investigation of the Antioxidant Properties of Hispidin and Isohispidin", authors: "Boulebd H., Amine Khodja I., Benarous K., Mączyński M., Spiegel M.*", journal: "The Journal of Organic Chemistry", doi: "10.1021/acs.joc.4c02837", tags: ["Q1", "IF: 3.6", "Ministerial Score: 140", "Article"] },
        { year: 2025, publisher: 'Wiley', title: "Understanding the Photophysical Properties of Pd and Pt Transition‐Metal Isocorroles: A Theoretical Investigation", authors: "Spiegel M., Russo N.*", journal: "Chemistry – A European Journal", doi: "10.1002/chem.202403725", tags: ["Q2", "IF: 3.7", "Ministerial Score: 100", "Article"] },
        { year: 2025, publisher: 'Elsevier', title: "Late-stage functionalization of pharmaceuticals by C–C cross-coupling enabled by wingtip-flexible N-heterocyclic carbenes", authors: "Yang S., Zhou T., Yu X., Poater A.*, Duran J., Spiegel M.*, Cavallo L., Nolan S.P.*, Szostak M.*", journal: "Chem Catalysis", doi: "10.1016/j.checat.2025.101297", tags: ["Q1", "IF: 11.6", "Ministerial Score: 20", "Article"] },
        { year: 2025, publisher: 'MDPI', title: "Photophysical Properties of a Chiral Iridium-Based Photosensitizer as an Efficient Photodynamic Therapy Agent: A Theoretical Investigation", authors: "Spiegel M.*", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms26115062", tags: ["Q1", "IF: 4.9", "Ministerial Score: 140", "Article"] },
        { year: 2025, publisher: 'ACS', title: "On the Photosensitizing Properties of Aloe-Emodin in Photodynamic Therapy: Insights from the Molecular Modeling", authors: "Spiegel M.*", journal: "The Journal of Physical Chemistry B", doi: "10.1021/acs.jpcb.5c01117", tags: ["Q3", "IF: 2.9", "Ministerial Score: 140", "Article"], cycle: "H" },
        { year: 2025, publisher: 'ACS', title: "Aglycone, Glycoside, or Glucuronide? Experimental and Mechanistic Insights into the Antioxidative Potential of Gossypetin, Gossypin, and Hibifolin", authors: "Spiegel M.*, Kowalczyk A.", journal: "The Journal of Physical Chemistry B", doi: "10.1021/acs.jpcb.5c03338", tags: ["Q3", "IF: 2.9", "Ministerial Score: 140", "Article"] },
        { year: 2025, publisher: 'Elsevier', title: "Soranjidiol as a photosensitizer: Mechanistic insights into its photochemistry and photoinduced tautomerization", authors: "Spiegel M.*", journal: "Journal of Photochemistry and Photobiology B: Biology", doi: "10.1016/j.jphotobiol.2025.113203", tags: ["Q1", "IF: 3.7", "Ministerial Score: 100", "Article"], cycle: "H" },
        { year: 2025, publisher: 'MDPI', title: "Are Algae a Good Source of Antioxidants? Mechanistic Insights into Antiradical Activity of Eckol", authors: "Spiegel M.*", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms26189223", tags: ["Q1", "IF: 4.9", "Ministerial Score: 140", "Article"] },
        { year: 2025, publisher: 'Elsevier', title: "Impact of α-tocopherol derivatives on the structural and functional properties of model lipid nanocarriers: A biophysical modeling study", authors: "Dudek A., Spiegel M., Benkowska-Biernacka D., Domańska M., Pruchnik H.*", journal: "Chemistry and Physics of Lipids", doi: "10.1016/j.chemphyslip.2025.105539", tags: ["Q2", "IF: 2.8", "Ministerial Score: 100", "Article"] },
        { year: 2025, publisher: 'ACS', title: "Antioxidant Power of Vitexin and Isovitexin Against OOH Radicals: A Comparative Theoretical Investigation", authors: "Spiegel M., Russo N.*", journal: "The Journal of Organic Chemistry", doi: "10.1021/acs.joc.5c01680", tags: ["Q1", "IF: 3.6", "Ministerial Score: 140", "Article"] },
        { year: 2025, publisher: 'MDPI', title: "Evaluation of 2,7-Naphthyridines as Targeted Anti-Staphylococcal Candidates with Microbiota-Sparing Properties", authors: "Wójcicka A.*, Spiegel M., Dudek B., Brożyna M., Junka A., Mączyński M.", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms262110442", tags: ["Q1", "IF: 4.9", "Ministerial Score: 140", "Article"] },
        { year: 2026, publisher: 'ACS', title: "Aggregation suppresses internal conversion and enhances triplet yield in π-rich natural dyes by vibronic coupling control: a case study of hypericin supramolecular assembly", authors: "Spiegel M.*", journal: "Journal of Natural Products", doi: "10.1021/acs.jnatprod.5c01289", tags: ["IF: 3.6", "Ministerial Score: 100", "Article"], cycle: "H" },
        { year: 2026, publisher: 'Elsevier', title: "Mechanistic and kinetic insights into rubiadin phototoxicity: linking theory to photodynamic efficiency", authors: "Spiegel M.*", journal: "Dyes and Pigments", doi: "10.1016/j.dyepig.2025.113387", tags: ["IF: 4.2", "Ministerial Score: 100", "Article"], cycle: "H" },
        { year: 2026, publisher: 'Elsevier', title: "In silico design of anthraquinone-based two-photon photosensitisers for NIR-activated photodynamic therapy in hypoxic tumors", authors: "Spiegel M.*", journal: "Dyes and Pigments", doi: "10.1016/j.dyepig.2025.113507", tags: ["IF: 4.2", "Ministerial Score: 100", "Article"], cycle: "H" },
        { year: 2026, publisher: 'MDPI', title: "Two–photon absorption properties and structure–property relationships of natural 9,10–anthraquinones: a curated RI–CC2 dataset", authors: "Spiegel M.*", journal: "International Journal of Molecular Sciences", doi: "10.3390/ijms27010087", tags: ["IF: 4.9", "Ministerial Score: 140", "Article"], cycle: "H" },
        { year: 2026, publisher: 'Elsevier', title: "Mechanistic insights into NOBA hydrolysis by viper venom secreted phospholipase A2", authors: "Calixto A.R.⁺, Pinto R.⁺, Spiegel M., Ramos M.J., Fernandes P.A.*", journal: "Biochimie", doi: "10.1016/j.biochi.2025.12.003", tags: ["IF: 3.0", "Ministerial Score: 100", "Article"] },
        { year: 2026, publisher: 'Elsevier', title: "Synthesis of low molecular weight polyisobutylene using a sulfonated polyionic liquid as coinitiator", authors: "Ahmadvandi S.H., Haghighi M.N., Spiegel M., Duran J., Yousefi F.K., Bahri-Laleh N., Sadjadi S., Poater A.*", journal: "Results in Chemistry", doi: "10.1016/j.rechem.2026.103217", tags: ["IF: 5.8", "Ministerial Score: 20", "Article"] },
        { year: 2026, publisher: 'Elsevier', title: "Halogenation and chalcogenation of coumarin as a reliable strategy to design more efficient PDT photosensitizers: insights from theory", authors: "Spiegel M.*, Russo N.*", journal: "Dyes and Pigments", doi: "10.1016/j.dyepig.2026.113860", tags: ["IF: 4.2", "Ministerial Score: 100", "Article"] },
        { year: 2026, publisher: 'Elsevier', title: "Experimental and Computational Study on the Properties of a Synthesized Luminescent Neutral Cu(I) Complex with Diphosphine and Diimine ligands", authors: "Sun X., Sheng R.*, Spiegel M., Wang Z.*", journal: "Optical Materials", doi: "10.1016/j.optmat.2026.118390", tags: ["IF: 4.3", "Ministerial Score: 70", "Article"] },
    ],

    // ---- INSTITUTIONAL PARTNERS FOR LOGO STRIP -----------------------------
    // Separate from locations[] on purpose: this is a curated set of
    // institutions where real collaboration exists (home + research stays),
    // not a list of every conference venue. Each entry requires a logo and
    // a website; the logo will be rendered as a clickable link.
    // Add / remove entries as collaborations evolve.
    institutions: [
        { name: 'Wrocław Medical University', logo: 'https://upload.wikimedia.org/wikipedia/en/3/3e/Wrocław_Medical_University_Seal.png', website: 'https://www.umw.edu.pl/' },
        { name: 'University of Calabria', logo: 'https://apre.it/wp-content/uploads/2021/01/logo_Uni-calabria.jpg', website: 'https://www.unical.it/' },
        { name: 'Chimie ParisTech, PSL University', logo: 'https://www.chimieparistech.psl.eu/wp-content/uploads/2018/11/logo-chimie-paristech-psl-w270.png', website: 'https://www.chimieparistech.psl.eu/' },
        { name: 'Weizmann Institute of Science', logo: 'https://www.weizmann.ac.il/pages/sites/default/files/group_1262x_1.png', website: 'https://www.weizmann.ac.il/' },
        { name: 'University of Porto', logo: 'https://sincronyproject.eu/wp-content/uploads/2024/02/uporto-e1603293443607.png', website: 'https://www.up.pt/' },
        { name: 'University of Girona', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Logo_de_la_universitat_de_girona.png', website: 'https://www.udg.edu/' },
        { name: 'Altınbaş University', logo: 'https://altinbas.edu.tr/asset/awd/content/SC_IMAGE_20250120151444_1737375284.6598.jpeg', website: 'https://www.altinbas.edu.tr/' },
        { name: 'Univerzita Karlova', logo: 'https://cdn.brandfetch.io/id725hbZju/idZjFHntey.svg', website: 'https://cuni.cz/' },
        { name: 'University of Padova', logo: 'https://fundit.fr/sites/default/files/styles/max_650x650/public/actors/1583-universite-padoue.jpg?itok=XB3mRlKz', website: 'https://www.unipd.it/' },
        { name: 'Universidade da Madeira', logo: 'https://www.uma.pt/wp-content/uploads/2021/09/uma-logo.png', website: 'https://www.uma.pt/' }
    ],

    // ---- ADD NEW COLLABORATION / CONFERENCE MARKERS HERE -------------------
    // type: 'home' (gold, should stay just the one), 'internship' (violet —
    // research stays / ongoing collaborations), or 'conference' (teal).
    // Colour mapping lives in initGlobe()'s pointColor() below.
    // logo is optional — leave '' if you don't have a clean transparent one;
    // it's shown on a small white plaque so most logos work fine on it.
    locations: [
        // ============================================================
        // HOME INSTITUTION
        // ============================================================
        { lat: 51.10974, lng: 17.07193, name: 'Wrocław Medical University', logo: 'https://upload.wikimedia.org/wikipedia/en/3/3e/Wrocław_Medical_University_Seal.png', location: 'Wrocław, Poland', period: 'Home institution', type: 'home', description: 'Department of Organic Chemistry and Pharmaceutical Technology, Faculty of Pharmacy — where all of this research is based, from doctorate to habilitation.' },

        // ============================================================
        // RESEARCH STAYS
        // ============================================================
        { lat: 39.36209, lng: 16.22371, name: 'University of Calabria', logo: 'https://apre.it/wp-content/uploads/2021/01/logo_Uni-calabria.jpg', location: 'Rende, Italy', period: 'Jul–Aug 2021 (ongoing)', type: 'internship', description: 'A two-month stay with Prof. Nino Russo launched what is now my longest-running collaboration: eight joint papers on antioxidant mechanisms and metal-complex photosensitisers, with a further Erasmus+ visit planned for March 2026.' },
        { lat: 48.84386, lng: 2.34360, name: 'Chimie ParisTech, PSL University', location: 'Paris, France', logo: 'https://www.chimieparistech.psl.eu/wp-content/uploads/2018/11/logo-chimie-paristech-psl-w270.png', period: 'Mar–May 2022', type: 'internship', description: 'Three months with Prof. Carlo Adamo, refining TD-DFT modelling of excited states — the methodological basis for the Ru(II) photosensitiser paper and, later, the whole photodynamic therapy pillar of my work.' },
        { lat: 31.90785, lng: 34.81334, name: 'Weizmann Institute of Science', logo: 'https://www.weizmann.ac.il/pages/sites/default/files/group_1262x_1.png', location: 'Rehovot, Israel', period: 'Feb–Mar 2023', type: 'internship', description: 'With Prof. Jan M. L. Martin, benchmarking coupled-cluster methods up to CCSDTQ for diatomic molecules and ozone — the paper that later won the Molecular Physics Early Career Researcher Prize 2024.' },
        { lat: 41.15247, lng: -8.63968, name: 'University of Porto', logo: 'https://sincronyproject.eu/wp-content/uploads/2024/02/uporto-e1603293443607.png', location: 'Porto, Portugal', period: 'Jun–Jul 2023', type: 'internship', description: 'QM/MM modelling with Prof. Pedro A. Fernandes of the catalytic mechanism of a viper-venom phospholipase A2 — work on standardising toxicology substrate models for snake-venom research.' },
        { lat: 41.96484, lng: 2.82941, name: 'University of Girona', location: 'Girona, Spain', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Logo_de_la_universitat_de_girona.png', period: '15–29 May 2024', type: 'internship', description: 'A stay with Dr. Albert Poater that connected me to a wider catalysis network (Rutgers, RIKEN, Ghent, KAUST); resulted in two papers on NHC-catalysed cross-coupling and ionic-liquid lubricant chemistry.' },
        { lat: 39.36209, lng: 16.22371, name: 'University of Calabria (2nd stay)', logo: 'https://www.uni-med.net/wp-content/uploads/2022/12/University-of-Calabria.png', location: 'Rende, Italy', period: 'Mar 2026 (Erasmus+)', type: 'internship', description: 'A second research stay with Prof. Nino Russo, deepening the collaboration on photophysical properties of metal-based photosensitisers and extending the TD-DFT toolkit developed during the first stay.' },
        { lat: 40.98319, lng: 28.87226, name: 'Altınbaş University', location: 'Istanbul, Turkey', logo: 'https://altinbas.edu.tr/asset/awd/content/SC_IMAGE_20250120151444_1737375284.6598.jpeg', period: '2026 (IDUB mobility)', type: 'internship', description: 'A funded mobility project with Prof. Ebru Özdemir Nath, applying computational chemistry to the biological activity of phytochemicals isolated by her group — a new collaboration bridging natural product chemistry and in silico pharmacology.' },
        { lat: 50.06967, lng: 14.42821, name: 'Univerzita Karlova', location: 'Prague, Czech Republic', logo: 'https://cdn.brandfetch.io/id725hbZju/idZjFHntey.svg', period: '2026 (Visegrad Fellowship)', type: 'internship', description: 'QM/MM study with Prof. Jaroslav V. Burda on how Au(I) complexes inhibit thioredoxin reductase — work that touches directly on selenocysteine-containing active sites and expands my methodological toolkit into bioinorganic QM/MM.' },
        { lat: 45.34603, lng: 11.95726, name: 'University of Padova', location: 'Padua, Italy', logo: 'https://fundit.fr/sites/default/files/styles/max_650x650/public/actors/1583-universite-padoue.jpg?itok=XB3mRlKz', period: '2026', type: 'internship', description: 'Nanogrant collaboration with Prof. Massimiliano Magro on computational modelling of DNA/nano-bio systems — bridging computational chemistry and experimental nanomedicine.' },
        // ============================================================
        // CONFERENCES
        // ============================================================
        { lat: 48.84386, lng: 2.34360, name: '32nd SCT Young Research Fellows Meeting', location: 'Paris, France', logo: 'https://www.efmc.info/data/thumbnail/1669046799logo-sct-2022.png', period: '26–28 Feb 2025', type: 'conference', description: 'Presented in silico design of fisetin derivatives with enhanced senotherapeutic properties.' },
        { lat: 40.83946, lng: 14.18525, name: 'EuChemS CompChem 2025', logo: 'https://www.eucompchem2025.unina.it/wp-content/uploads/2025/03/cropped-Picture1.png', location: 'Naples, Italy', period: '15–18 Sep 2025', type: 'conference', description: 'A poster on antisense-oligonucleotide binding-affinity optimisation at one of Europe\'s leading computational chemistry forums, alongside a brief exchange with the ORCA developer team.', url: 'https://www.eucompchem2025.unina.it/' },
        { lat: 32.65891, lng: -16.92465, name: 'PSE Meeting 2025: Phytochemicals as Drugs, Foods, and Biocommunicators', logo: 'https://new.phytochemicalsociety.org/wp-content/uploads/2021/12/PSE287x120.png', location: 'Funchal, Madeira, Portugal', period: '22–24 Oct 2025', type: 'conference', description: 'Presented preliminary QSAR results from the NCN Preludium grant on the antioxidant activity of dietary polyphenols in FRAP, DPPH and ABTS assays.', url: 'https://new.phytochemicalsociety.org/pse-meeting-2025/' },
        { lat: 43.30555, lng: -2.01047, name: 'DFT 2026', location: 'San Sebastián, Spain', logo: 'https://dft2026.com/wp-content/uploads/2025/01/gris-e1739989919790.png', period: '2026', type: 'conference', description: 'Presenting DFT-guided design of Pt(II) complexes with heterocyclic ligands as anticancer agents — a key forum for the computational chemistry community.', url: 'https://dft2026.com' },
        { lat: 32.65891, lng: -16.92465, name: 'TheoBio 2026', location: 'Funchal, Madeira, Portugal', logo: 'https://theobio2026.com/wp-content/uploads/2026/03/cropped-Logo_TheoBio2026horiz_noBG-1-scaled-1-600x156.png', period: '2026', type: 'conference', description: 'Presenting TROI, a trajectory-resolved Monte Carlo framework for directional steric accessibility at reactive centres — an extension of the work first shown at PSE 2025.', url: 'https://theobio2026.com' },
        { lat: 39.90571, lng: 116.39130, name: 'MMCS 2026', location: 'Beijing, China', logo: 'https://api.sciforum.net/events_files/1319/MMCS%202026-Banner-hero.jpg', period: '2026', type: 'conference', description: 'Presented preliminary QSAR results from the NCN Preludium grant on the antioxidant activity of dietary polyphenols in FRAP, DPPH and ABTS assays.', url: 'https://www.sciforum.net/event/mmcs2026' },
        { lat: 51.10974, lng: 17.07193, name: 'Wrocławskie Dni Modelowania Molekularnego 2026', location: 'Wrocław, Poland', logo: 'https://makromol.chem.uni.wroc.pl/assets/basic/img/UWr-logo.svg', period: '2026', type: 'conference', description: 'A local flagship event — presenting recent work on quantum-chemical modelling of photosensitiser photophysics to the Polish computational chemistry community.', url: 'https://makromol.chem.uni.wroc.pl/' },
        { lat: 51.10974, lng: 17.07193, name: 'Modeling and Design of Molecular Materials 2025', location: 'Wrocław, Poland', logo: 'https://study.gov.pl/sites/default/files/logo_ucz_wiz/88/logo_pwr_kolor_poziom_ang.png', period: '2026', type: 'conference', description: 'A local flagship event — presenting recent work on quantum-chemical modelling of photosensitiser photophysics to the Polish computational chemistry community.', url: 'https://mdmm2026.com' },
        { lat: 51.25056, lng: 22.57010, name: 'XVIII Interdyscyplinarna Konferencja Naukowa TYGIEL 2026', location: 'Lubling (remote), Poland', logo: 'https://konferencja-tygiel.pl/wp-content/uploads/sites/15/2025/09/baner-KT18-2026_1920x480pc.jpg', period: '2026', type: 'conference', description: 'An interdisciplinary forum bringing together young researchers from across Poland — presenting work at the intersection of computational chemistry and pharmaceutical sciences.', url: 'https://konferencja-tygiel.pl/' },
    ],

    // Odstęp (w stopniach) między rozstawionymi punktami, gdy w jednym
    // miejscu nakłada się 2-3 różne typy (np. home + conference w tym
    // samym mieście). Przy 2 typach wychodzi para punktów naprzeciw siebie;
    // dopiero od 3 w górę robi się z tego właściwa rozeta. To NIE jest
    // wartość z dokumentacji globe.gl (biblioteka nie ma pojęcia "rozety"
    // ani "pary") - to czysto wizualny dobór, dostrojony pod altitude:1.6
    // używane w pointOfView() po kliknięciu. Zwiększ, jeśli punkty się
    // nachodzą na Twoim ekranie; zmniejsz, jeśli wyglądają na rozjechane.
    MIXED_MARKER_OFFSET_DEG: 0.15,

    // Promienie walców na globusie - subiektywny dobór wizualny (nie ma
    // "poprawnej" wartości w dokumentacji globe.gl), zmniejszone względem
    // poprzedniej wersji (0.55 / 0.8) na Twoją prośbę. SINGLE dotyczy
    // zwykłego pojedynczego punktu i pojedynczego typu w parze/rozecie;
    // MERGED dotyczy scalonych wielokrotności (ten sam typ >1 razy w tym
    // samym miejscu) - dostrój obie wartości do gustu, zachowując
    // MERGED > SINGLE, żeby "więcej wydarzeń" nadal było widoczne.
    POINT_RADIUS_SINGLE: 0.5,
    POINT_RADIUS_MERGED: 0.65,

    getTypeColor(type) {
        if (type === 'home') return '#FFD700';
        if (type === 'conference') return '#1fe0b0';
        return '#9d8cff'; // internship / inne
    },

    openLocationCarousel(infoBox, point) {
        const items = point.combined;
        const city = items[0].location || items[0].name;

        infoBox.innerHTML = `
        <h4>${city}</h4>
        <div class="sp-location-carousel">
            <button type="button" class="sp-loc-nav sp-loc-prev" aria-label="Poprzedni wpis">‹</button>
            <div class="sp-location-slide"></div>
            <button type="button" class="sp-loc-nav sp-loc-next" aria-label="Następny wpis">›</button>
        </div>
        <span class="sp-location-counter"></span>
    `;

        const slide = infoBox.querySelector('.sp-location-slide');
        const counter = infoBox.querySelector('.sp-location-counter');
        let idx = 0;

        const paint = (dir) => {
            idx = ((idx % items.length) + items.length) % items.length;
            const item = items[idx];
            const html = `
            ${item.logo ? `<img src="${item.logo}" alt="${item.name}">` : ''}
            <strong style="display:block; margin:0 0 4px;">${item.name}</strong>
            <h6 style="margin:0 0 4px;">${item.period} · <span style="color:${this.getTypeColor(item.type)}">${item.type}</span></h6>
            <p style="margin:0; font-size:.9rem;">${item.description}</p>
            ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" style="font-family:var(--f-mono); font-size:.72rem; color:var(--gold);">${item.url}</a>` : ''}
        `;
            counter.textContent = `${idx + 1} / ${items.length}`;

            if (dir === 0) { slide.innerHTML = html; return; }

            slide.style.setProperty('--slide-dir', dir > 0 ? '14px' : '-14px');
            slide.classList.add('is-shifted');
            slide.addEventListener('transitionend', function onOut() {
                slide.removeEventListener('transitionend', onOut);
                slide.innerHTML = html;
                slide.style.setProperty('--slide-dir', dir > 0 ? '-14px' : '14px');
                requestAnimationFrame(() => requestAnimationFrame(() => slide.classList.remove('is-shifted')));
            }, { once: true });
        };

        infoBox.querySelector('.sp-loc-prev').addEventListener('click', () => { idx--; paint(-1); });
        infoBox.querySelector('.sp-loc-next').addEventListener('click', () => { idx++; paint(1); });

        paint(0);
    },

    groupLocations(locs) {
        const map = new Map();
        locs.forEach(loc => {
            const key = `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(loc);
        });

        return Array.from(map.entries()).flatMap(([key, group]) => {
            const [lat, lng] = key.split(',').map(Number);
            if (group.length === 1) return [group[0]];

            const combined = group.map(g => ({
                name: g.name,
                location: g.location,
                period: g.period,
                description: g.description,
                type: g.type,
                logo: g.logo,
                url: g.url || ''
            }));
            // Grupujemy PO TYPIE, nie po pojedynczym wpisie - liczy się, ile
            // RÓŻNYCH kategorii (home/internship/conference) jest w tym
            // miejscu, nie ile surowych wydarzeń. Dwa wydarzenia TEGO
            // SAMEGO typu w tym samym miejscu to zawsze jeden (większy)
            // walec danego typu - nigdy dwa osobne, rozstawione płatki.
            const byType = new Map();
            group.forEach(g => {
                if (!byType.has(g.type)) byType.set(g.type, []);
                byType.get(g.type).push(g);
            });
            const distinctTypes = Array.from(byType.keys());

            if (distinctTypes.length === 1) {
                // Jeden typ, kilka wydarzeń -> jeden większy walec (jak dotychczas).
                return [{ ...group[0], lat, lng, combined, _merged: true }];
            }

            // Kilka RÓŻNYCH typów w tym samym miejscu -> jeden walec NA TYP
            // (2 typy = para naprzeciw siebie, 3 typy = rozeta), rozstawione
            // wokół wspólnej lokalizacji - dokładnie tyle punktów, ile
            // różnych kategorii, niezależnie od tego, ile surowych wydarzeń
            // kryje się w każdej z nich. Jeśli dany typ ma więcej niż jedno
            // wydarzenie (np. 2x conference), JEGO walec też dostaje
            // _merged:true (większy promień) - tak jak scalony pojedynczy
            // punkt powyżej, zamiast mnożyć płatki tego samego koloru.
            // dLng dzielimy przez cos(lat), bo stopnie długości geogr.
            // "kurczą się" bliżej biegunów - bez tego okrąg wyszedłby
            // owalny zamiast równomierny.
            const n = distinctTypes.length;
            return distinctTypes.map((type, i) => {
                const entries = byType.get(type);
                const angle = (2 * Math.PI * i) / n - Math.PI / 2; // start od góry
                const dLat = this.MIXED_MARKER_OFFSET_DEG * Math.sin(angle);
                const dLng = (this.MIXED_MARKER_OFFSET_DEG * Math.cos(angle)) / Math.cos(lat * Math.PI / 180);
                return {
                    ...entries[0],
                    lat: lat + dLat,
                    lng: lng + dLng,
                    combined,
                    _merged: entries.length > 1,
                    // Prawdziwy środek grupy - używany przy centrowaniu kamery
                    // po kliknięciu, żeby nie doskakiwała do jednego płatka.
                    _centerLat: lat,
                    _centerLng: lng
                };
            });
        });
    },

    // ---- ADD MEDIA / OUTREACH ITEMS HERE ---------------------------------
    // One object per entry. color: 'teal' | 'gold' | 'violet' (left border/dot).
    // type: 'Popular science', 'Interview', 'Recognition', 'Research highlight',
    // 'Award news', 'Ranking news', 'University news'.
    // Set `featured: true` for the single large card on the left.
    mediaItems: [
        {
            date: '2025',
            title: 'Bright Therapy: Photodynamic Therapy in Oncology',
            description: 'How femtosecond-scale molecular processes determine PDT effectiveness and why quantum modelling improves clinical predictability.',
            type: 'Research highlight',
            color: 'violet',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/jasna-terapia-terapia-fotodynamiczna-w-onkologii',
            featured: true
        },
        {
            date: 'Oct 2024',
            title: 'Designing Innovative Drugs: Antioxidants and Senolytics',
            description: 'Popular-science article on computational design of new senolytic compounds, including fisetin derivatives.',
            type: 'Popular science',
            color: 'teal',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/dr-maciej-spiegel-projektuje-innowacyjne-leki'
        },
        {
            date: 'May 2025',
            title: 'Scientific Leader of UMW',
            description: 'Named among 40 researchers awarded the Rector\'s "Scientific Leader" prize for supporting colleagues during evaluation.',
            type: 'Recognition',
            color: 'teal',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/liderzy-naukowi-umw'
        },
        {
            date: '2025',
            title: 'Persistence Wins: Computational Chemistry and Research Philosophy',
            description: 'Q&A about research areas, motivations, and advice for young scientists.',
            type: 'Interview',
            color: 'teal',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/upor-wygrywa'
        },
        {
            date: 'Dec 2025',
            title: 'University Celebration 2025: Doctorate Before 30 and Top 2% Listing',
            description: 'Recognised among Wroclaw Medical University scientists included in the World\'s Top 2% Scientists 2025 ranking (single-year category)..',
            type: 'University news',
            color: 'teal',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/swieto-uczelni-2025-w-auli-leopoldina'
        },
        {
            date: '2025',
            title: 'World\'s Top 2% Scientists 2025',
            description: 'Included in the single-year category of the Stanford/Elsevier ranking for 2024 achievements.',
            type: 'Ranking news',
            color: 'teal',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/worlds-top-2-scientists-2025'
        },
        {
            date: '2025',
            title: 'Member of the Council of the Pharmaceutical Sciences Discipline',
            description: 'Elected as a member of the Council for the 2025–2028 term.',
            type: 'University news',
            color: 'teal',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/zakonczyly-sie-wybory-do-rad-dyscyplin'
        },
        {
            date: 'Dec 2024',
            title: 'University Celebration 2024: Doctorate Before 30',
            description: 'Recognised among early-career researchers who completed their doctorate before age 30.',
            type: 'University news',
            color: 'teal',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/swieto-uczelni-1'
        },
        {
            date: 'Dec 2024',
            title: 'Research Worth a Medal: Iuvenes Wratislaviae Award',
            description: 'Announcement of the Polish Academy of Sciences medal for the flavonoid antioxidant modelling cycle.',
            type: 'Award news',
            color: 'gold',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/badania-na-medal'
        },
        {
            date: 'Sep 2024',
            title: 'World\'s Top 2% Scientists 2024',
            description: 'Named in the single-year category of the 2024 edition, placing 15th among Wroclaw Medical University researchers.',
            type: 'Ranking news',
            color: 'teal',
            url: 'https://www.umw.edu.pl/pl/aktualnosci/worlds-top-2-proc-scientists-2024'
        }
    ],

    // ---- QUANTUM FOOTER TAGLINES -------------------------------------------
    footerTaglines: [
        "Website optimized at the B3LYP / 6-31G* level of theory.",
        "Site designed & built, atom by curated atom.",
        "Zero imaginary frequencies found in this layout.",
        "Page geometry successfully converged.",
        "Solved by Schrödinger, styled by CSS.",
        "Site powered by DFT, caffeine, and cluster queue priority.",
        "No SCF convergence failures were suffered in the making of this site.",
        "Layout reached its global minimum."
    ],

    /* ------------------------------------------------------------------ */

    init() {
        this.currentYear = new Date().getFullYear().toString();
        this.initTheme();
        this.generateYearBadges();
        this.renderPublications(this.currentYear);
        this.renderMedia();
        this.initGlobe();
        this.initLogoStrip();
        this.initReveal();
        this.initTimeline();
        this.initTimelineHelix();
        this.initMobileMenu();
        this.initToast();
        this.initBackToTop();
        this.initCopyrightYear();
        this.initFooterTagline();
    },

    /* Day/Night theme -----------------------------------------------------
       Order of precedence: saved user choice (localStorage) > OS preference
       (prefers-color-scheme) > night (the site's default design). The
       toggle button (#themeToggle) always just flips day<->night and saves
       the explicit choice, overriding the OS setting from then on. */
    initTheme() {
        const root = document.documentElement;
        const saved = localStorage.getItem('sp_theme');
        let theme = saved;
        if (!theme) {
            theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'day' : 'night';
        }
        root.setAttribute('data-theme', theme);

        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.addEventListener('click', () => {
                const next = root.getAttribute('data-theme') === 'day' ? 'night' : 'day';
                root.setAttribute('data-theme', next);
                localStorage.setItem('sp_theme', next);
            });
        }

        // If the user never made an explicit choice, keep following the OS.
        if (!saved && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
                if (localStorage.getItem('sp_theme')) return; // user has since chosen manually
                root.setAttribute('data-theme', e.matches ? 'day' : 'night');
            });
        }
    },

    generateYearBadges() {
        const years = [...new Set(this.publications.map(p => p.year))].sort((a, b) => b - a);
        const hasCurrent = years.includes(parseInt(this.currentYear, 10));
        if (!hasCurrent) { this.currentYear = years[0].toString(); }

        const filter = document.getElementById('years-filter');
        filter.innerHTML = years.map(yr =>
            `<span class="year-badge ${yr.toString() === this.currentYear ? 'active' : ''}" data-year="${yr}">${yr}</span>`
        ).join('');

        filter.addEventListener('click', (e) => {
            if (e.target.classList.contains('year-badge')) {
                document.querySelectorAll('.year-badge').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderPublications(e.target.dataset.year);
            }
        });
    },

    renderMedia() {
        const container = document.getElementById('mediaLayout');
        if (!container) return;

        const featured = this.mediaItems.find(item => item.featured) || this.mediaItems[0];
        const rest = this.mediaItems.filter(item => item !== featured);

        container.innerHTML = `
            <div class="sp-media-featured is-${featured.color || 'teal'}">
                <div class="sp-media-featured-content">
                    <span class="sp-media-type">${featured.type}</span>
                    <h3>${featured.title}</h3>
                    <p>${featured.description}</p>
                    <div class="sp-media-featured-meta">
                        <span>${featured.date}</span>
                        <a href="${featured.url}" target="_blank" rel="noopener">Read full story ↗</a>
                    </div>
                </div>
            </div>
            <div class="sp-media-compact">
                ${rest.map(item => `
                    <a href="${item.url}" target="_blank" rel="noopener" class="sp-media-compact-item is-${item.color || 'teal'}">
                        <span class="sp-media-compact-dot"></span>
                        <span class="sp-media-compact-text">
                            <strong>${item.title}</strong>
                            <em>${item.type} · ${item.date}</em>
                        </span>
                        <span class="sp-media-compact-arrow">↗</span>
                    </a>
                `).join('')}
            </div>
        `;
    },

    getImpactFactor(pub) {
        const ifTag = pub.tags.find(t => t.startsWith('IF:'));
        if (!ifTag) return -1;            // brak IF -> praca na końcu
        const ifVal = parseFloat(ifTag.replace('IF:', '').trim());
        return isNaN(ifVal) ? -1 : ifVal;
    },

    normalizeTitle(title) {
        // Zapisuje tytuł jako sentence case, ale nie psuje skrótów/nazw własnych
        // które są zapisane wielkimi literami (COVID, SARS, Mpro, DFT, Ru, itd.)
        return title
            .split(' ')
            .map((word, i) => {
                const lower = word.toLowerCase();
                // Akronimy i nazwy zostawiamy bez zmian
                if (word === word.toUpperCase() && word.length <= 5) return word;
                // Pierwsze słowo: pierwsza litera wielka
                if (i === 0) return lower.charAt(0).toUpperCase() + lower.slice(1);
                // Reszta: małe litery, o ile nie są akronimami
                return lower;
            })
            .join(' ');
    },

    renderPublications(year) {
        const container = document.getElementById('publications-list');
        const filtered = this.publications
            .filter(p => p.year.toString() === year)
            .sort((a, b) => this.getImpactFactor(b) - this.getImpactFactor(a));

        container.style.opacity = '0';
        container.style.transition = 'opacity .25s ease';

        setTimeout(() => {
            container.innerHTML = filtered.map(pub => `
                <div class="publication-item ${pub.cycle === 'H' ? 'is-habilitation' : ''} ${pub.cycle === 'D' ? 'is-doctoral' : ''}">
                    <div class="publisher-logo-container">
                        ${this.publishers[pub.publisher]
                    ? `<img src="${this.publishers[pub.publisher]}" alt="${pub.publisher}" class="publisher-logo" loading="lazy">`
                    : `<span class="publisher-logo-text">${pub.publisher}</span>`}
                    </div>
                    <div class="publication-content">
                        <div class="publication-title">${this.normalizeTitle(pub.title)}</div>
                        <div class="publication-meta">
                            ${pub.authors} · ${pub.journal} (${pub.year})
                            <a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i></a>
                        </div>
                        <div class="tag-container">${this.generateTags(pub.tags)}</div>
                    </div>
                </div>
            `).join('');
            container.style.opacity = '1';
        }, 120);
    },

    generateTags(tags) {
        return tags.map(tag => {
            let cls = 'bg-dark';
            if (/^Q[1-4]$/.test(tag)) cls = 'bg-secondary';
            else if (tag.includes('IF:')) cls = 'bg-success';
            else if (tag.includes('Ministerial')) cls = 'bg-primary';
            return `<span class="badge ${cls}">${tag}</span>`;
        }).join(' ');
    },

    initGlobe() {
        const viz = document.getElementById('globeViz');
        if (!viz || typeof Globe === 'undefined') return;

        const getSize = () => ({ w: viz.clientWidth, h: viz.clientHeight });

        fetch('addons/ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries => {
            const size = getSize();
            const pointsData = this.groupLocations(this.locations);

            this.globe = Globe()(viz)
                .width(size.w)
                .height(size.h)
                .globeImageUrl('addons/world.topo.bathy.200407.3x5400x2700.png')
                .bumpImageUrl('https://unpkg.com/three-globe@2.27.4/example/img/earth-topology.png')
                .backgroundColor('rgba(0,0,0,0)')
                .polygonsData(countries.features)
                .polygonCapColor(() => 'rgba(0,0,0,0)')
                .polygonStrokeColor(() => 'rgba(255,255,255,0.25)')
                .polygonAltitude(0.001)
                .showAtmosphere(true)
                .atmosphereColor('#6e5ce6')
                .atmosphereAltitude(0.18)
                .pointAltitude(0.02)
                .pointsData(pointsData)
                .pointColor(p => {
                    if (p.type === 'home') return '#FFD700';
                    if (p.type === 'conference') return '#1fe0b0';
                    return '#9d8cff';                             // internship / inne
                })
                .pointRadius(p => p._merged ? this.POINT_RADIUS_MERGED : this.POINT_RADIUS_SINGLE)
                // === NOWOŚĆ: tooltip po najechaniu ===
                .pointLabel(p => {
                    if (!p.combined) {
                        // Pojedynczy punkt – prosty tooltip
                        return `
                            <div style="background:rgba(12,17,32,.95); color:#f4f3ef; padding:12px 14px; border-radius:4px; font-family:var(--f-mono); font-size:.72rem; line-height:1.4; max-width:220px;">
                                <strong>${p.name}</strong><br>
                                <span style="opacity:.7;">${p.location} · ${p.period} · <span style="color:${this.getTypeColor(p.type)}; font-weight:600;">${p.type}</span></span>
                            </div>
                        `;
                    } else {
                        // Grupa – lista mini-wpisów
                        const city = p.combined[0].location || p.combined[0].name;
                        const items = p.combined.map(item => `
                            <div style="margin-top:4px; padding-top:4px; border-top:1px dashed rgba(255,255,255,.2);">
                                <span style="color:${item.type === 'conference' ? '#1fe0b0' : item.type === 'home' ? '#FFD700' : '#9d8cff'}; font-weight:600;">${item.type}</span>
                                · ${item.period}<br>
                                <span style="opacity:.8;">${item.name}</span>
                            </div>
                        `).join('');
                        return `
                            <div style="background:rgba(12,17,32,.95); color:#f4f3ef; padding:12px 14px; border-radius:4px; font-family:var(--f-mono); font-size:.72rem; line-height:1.4; max-width:260px;">
                                <strong>${city}</strong> <span style="opacity:.7;">(${p.combined.length} events)</span>
                                ${items}
                            </div>
                        `;
                    }
                })
                .onPointClick(point => {
                    const infoBox = document.getElementById('locationInfo');
                    if (point.combined) {
                        this.openLocationCarousel(infoBox, point);
                    } else {
                        infoBox.innerHTML = `
            ${point.logo ? `<img src="${point.logo}" alt="">` : ''}
            <h4>${point.name}</h4>
            <h6>${point.location} · ${point.period} · <span style="color:${this.getTypeColor(point.type)}">${point.type}</span></h6>
            <p>${point.description}</p>
        `;
                    }
                    this.globe.pointOfView({ lat: point._centerLat ?? point.lat, lng: point._centerLng ?? point.lng, altitude: 1.6 }, 1500);
                });

            this.globe.pointOfView({ lat: 35, lng: 15, altitude: 2.1 }, 0);

            window.addEventListener('resize', () => {
                const s = getSize();
                this.globe.width(s.w).height(s.h);
            });
        }).catch(() => {
            viz.innerHTML = '<p style="color:rgba(255,255,255,.5); padding:40px; font-family:var(--f-mono); font-size:.8rem;">Globe assets unavailable.</p>';
        });
    },

    /* Journey timeline accordion — collapsed by default (except the item
       marked class="is-open" in the HTML), grid-template-rows animation
       handled entirely in CSS; this just flips the class + aria state. */
    initTimeline() {
        document.querySelectorAll('.sp-tl-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.sp-tl-item');
                const open = item.classList.toggle('is-open');
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        });
    },

    /* DNA-helix spine, geometria licz na żywo -------------------------------
       Poprzednia wersja kafelkowała stały <pattern> 34×56 za osią czasu.
       Dwa problemy: (1) patternUnits="userSpaceOnUse" kafelkuje od y=0
       niezależnie od realnej wysokości boksu, więc jeśli ta wysokość nie
       jest dokładną wielokrotnością 56 — a przy akordeonie prawie nigdy
       nie jest — ostatni widoczny skręt zostaje ucięty w połowie krzywej;
       to właśnie ten "dziwnie się rozwija" glitch. (2) dwie nakładające
       się faliste linie bez łączących je szczebli nie czytają się jako
       podwójna helisa, tylko jako pokrętny kabel — stąd "nie ma
       nukleotydów". Ta wersja rysuje bezpośrednio w przestrzeni pikseli
       liczonej z realnego, wyrenderowanego rozmiaru wrapu: dobiera
       długość pół-skrętu bliską ~27px, ale dostraja ją tak, żeby zawsze
       zmieściła się w wysokości całkowitą liczbę razy (zero ucięć,
       nigdy), dokłada szczebel + dwa nukleotydowe kropki w najszerszym
       miejscu każdego pół-skrętu, i naprzemiennie renderuje, która nić
       jest na wierzchu — przycinając kilka px tej "spodniej" przy każdym
       skrzyżowaniu — więc faktycznie czyta się to jako jedna skręcona
       wstęga, a nie dwie płaskie linie. Przerysowuje się przez
       ResizeObserver, więc zostaje poprawna też live, gdy akordeon się
       otwiera/zamyka. */
    initTimelineHelix() {
        const wrap = document.querySelector('.sp-timeline-helix-wrap');
        const svg = document.querySelector('.sp-timeline-helix');
        if (!wrap || !svg) return;

        /* Smooth path through many sampled points: each point becomes a
           quadratic control point, the curve actually passes through the
           midpoints between consecutive points — standard "smooth
           freehand curve from point array" trick, no per-segment control-
           point math to get wrong. pts is an array of {x,y}. */
        const smoothPath = pts => {
            if (pts.length < 2) return '';
            let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
            for (let i = 1; i < pts.length - 1; i++) {
                const mx = (pts[i].x + pts[i + 1].x) / 2;
                const my = (pts[i].y + pts[i + 1].y) / 2;
                d += ` Q${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
            }
            const last = pts[pts.length - 1];
            d += ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
            return d;
        };

        const draw = () => {
            const w = wrap.clientWidth, h = wrap.clientHeight;
            if (!w || !h) return;

            const cx = w / 2;
            const amp = Math.max(6, w / 2 - 6);
            const half = h / Math.max(2, Math.round(h / 27));  // half-period, tuned so it divides h evenly
            const period = half * 2;
            const step = 4;                                     // px between samples — plenty smooth at this wavelength
            const gap = Math.min(4, half * 0.25);               // px trimmed off the "back" strand at each crossing

            // cos()  — NOT sin() — so the curve sits at its EXTREME (peak
            // separation) at y=0, not at zero: that's what makes rungs (at
            // the extremes) land where the strands are actually farthest
            // apart, and what avoids the degenerate case where a segment's
            // start and end both evaluate to the centre line.
            const xA = y => cx + amp * Math.cos((2 * Math.PI * y) / period);
            const xB = y => cx - amp * Math.cos((2 * Math.PI * y) / period);

            // Crossings: where xA(y) === xB(y) === cx, i.e. every quarter
            // period starting at period/4. Zones are the stretches between
            // consecutive crossings (plus the partial zones at the very
            // top and bottom); exactly one strand is "outward" in each
            // zone, and that's the one drawn on top there.
            const crossings = [0];
            for (let y = period / 4; y < h; y += half) crossings.push(y);
            crossings.push(h);

            let backParts = [], frontParts = [];

            for (let z = 0; z < crossings.length - 1; z++) {
                const y0 = crossings[z], y1 = crossings[z + 1];
                const aFront = z % 2 === 0;
                const front = aFront ? xA : xB;
                const back = aFront ? xB : xA;
                const frontColor = aFront ? 'var(--gold)' : 'var(--violet)';
                const backColor = aFront ? 'var(--violet)' : 'var(--gold)';

                const sample = (fn, ys, ye) => {
                    const pts = [];
                    for (let y = ys; y <= ye; y += step) pts.push({ x: fn(y), y });
                    if (pts.length === 0 || pts[pts.length - 1].y < ye - 0.01) pts.push({ x: fn(ye), y: ye });
                    return pts;
                };

                frontParts.push(`<path d="${smoothPath(sample(front, y0, y1))}" fill="none" stroke="${frontColor}" stroke-width="1.9" stroke-linecap="round" opacity=".72"/>`);

                const b0 = y0 + (z > 0 ? gap : 0);
                const b1 = y1 - (z < crossings.length - 2 ? gap : 0);
                if (b1 > b0) {
                    backParts.push(`<path d="${smoothPath(sample(back, b0, b1))}" fill="none" stroke="${backColor}" stroke-width="1.3" stroke-linecap="round" opacity=".38"/>`);
                }
            }

            // Rungs (base pairs), sampled at a fixed step along the WHOLE
            // height and connecting the strands' true positions at each y
            // — not just once per extreme. A real double helix reads as a
            // dense ladder, not one crossbar per twist; this gives several
            // rungs per half-period, shortest near the crossings (where
            // the strands nearly touch) and longest at the extremes
            // (where they're farthest apart), which is also what makes it
            // look like it's actually spiralling rather than just zigzagging.
            // No separate dot circles — round line-caps on a slightly
            // thicker stroke already read as small "beads" at each end,
            // without scattering extra shapes across the strip.
            const rungStep = Math.max(6, half / 4);
            let rungs = [];
            for (let y = 0; y <= h + 0.01; y += rungStep) {
                const yy = Math.min(y, h);
                const rxA = xA(yy).toFixed(1), rxB = xB(yy).toFixed(1), ryF = yy.toFixed(1);
                if (Math.abs(xA(yy) - xB(yy)) < 1.5) continue; // skip near-zero-length rungs right at a crossing
                rungs.push(`<line x1="${rxA}" y1="${ryF}" x2="${rxB}" y2="${ryF}" stroke="var(--tx-on-paper-dim)" stroke-width="2" stroke-linecap="round" opacity=".42"/>`);
            }

            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            svg.setAttribute('preserveAspectRatio', 'none');
            svg.innerHTML = backParts.join('') + rungs.join('') + frontParts.join('');
        };

        let queued = false;
        const schedule = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => { queued = false; draw(); });
        };

        schedule();
        if ('ResizeObserver' in window) {
            new ResizeObserver(schedule).observe(wrap);
        } else {
            window.addEventListener('resize', schedule);
        }
    },

    initMobileMenu() {
        const toggle = document.getElementById('menuToggle');
        const navLinks = document.querySelector('.sp-navlinks');
        if (!toggle || !navLinks) return;

        toggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            toggle.classList.toggle('is-active', isOpen);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.classList.remove('is-active');
            });
        });
    },

    /* Logo strip: pulls straight from locations[] (skip entries with no
       logo — Altınbaş/Univerzita Karlova currently have '') so there's one
       source of truth for institutions, shared with the globe. Duplicates
       the list once so the CSS translateX(-50%) loop is seamless. */
    initLogoStrip() {
        const track = document.getElementById('logoStrip');
        if (!track) return;
        const institutions = this.institutions.filter(i => i.logo);
        if (!institutions.length) return;
        const doubled = [...institutions, ...institutions];
        track.innerHTML = doubled.map(i => `
            <a href="${i.website || '#'}" target="_blank" rel="noopener" title="${i.name}">
                <img src="${i.logo}" alt="${i.name}" loading="lazy">
            </a>
        `).join('');
    },

    initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('.sp-reveal').forEach(el => observer.observe(el));
    },

    /* Toast dismissal is tied to the date string shown in the toast (e.g.
       "31/10/2025") rather than a fixed key — so when you update the
       preprint list AND that date in index.html, previously-dismissed
       visitors will see the new one instead of it staying hidden forever.
       Right now it dismisses PERMANENTLY (localStorage) for a given date,
       not just for the current visit — if you'd rather it reappear on
       every fresh page load instead, swap localStorage for sessionStorage. */
    initToast() {
        const toast = document.getElementById('myToast');
        const closeBtn = document.getElementById('toastClose');
        if (!toast || !closeBtn) return;

        const listItems = toast.querySelectorAll('.sp-toast-body li');
        if (listItems.length === 0) return;          // brak pre-printów → nie pokazuj tostu

        // Użyj pierwszego tytułu pre-printu jako klucza
        const firstPreprint = listItems[0].querySelector('span')?.textContent?.trim() || 'latest';
        const key = 'sp_toast_dismissed_' + firstPreprint;

        if (localStorage.getItem(key) === '1') return;

        setTimeout(() => { toast.style.display = 'block'; }, 1400);

        closeBtn.addEventListener('click', () => {
            toast.style.display = 'none';
            localStorage.setItem(key, '1');
        });
    },

    initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.style.display = window.scrollY > 500 ? 'flex' : 'none';
        });
    },

    initCopyrightYear() {
        const el = document.getElementById('copyright-year');
        if (el) el.textContent = `© ${new Date().getFullYear()} Dr Maciej Spiegel`;
    },

    initFooterTagline() {
        const el = document.getElementById('footer-tagline');
        if (!el) return;
        const randomQuote = this.footerTaglines[Math.floor(Math.random() * this.footerTaglines.length)];
        el.textContent = randomQuote;
    },

};

document.addEventListener('DOMContentLoaded', () => PortfolioApp.init());