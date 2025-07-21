// Animated Team Color Palette logic
document.addEventListener('DOMContentLoaded', function() {
    // Dynamically render dashboard team list from teamData
    function renderDashboardTeams() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) return;
        dashboardGrid.innerHTML = '';

        // Group teams by conference/division
        const conferences = {};
        Object.entries(teamData).forEach(([teamId, team]) => {
            if (!conferences[team.conference]) conferences[team.conference] = {};
            if (!conferences[team.conference][team.division]) conferences[team.conference][team.division] = [];
            conferences[team.conference][team.division].push({ teamId, ...team });
        });

        Object.entries(conferences).forEach(([confName, divisions]) => {
            const confDiv = document.createElement('div');
            confDiv.className = 'conference';
            confDiv.innerHTML = `<div class="conference-header">${confName.toUpperCase()}</div>`;
            Object.entries(divisions).forEach(([divName, teams]) => {
                const divDiv = document.createElement('div');
                divDiv.className = 'division';
                divDiv.innerHTML = `<div class="division-header">${divName}</div>`;
                const teamsList = document.createElement('div');
                teamsList.className = 'teams-list';
                teams.forEach(team => {
                    const teamItem = document.createElement('a');
                    teamItem.href = '#';
                    teamItem.className = 'team-item';
                    teamItem.setAttribute('onclick', `showTeamDetail('${team.teamId}')`);
                    teamItem.innerHTML = `
                        <div class="team-logo">
                            <img src="${team.logo}" alt="${team.name} Logo">
                        </div>
                        <div class="team-name">${team.name}</div>
                    `;
                    teamsList.appendChild(teamItem);
                });
                divDiv.appendChild(teamsList);
                confDiv.appendChild(divDiv);
            });
            dashboardGrid.appendChild(confDiv);
        });
    }

    // Call on load
    renderDashboardTeams();
    const colorHexMap = {
        'navy blue': '#1e3a7a',
        'light blue': '#87ceeb',
        'burgundy': '#800020',
        'gray': '#808080',
        'crimson red': '#dc143c',
        'maroon': '#800000',
        'white': '#ffffff',
        'black': '#000000',
        'azure blue': '#007fff',
        'orange': '#ffa500',
        'forest green': '#228b22',
        'cream': '#f5f5dc',
        'red': '#ff0000',
        'silver': '#c0c0c0',
        'blue': '#0033a0',
        'gold': '#ffd700',
        'dark blue': '#000080',
        'yellow': '#ffff00',
        'ice blue': '#b0e0e6',
        'mint green': '#98fb98',
        'purple': '#800080',
        'dark red': '#8b0000',
        'sand': '#f4a460',
        'tomato red': '#ff6347',
        'turquoise': '#40e0d0',
        'peach pink': '#ffb3ba',
        'green': '#008000',
        'pink': '#ffc0cb',
        'dark green': '#013220',
        'vibrant orange': '#ff4500',
        'dark yellow': '#fede00',
        'teal': '#008080',
        // Custom named colors
        'firebrick': '#AD2224',
        'aero': '#74B7DC',
        'navajo white': '#FFE7A1',
        'dark gold': '#b59410'
    };

    // Debug mode for Color Palette Section
    let debugMode = false;
    let dKeyCount = 0;
    let dKeyTimer = null;

    // Debug indicator bubble logic
    function setDebugIndicator(visible) {
        const indicator = document.getElementById('debug-indicator');
        if (indicator) {
            indicator.style.display = visible ? 'block' : 'none';
        }
    }

    // Debug logo counter logic
    function renderLogoCounter() {
        const totalTeams = Object.keys(teamData).length;
        let logoCount = 0;
        let secondaryLogoCount = 0;
        Object.values(teamData).forEach(team => {
            if (team.logo && team.logo.startsWith('http')) logoCount++;
            if (team.secondaryLogo && team.secondaryLogo.startsWith('http')) secondaryLogoCount++;
        });
        let counterDiv = document.getElementById('logo-counter');
        if (!counterDiv) {
            counterDiv = document.createElement('div');
            counterDiv.id = 'logo-counter';
            counterDiv.style.margin = '1rem 0 0.5rem 0';
            counterDiv.style.fontSize = '1rem';
            counterDiv.style.color = '#444';
            const paletteSection = document.getElementById('color-palette-section');
            if (paletteSection) paletteSection.parentNode.insertBefore(counterDiv, paletteSection.nextSibling);
        }
        counterDiv.textContent = `Logos: ${logoCount}/${totalTeams} | Secondary Logos: ${secondaryLogoCount}/${totalTeams}`;
        counterDiv.style.display = debugMode ? 'block' : 'none';
    }

    function renderTeamColorPaletteList() {
        const paletteList = document.getElementById('color-palette-list');
        if (!paletteList) return;
        paletteList.innerHTML = '';

        // Build a map of hex -> displayName (first encountered name or custom name)
        const hexToCustomName = {
            '#AD2224': 'firebrick',
            '#74B7DC': 'aero',
            '#FFE7A1': 'navajo white',
            '#b59410': 'dark gold',
            '#ffa500': 'orange', // always call #ffa500 orange
            '#A4C62A': 'green-yellow', // always call #A4C62A green-yellow
            '#4F2F6F': 'regalie purple' // always call #4F2F6F regalie purple
        };
        const hexMap = {};
        Object.values(teamData).forEach(team => {
            if (Array.isArray(team.colors)) {
                team.colors.forEach(color => {
                    let hex = colorHexMap[color.toLowerCase()] || colorHexMap[color] || color;
                    if (!hexMap[hex]) {
                        hexMap[hex] = hexToCustomName[hex] || color;
                    }
                });
            }
        });

        // Build colorObjects: unique hexes only
        const colorObjects = Object.entries(hexMap).map(([hex, name]) => ({ name, hex }));

        // Helper: hex to HSL
        function hexToHSL(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            const r = parseInt(hex.substring(0,2), 16) / 255;
            const g = parseInt(hex.substring(2,4), 16) / 255;
            const b = parseInt(hex.substring(4,6), 16) / 255;
            const max = Math.max(r,g,b), min = Math.min(r,g,b);
            let h, s, l = (max+min)/2;
            if(max===min){h=s=0;}else{
                const d = max-min;
                s = l>0.5 ? d/(2-max-min) : d/(max+min);
                switch(max){
                    case r: h=(g-b)/d+(g<b?6:0); break;
                    case g: h=(b-r)/d+2; break;
                    case b: h=(r-g)/d+4; break;
                }
                h /= 6;
            }
            return {h: h*360, s: s*100, l: l*100};
        }

        // Sort by hue, then lightness
        colorObjects.sort((a, b) => {
            const hslA = hexToHSL(a.hex);
            const hslB = hexToHSL(b.hex);
            if (Math.abs(hslA.h - hslB.h) > 2) {
                return hslA.h - hslB.h;
            } else {
                return hslA.l - hslB.l;
            }
        });

        // For each color, find which teams use it and in what role
        function getUsage(displayName, hex) {
            const usageSet = new Set();
            Object.entries(teamData).forEach(([teamId, team]) => {
                if (Array.isArray(team.colors)) {
                    team.colors.forEach((c, idx) => {
                        const cHex = colorHexMap[c.toLowerCase()] || colorHexMap[c] || c;
                        if (cHex.toLowerCase() === hex.toLowerCase()) {
                            const role = ['Primary', 'Secondary', 'Tertiary'][idx] || `Color #${idx+1}`;
                            usageSet.add(`${team.name} (${role})`);
                        }
                    });
                }
            });
            return Array.from(usageSet);
        }

        // Render each color as a row with usage info
        colorObjects.forEach(obj => {
            const colorRow = document.createElement('div');
            colorRow.style.display = 'flex';
            colorRow.style.alignItems = 'center';
            colorRow.style.gap = '0.75rem';
            colorRow.style.marginBottom = '0.5rem';

            const circle = document.createElement('div');
            circle.style.width = '36px';
            circle.style.height = '36px';
            circle.style.borderRadius = '50%';
            circle.style.border = '2px solid #ccc';
            circle.style.background = obj.hex;
            circle.style.flexShrink = '0';

            const info = document.createElement('div');
            info.innerHTML = `<span style="font-weight:500;">${obj.name}</span> <span style="font-family:monospace;">${obj.hex}</span>`;

            // Usage summary
            const usage = getUsage(obj.name, obj.hex);
            if (usage.length) {
                const usageDiv = document.createElement('div');
                usageDiv.style.fontSize = '0.95rem';
                usageDiv.style.color = '#555';
                usageDiv.style.marginLeft = '0.5rem';
                usageDiv.textContent = `Used by: ${usage.join(', ')}`;
                info.appendChild(document.createElement('br'));
                info.appendChild(usageDiv);
            }

            colorRow.appendChild(circle);
            colorRow.appendChild(info);
            paletteList.appendChild(colorRow);
        });

        // After rendering palette, update logo counter
        renderLogoCounter();
    }

    // Hide palette by default
    function setPaletteVisibility(visible) {
        const paletteSection = document.getElementById('color-palette-section');
        if (paletteSection) {
            paletteSection.style.display = visible ? 'block' : 'none';
        }
        // Show/hide logo counter in sync with debug mode
        const counterDiv = document.getElementById('logo-counter');
        if (counterDiv) counterDiv.style.display = visible ? 'block' : 'none';
    }
    setPaletteVisibility(false); // Hide on load

    // Listen for triple "D" keypress to toggle debug mode
    document.addEventListener('keydown', function(e) {
        if (e.key && e.key.toLowerCase() === 'd') {
            dKeyCount++;
            if (dKeyTimer) clearTimeout(dKeyTimer);
            dKeyTimer = setTimeout(() => { dKeyCount = 0; }, 1000);
            if (dKeyCount === 3) {
                debugMode = !debugMode;
                setPaletteVisibility(debugMode);
                setDebugIndicator(debugMode);
                if (debugMode) {
                    renderTeamColorPaletteList();
                } else {
                    // Hide logo counter if debug mode is off
                    const counterDiv = document.getElementById('logo-counter');
                    if (counterDiv) counterDiv.style.display = 'none';
                }
                dKeyCount = 0;
            }
        } else {
            dKeyCount = 0;
        }
    });
});
const teamData = {
            'genoa-mariners': {
                name: 'Genoa Mariners',
                logo: 'https://i.postimg.cc/sDZKQGLg/Chat-GPT-Image-15-lug-2025-10-21-30.png',
                secondaryLogo: 'https://i.postimg.cc/0yKjT4B0/genoa-sec.png',
                conference: 'Alpine Conference',
                division: 'Northwest Division',
                population: '1.2M',
                stadium: '12,000',
                colors: ['navy blue', 'light blue', 'white'],
                story: "Named for Genoa's legendary maritime republic, the Mariners honor a city that ruled the seas for centuries. Its sailors and explorers helped shape Mediterranean trade, making this name a tribute to Genoa's seafaring legacy."
            },
            'casale-hawks': {
                name: 'Casale Hawks',
                logo: 'https://i.postimg.cc/66v1FyFV/Chat-GPT-Image-11-lug-2025-22-32-19.png',
                secondaryLogo: 'https://i.postimg.cc/Z5QC9xHJ/casale-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northwest Division',
                population: '0.1M',
                stadium: '7,000',
                colors: ['burgundy', 'gray', 'crimson red'],
                story: "Casale Monferrato's history as a strategic fortress city inspired the hawk—an emblem of vigilance and dominance. Just as hawks patrol open skies, Casale once guarded the Po Valley crossroads with precision and strength."
            },
            'turin-bulls': {
                name: 'Turin Bulls',
                logo: 'https://i.postimg.cc/76pchBKf/Chat-GPT-Image-4-lug-2025-21-34-02-1.png',
                secondaryLogo: 'https://i.postimg.cc/6ptLc1xH/turin-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northwest Division',
                population: '2M',
                stadium: '22,000',
                colors: ['maroon', 'white', 'black'],
                story: "The bull (toro) is Turin's historic symbol, displayed proudly on the city's coat of arms since the Middle Ages. It reflects resilience and power, echoing the city's role as an industrial and cultural stronghold of Northern Italy."
            },
            'cantu-kings': {
                name: 'Cantù Kings',
                logo: 'https://i.postimg.cc/zX9XJ6sc/Chat-GPT-Image-15-lug-2025-10-14-57.png',
                secondaryLogo: 'https://i.postimg.cc/7hLcm98J/cant-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northwest Division',
                population: '0.2M',
                stadium: '13,000',
                colors: ['dark blue', '#ffa500', 'white'], // dark blue, orange, white
                story: "Cantù is one of Italy's basketball birthplaces, with a record of championships that shaped the sport nationally. \"Kings\" acknowledges this enduring dynasty and the city's unmatched influence on Italian basketball history."
            },
            'trento-bears': {
                name: 'Trento Bears',
                logo: 'https://i.postimg.cc/W41xHqDb/2548a518-462c-42a1-957d-6193febfca66-1.png',
                secondaryLogo: 'https://i.postimg.cc/QN6vV21Q/trento-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northwest Division',
                population: '0.3M',
                stadium: '8,000',
                colors: ['dark green', 'cream', 'black'], // swapped secondary and tertiary
                story: "Nestled in the Dolomites, Trento has long been associated with Alpine wildlife, including the brown bear. This symbol connects the team to the region's rugged mountains and traditions of strength and endurance."
            },
            'olimpia-milan': {
                name: 'Olimpia Milan',
                logo: 'https://i.postimg.cc/9Qw9DQzf/Olimpia-Milano-logo-2019.png',
                conference: 'Alpine Conference',
                division: 'Lombard Division',
                population: '4.3M',
                stadium: '25,000',
                colors: ['red', 'white', 'silver'],
                story: "A direct heir to Italy's most decorated basketball club, the name carries the legacy of Olympian ideals: excellence, tradition, and victory. Milan's basketball heritage makes this a timeless identity."
            },
            'inter-milan-vipers': {
                name: 'Inter Milan Vipers',
                logo: 'https://i.postimg.cc/NM9Y3Qwy/Logo-Inter-Milan-Vipers-1.png',
                conference: 'Alpine Conference',
                division: 'Lombard Division',
                population: '4.3M',
                stadium: '25,000',
                colors: ['blue', 'black', '#b59410'], // dark gold
                story: "Inspired by the serpent (biscione)—the iconic emblem of Milanese heraldry and Inter's football crest—the Vipers represent agility and striking precision, rooted in centuries-old local symbolism."
            },
            'brescia-warriors': {
                secondaryLogo: 'https://i.postimg.cc/7hLcm98J/cant-secondary.png',
                name: 'Brescia Warriors',
                logo: 'https://i.postimg.cc/VsF4jcf3/Chat-GPT-Image-15-lug-2025-09-59-28-1.png',
                secondaryLogo: 'https://i.postimg.cc/cL3z96jh/brescia-secondary.png',
                conference: 'Alpine Conference',
                division: 'Lombard Division',
                population: '0.6M',
                stadium: '11,000',
                colors: ['#74B7DC', 'white', '#0033a0'], // aero, white, blue
                story: "Brescia's emblem is the Vittoria Alata (Winged Victory), a Roman statue symbolizing triumph. \"Warriors\" reflects the city's ancient martial spirit and its resilience through centuries of battles and rebirth."
            },
            'cremona-rhinos': {
                name: 'Cremona Rhinos',
                logo: 'https://i.postimg.cc/2SD6nLN0/20250711-2239-Cremona-Rhinos-Logo-remix-01jzxkbdf9eghrfejmasf42n7v.png',
                secondaryLogo: 'https://i.postimg.cc/PqGgT1Z0/cremona-secondary.png',
                conference: 'Alpine Conference',
                division: 'Lombard Division',
                population: '0.3M',
                stadium: '8,000',
                colors: ['navy blue', 'orange', 'white'], // navy blue, orange, white
                story: "Cremona stands for power and craftsmanship, from its medieval strongholds to its renowned luthiers. The rhinoceros, an image of unstoppable strength, mirrors the city's enduring character in Lombardy's heartland."
            },
            'varese-falcons': {
                name: 'Varese Falcons',
                logo: 'https://i.postimg.cc/pV3x5CmQ/Chat-GPT-Image-4-lug-2025-21-32-02-1.png',
                secondaryLogo: 'https://i.ibb.co/VpJNw8QZ/varese-secondary.png',
                conference: 'Alpine Conference',
                division: 'Lombard Division',
                population: '0.6M',
                stadium: '11,000',
                colors: ['#AD2224', 'white', 'black'], // firebrick
                story: "Varese's position near the lakes and Alpine foothills evokes the falcon—fast, sharp, and dominant in flight. The name recalls the city's golden age in basketball, when Varese soared to European glory."
            },
            'venice-lions': {
                name: 'Venice Lions',
                logo: 'https://i.postimg.cc/QNz0dJ0z/Chat-GPT-Image-15-lug-2025-10-26-57.png',
                secondaryLogo: 'https://i.postimg.cc/Vvz6yGfW/venice-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northeast Division',
                population: '0.9M',
                stadium: '11,000',
                colors: ['burgundy', 'gold', 'black'],
                story: "The lion of Saint Mark, symbol of the Venetian Republic, stands as one of Italy's most iconic emblems. Once a maritime power, Venice projects pride and grandeur—a heritage embodied in this team's name."
            },
            'verona-scorpions': {
                name: 'Verona Scorpions',
                logo: 'https://i.postimg.cc/k5YL3M8N/5d96de2a-ebba-4dfa-b5df-4914f85872bb-1.png',
                secondaryLogo: 'https://i.postimg.cc/vTSKjnbq/verona-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northeast Division',
                population: '1.3M',
                stadium: '12,000',
                colors: ['blue', 'dark yellow', 'white', 'black'],
                story: "Verona's medieval walls and strategic location on ancient trade routes inspired the scorpion—a creature both defensive and lethal. It reflects the city's historic role as a fortress guarding Northern Italy."
            },
            'treviso-serpents': {
                name: 'Treviso Serpents',
                logo: 'https://i.postimg.cc/nhk62GhP/20250704-2110-Treviso-Serpents-Logo-remix-01jzbdfxb3ebyvajferzxv79nj-1.png',
                secondaryLogo: 'https://i.postimg.cc/ZR4XyZwc/treviso-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northeast Division',
                population: '1M',
                stadium: '10,000',
                colors: ['ice blue', 'gray', 'orange'],
                story: "Treviso's ties to Venetian rule and Renaissance art echo in the serpent motif, long a symbol of cunning and resilience in northern heraldry. The name reflects the city's elegant yet dangerous edge."
            },
            'padua-archers': {
                name: 'Padua Archers',
                logo: 'https://i.postimg.cc/9XszFN85/Chat-GPT-Image-11-lug-2025-22-39-34.png',
                secondaryLogo: 'https://i.postimg.cc/Yq0K3rMD/padua-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northeast Division',
                population: '1.2M',
                stadium: '8,000',
                colors: ['forest green', 'gold', 'white'],
                story: "Home to one of Europe's oldest universities and a tradition of independence, Padua evokes precision and intellect—qualities mirrored in the archer. The name recalls the city's medieval militias and tactical spirit."
            },
            'trieste-tritons': {
                name: 'Trieste Tritons',
                logo: 'https://i.postimg.cc/Hk43YDJY/20250704-2116-Trieste-Tritons-Logo-remix-01jzbdt7xxfe3re43p5gxq68x6-1.png',
                secondaryLogo: 'https://i.ibb.co/GfDzN9Nq/trieste-secondary.png',
                conference: 'Alpine Conference',
                division: 'Northeast Division',
                population: '0.5M',
                stadium: '15,000',
                colors: ['firebrick', 'white', 'red'],
                story: "As a major Adriatic port, Trieste blends maritime history with myth. Tritons—sea gods of ancient lore—represent the city's seafaring roots and its unique role as a gateway between Italy and Central Europe."
            },
            'florence-lilies': {
                name: 'Florence Lilies',
                logo: 'https://i.postimg.cc/9XwH29LD/assets-task-01jzbeavdnejhb4befpdg7y6nz-1751657132-img-1.png',
                secondaryLogo: 'https://i.postimg.cc/k4szQZZd/florence-secondary.png',
                conference: 'Mediterranean Conference',
                division: 'Apennine Division',
                population: '1.3M',
                stadium: '16,000',
                colors: ['#4F2F6F', '#FFE7A1', 'red'], // regalie purple
                story: "The lily (giglio) has been Florence's emblem since the Middle Ages, symbolizing the city's artistic and cultural supremacy during the Renaissance. It remains a proud icon of Florentine heritage."
            },
            'virtus-bologna': {
                name: 'Virtus Bologna',
                logo: 'https://i.postimg.cc/Tw0LzyNt/Virtus-Bologna-Logo.png',
                conference: 'Mediterranean Conference',
                division: 'Apennine Division',
                population: '1.3M',
                stadium: '20,000',
                colors: ['black', 'white', 'gold'],
                story: "Virtus Bologna carries a name synonymous with excellence and integrity since its founding in 1929. It reflects Bologna's historic passion for basketball and its intellectual legacy as Italy's oldest university city."
            },
            'fortitudo-bologna': {
                name: 'Fortitudo Bologna',
                logo: 'https://i.postimg.cc/Dz39BTJM/Bologna-Fortitudo-2.png',
                secondaryLogo: 'https://i.postimg.cc/13FxGttF/Bologna-Fortitudo.png',
                conference: 'Mediterranean Conference',
                division: 'Apennine Division',
                population: '1.3M',
                stadium: '13,000',
                colors: ['blue', 'white'],
                story: "The name Fortitudo (Latin for \"strength\") reflects Bologna's grit and fierce loyalty. Born from the city's working-class roots, this club has long embodied resilience on and off the court."
            },
            'forli-wolves': {
                name: 'Forlì Wolves',
                logo: 'https://i.postimg.cc/pXm3Ws9j/Chat-GPT-Image-11-lug-2025-22-26-48.png',
                secondaryLogo: 'https://i.postimg.cc/ZnK23pYL/forl-secondary.png',
                conference: 'Mediterranean Conference',
                division: 'Apennine Division',
                population: '0.3M',
                stadium: '12,000',
                colors: ['maroon', 'white', 'sand'],
                story: "Forlì's symbol, the wolf, is tied to its Roman origins and the myth of Romulus and Remus. It honors strength and unity—values deeply embedded in the city's identity."
            },
            'reggio-stallions': {
                name: 'Reggio Stallions',
                logo: 'https://i.postimg.cc/Sx390NB8/20250711-2232-Reggio-Stallions-Basketball-Logo-remix-01jzxjzj78fess7g6ee72qysnz.png',
                conference: 'Mediterranean Conference',
                division: 'Apennine Division',
                population: '0.5M',
                stadium: '9,000',
                colors: ['#AD2224', 'black', 'tomato red'],
                story: "Reggio Emilia is famed for its equestrian traditions and Renaissance heritage. The stallion, a symbol of speed and grace, represents the city's energy and pride."
            },
            'roma-virtus': {
                name: 'Roma Virtus',
                logo: 'https://i.postimg.cc/25732hN9/Virtus-Roma-1960-logo.png',
                secondaryLogo: 'https://i.postimg.cc/RVNytgLj/roma-secondary.png',
                conference: 'Mediterranean Conference',
                division: 'Roman Division',
                population: '4.3M',
                stadium: '21,000',
                colors: ['burgundy', 'gold', 'white'],
                story: "Rome's basketball identity draws on the eternal city's grandeur. The name Virtus honors classical ideals of courage and excellence, echoing Rome's monumental history."
            },
            'pescara-dolphins': {
                name: 'Pescara Dolphins',
                logo: 'https://i.postimg.cc/jSPqCvKd/Chat-GPT-Image-15-lug-2025-10-04-41.png',
                secondaryLogo: 'https://i.postimg.cc/R04nLsYS/IMG-4154.png',
                conference: 'Mediterranean Conference',
                division: 'Roman Division',
                population: '0.5M',
                stadium: '13,000',
                colors: ['turquoise', 'peach pink', 'white'],
                story: "The dolphin is a traditional symbol of Pescara and the Adriatic Sea. It reflects the city's maritime roots and modern energy as a vibrant coastal hub."
            },
            'siena-mens-sana': {
                name: 'Siena Mens Sana',
                logo: 'https://i.postimg.cc/C1skwr5H/logo-sfondo-mens-sana-new-01.png',
                conference: 'Mediterranean Conference',
                division: 'Roman Division',
                population: '0.3M',
                stadium: '20,000',
                colors: ['green', 'white', 'forest green'],
                story: "Mens Sana, Latin for \"healthy mind,\" echoes Siena's humanist heritage. This historic name is tied to one of Italy's most storied basketball legacies, rooted in Tuscan tradition."
            },
            'pesaro-victoria-libertas': {
                name: 'Pesaro Victoria Libertas',
                logo: 'https://i.postimg.cc/t4246y38/Logo-Victoria-Libertas-Pallacanestro-2019.png',
                conference: 'Mediterranean Conference',
                division: 'Roman Division',
                population: '0.3M',
                stadium: '18,000',
                colors: ['red', 'white', 'pink'],
                story: "Founded on ideals of liberty and victory, Victoria Libertas is a name steeped in tradition. Pesaro's Adriatic identity makes this team a cultural cornerstone of Italian basketball."
            },
            'sassari-dinamo': {
                name: 'Sassari Dinamo',
                logo: 'https://i.postimg.cc/RF0CdYRq/Logo-Dinamo-Sassari.png',
                conference: 'Mediterranean Conference',
                division: 'Roman Division',
                population: '0.3M',
                stadium: '25,000',
                colors: ['blue', 'white'],
                story: "Dinamo Sassari stands for energy and resilience, mirroring Sardinia's spirit. Its rise from a local club to a national power reflects the island's pride and ambition."
            },
            'bari-roosters': {
                name: 'Bari Roosters',
                logo: 'https://i.postimg.cc/Y0sVNWPj/20250711-2227-Bari-Roosters-Basketball-Logo-remix-01jzxjp77je6x822y50s88zp6v.png',
                secondaryLogo: 'https://i.postimg.cc/XJfJzSbv/bari-secondary.png',
                conference: 'Mediterranean Conference',
                division: 'South Division',
                population: '1.2M',
                stadium: '10,000',
                colors: ['red', 'white', 'black'],
                story: "The rooster, long a rural symbol of Puglia, signifies vigilance and pride. Bari's Mediterranean culture gives this emblem a strong local identity."
            },
            'avellino-jackals': {
                name: 'Avellino Jackals',
                logo: 'https://i.postimg.cc/kGG836gQ/Chat-GPT-Image-11-lug-2025-22-47-10.png',
                secondaryLogo: 'https://i.postimg.cc/j5tjJSdM/avellino-sec.png',
                conference: 'Mediterranean Conference',
                division: 'South Division',
                population: '0.3M',
                stadium: '10,000',
                colors: ['green', 'gray', 'white'],
                story: "The jackal evokes adaptability and cunning, qualities tied to Avellino's mountainous Irpinia region. The name celebrates resilience in the face of challenges."
            },
            'palermo-panthers': {
                name: 'Palermo Panthers',
                logo: 'https://i.postimg.cc/BvRHhc87/Palermo-3.png',
                secondaryLogo: 'https://i.postimg.cc/8PY8X2Cp/palermo-secondary.png',
                conference: 'Mediterranean Conference',
                division: 'South Division',
                population: '1.2M',
                stadium: '13,000',
                colors: ['pink', 'black'],
                story: "Pink and black echo Palermo's football tradition, while the panther reflects strength and elegance. This emblem honors Sicily's fierce and vibrant character."
            },
            'catania-elephants': {
                name: 'Catania Elephants',
                logo: 'https://i.postimg.cc/pdmKY1dn/Catania-3.png',
                secondaryLogo: 'https://i.postimg.cc/bwS77mGQ/catania-secondary.png',
                conference: 'Mediterranean Conference',
                division: 'South Division',
                population: '0.9M',
                stadium: '10,000',
                colors: ['light blue', 'red', 'white'],
                story: "Catania's historic symbol is the elephant (u Liotru), seen in the city's main square. It represents endurance and protection, linking the team to deep-rooted Sicilian heritage."
            },
            'napoli-heatwaves': {
                name: 'Napoli Heatwaves',
                logo: 'https://i.postimg.cc/pVGgMwdx/Chat-GPT-Image-11-lug-2025-22-26-56.png',
                secondaryLogo: 'https://i.postimg.cc/nzbr2VN5/napoli-secondary.png',
                conference: 'Mediterranean Conference',
                division: 'South Division',
                population: '3.0M',
                stadium: '13,000',
                colors: ['light blue', 'navy blue', 'white', 'red'],
                story: "Naples vibrates with volcanic energy from Vesuvius to the Mediterranean coast. The name \"Heatwaves\" captures this explosive vitality and the city's fiery passion for sport."
            }
        };

        // Add parallax scrolling effect
// Parallax effect fully disabled
function initParallax() {
    // No-op: disables all scroll-based animations
    return () => {};
}

        // Initialize parallax when team detail is shown
        let parallaxCleanup = null;

        function showTeamDetail(teamId) {
            const team = teamData[teamId];
            if (!team) {
                console.log('Team not found:', teamId);
                return;
            }

            // Start fade out animation for dashboard
            const dashboardView = document.getElementById('dashboard-view');
            dashboardView.classList.add('fade-out');

            // Wait for fade out, then switch to team detail
            setTimeout(() => {
                // Always scroll to top when showing team detail
                window.scrollTo(0, 0);
                console.log(`Team data check - ${team.name}:`);
                console.log(`Primary logo: ${team.logo}`);
                console.log(`Secondary logo: ${team.secondaryLogo || 'none'}`);
                
                // Update header
                const detailLogo = document.getElementById('detail-logo');
                
                // Always use PRIMARY logo in detail page
                const logoToUse = team.logo;
                
                if (logoToUse && logoToUse.startsWith('http')) {
                    detailLogo.innerHTML = `<img src="${logoToUse}" alt="${team.name} Logo">`;
                } else {
                    detailLogo.textContent = logoToUse || '--';
                }
                
                document.getElementById('detail-name').textContent = team.name;
                
                // Update team information
                document.getElementById('detail-conference').textContent = team.conference || 'TBD';
                document.getElementById('detail-division').textContent = team.division || 'TBD';
                document.getElementById('detail-population').textContent = team.population || 'TBD';
                document.getElementById('detail-stadium').textContent = team.stadium || 'TBD';
                
                // Update team story
                document.getElementById('detail-story').textContent = team.story || 'Team history and background will be displayed here...';
                    
                    // Update Team Branding section (Logo Gallery) for every team
                    const brandingPrimary = document.getElementById('branding-primary-logo');
                    const brandingSecondary = document.getElementById('branding-secondary-logo');
                    // Primary Logo
                    if (team.logo && team.logo.startsWith('http')) {
                        brandingPrimary.innerHTML = `<img src="${team.logo}" alt="Primary Logo">`;
                    } else {
                        brandingPrimary.textContent = team.logo || '--';
                    }
                    // Secondary Logo
                    if (team.secondaryLogo && team.secondaryLogo.startsWith('http')) {
                        brandingSecondary.innerHTML = `<img src="${team.secondaryLogo}" alt="Secondary Logo">`;
                    } else {
                        brandingSecondary.textContent = team.secondaryLogo || '--';
                    }

                    // Team Colors (up to three)
                    const colorBoxes = [
                        document.getElementById('branding-color-1'),
                        document.getElementById('branding-color-2'),
                        document.getElementById('branding-color-3')
                    ];
                    // Color name to hex mapping
                    const colorHexMap = {
                        'navy blue': '#1e3a7a',
                        'light blue': '#87ceeb',
                        'burgundy': '#800020',
                        'gray': '#808080',
                        'crimson red': '#dc143c',
                        'maroon': '#800000',
                        'white': '#ffffff',
                        'black': '#000000',
                        'azure blue': '#007fff',
                        'orange': '#ffa500',
                        'forest green': '#228b22',
                        'cream': '#f5f5dc',
                        'red': '#ff0000',
                        'silver': '#c0c0c0',
                        'blue': '#0033a0',
                        'gold': '#ffd700',
                        'dark blue': '#000080',
                        'yellow': '#ffff00',
                        'ice blue': '#b0e0e6',
                        'mint green': '#98fb98',
        'purple': '#800080',
        'regalie purple': '#4F2F6F',
        '#4F2F6F': '#4F2F6F',
                        'dark red': '#8b0000',
                        'sand': '#f4a460',
                        'tomato red': '#ff6347',
                        'turquoise': '#40e0d0',
                        'peach pink': '#ffb3ba',
                        'green': '#008000',
                        'pink': '#ffc0cb',
                        'dark green': '#013220',
                        'vibrant orange': '#ff4500',
                        'dark yellow': '#fede00',
                        'teal': '#008080'
                    };
                    let colors = team.colors || [];
                    for (let i = 0; i < 3; i++) {
                        if (colors[i]) {
                            let hex = colorHexMap[colors[i].toLowerCase()] || colors[i];
                            colorBoxes[i].setAttribute('data-color', 'true');
                            colorBoxes[i].style.setProperty('--branding-color', hex);
                            colorBoxes[i].textContent = '';
                        } else {
                            colorBoxes[i].removeAttribute('data-color');
                            colorBoxes[i].style.removeProperty('--branding-color');
                            colorBoxes[i].textContent = '';
                        }
                    }

                // Update color palette and hover effects
                if (team.colors && team.colors.length > 0) {
                    const colorMap = {
                        'navy blue': '#1e3a7a',
                        'light blue': '#87ceeb',
                        'burgundy': '#800020',
                        'gray': '#808080',
                        'crimson red': '#dc143c',
                        'maroon': '#800000',
                        'white': '#ffffff',
                        'black': '#000000',
                        'azure blue': '#007fff',
                        'orange': '#ffa500',
                        'forest green': '#228b22',
                        'cream': '#f5f5dc',
                        'red': '#ff0000',
                        'silver': '#c0c0c0',
                        'blue': '#0033a0',
                        'gold': '#ffd700',
                        'dark blue': '#000080',
                        'yellow': '#ffff00',
                        'ice blue': '#b0e0e6',
                        'mint green': '#98fb98',
                        'purple': '#800080',
                        'dark red': '#8b0000',
                        'sand': '#f4a460',
                        'tomato red': '#ff6347',
                        'turquoise': '#40e0d0',
                        'peach pink': '#ffb3ba',
                        'green': '#008000',
                        'pink': '#ffc0cb',
                        'dark green': '#013220',
                        'vibrant orange': '#ff4500',
                        'dark yellow': '#fede00'
                    };

                    // Set main color
                    const mainColor = colorMap[team.colors[0]] || team.colors[0] || '#666666';
                    const secondaryColor = colorMap[team.colors[1]] || team.colors[1] || '#cccccc';

                    document.getElementById('main-color').style.backgroundColor = mainColor;

                    // Set team name color to main color (auto updates)
                    document.getElementById('detail-name').style.color = mainColor;

                    // Set left border of all detail items to main color (auto updates)
                    document.querySelectorAll('.team-detail .detail-item').forEach(item => {
                        item.style.borderLeftColor = mainColor;
                    });

                    // Remove background for logo section, always transparent
                    const teamHeader = document.getElementById('team-header');
                    teamHeader.style.background = 'transparent';

                    // Set secondary colors
                    const secColors = ['sec-color-1', 'sec-color-2', 'sec-color-3'];
                    secColors.forEach((colorId, index) => {
                        const colorElement = document.getElementById(colorId);
                        if (team.colors[index + 1]) {
                            colorElement.style.backgroundColor = colorMap[team.colors[index + 1]] || team.colors[index + 1] || '#666666';
                            colorElement.style.display = 'block';
                        } else {
                            colorElement.style.display = 'none';
                        }
                    });

                    // Remove any existing dynamic styles
                    const existingStyles = document.querySelectorAll('style[data-team-style]');
                    existingStyles.forEach(style => style.remove());
                }

                // Hide dashboard and show team detail with slide animation
                dashboardView.style.display = 'none';
                dashboardView.classList.remove('fade-out');
                
                // Hide download section on team detail view
                const downloadSection = document.getElementById('download-section');
                if (downloadSection) downloadSection.style.display = 'none';
                
                const teamDetail = document.getElementById('team-detail');
                teamDetail.classList.add('active', 'slide-in');
                
                // Initialize parallax effect
                setTimeout(() => {
                    if (parallaxCleanup) parallaxCleanup();
                    parallaxCleanup = initParallax();
                    console.log('Parallax initialized'); // Debug log
                }, 300);
                
                // Clean up animation class after animation completes
                setTimeout(() => {
                    teamDetail.classList.remove('slide-in');
                }, 600);
                
            }, 250); // Wait for fade out to complete
        }

        function showDashboard() {
            const teamDetail = document.getElementById('team-detail');
            const dashboardView = document.getElementById('dashboard-view');
            
            // Clean up parallax effect
            if (parallaxCleanup) {
                parallaxCleanup();
                parallaxCleanup = null;
            }
            
            // Start slide out animation for team detail
            teamDetail.style.animation = 'slideOutToLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            
            setTimeout(() => {
                // Hide team detail and show dashboard
                teamDetail.classList.remove('active');
                teamDetail.style.animation = '';
                dashboardView.style.display = 'block';
                
                // Show download section on dashboard view
                const downloadSection = document.getElementById('download-section');
                if (downloadSection) downloadSection.style.display = 'block';
                
                // Trigger slide in animation for dashboard
                setTimeout(() => {
                    dashboardView.style.opacity = '1';
                    dashboardView.style.transform = 'translateX(0)';
                }, 50);
            }, 200);
        }

        // Add click event to prevent default link behavior
        document.addEventListener('click', function(e) {
            if (e.target.closest('.team-item')) {
                e.preventDefault();
            }
        });