/* ---------- KONFIGURACJA ---------- */
const SPREADSHEET_ID = "1WeR2J62zroTUDGRFnd-Z4bQe196XiP7Kt1Rd_P3SR3M";
const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbzZODt27LuaMQCoKR7JKxutDdh-jnJ1J9L2ENUJPcKrv7jpvXFtc53Cl-e7DpPTI77X/exec"; // <-- wklej URL web app po wdrożeniu Apps Script

const sheetLinks = {
    "01": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=1901112775&single=true&output=csv",
    "02": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=761522376&single=true&output=csv",
    "03": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=427047031&single=true&output=csv",
    "04": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=1456994350&single=true&output=csv",
    "05": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=605689359&single=true&output=csv",
    "06": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=1218108803&single=true&output=csv",
    "07": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=975199346&single=true&output=csv",
    "08": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=878375304&single=true&output=csv",
    "09": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=1634226018&single=true&output=csv",
    "10": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=954794309&single=true&output=csv",
    "11": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=930192024&single=true&output=csv",
    "12": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-WCr3FsRxVvSIPLpvielgaKj1npAQjPq0ow_cPCmMntNN2FeXbqxn1ZuXrQ3fKOWjKO9y8--6_DHX/pub?gid=1626189679&single=true&output=csv"
};

const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
const logoUrl = "logo.png";
let currentViewMonth = String(new Date().getMonth() + 1).padStart(2, '0');

/* ---------- PARSER CSV (bez zmian) ---------- */
function parseCSVLine(line) {
    const result = [];
    let cur = "";
    let inQuote = false;
    const sep = line.includes(';') ? ';' : ',';
    for (let i = 0; i < line.length; i++) {
        let char = line[i];
        if (char === '"') inQuote = !inQuote;
        else if (char === sep && !inQuote) { result.push(cur.trim()); cur = ""; }
        else cur += char;
    }
    result.push(cur.trim());
    return result.map(cell => cell.replace(/^"(.*)"$/, '$1'));
}

/* ---------- LOAD DATA I RENDER TABELI (zmodyfikowane minimalnie) ---------- */
async function loadData() {
    const url = sheetLinks[currentViewMonth];
    try {
        const res = await fetch(url);
        const rawData = await res.text();
        const rows = rawData.split(/\r?\n/).filter(line => line.trim() !== "").map(parseCSVLine);

        const now = new Date();
        const isAlarmTime = (now.getHours() > 15) || (now.getHours() === 15 && now.getMinutes() >= 30);
        const todayCSV = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        const realMonth = String(now.getMonth() + 1).padStart(2, '0');
        const isCurrentMonthViewed = (currentViewMonth === realMonth);

        let html = "<table>";
        html += `<colgroup><col style="width: 100px;"><col style="width: 130px;"><col style="width: auto;"><col style="width: auto;"><col style="width: auto;"><col style="width: auto;"></colgroup>`;
        
        let weekCounter = 0;
        rows.forEach((row, i) => {
            if (i > 1 && row[0] && row[0].toLowerCase().includes("poniedziałek")) weekCounter++;
            const weekClass = weekCounter % 2 === 0 ? "week-even" : "week-odd";
            const isToday = row[1] && row[1].trim() === todayCSV;
            const todayRowClass = isToday ? " today-row" : "";

            html += `<tr data-csv-row="${i}" class="${weekClass}${todayRowClass}">`;
            row.forEach((cell, j) => {
                if (j > 5) return; 

                if (i === 0) {
                    if (j === 0) html += `<th class="logo-space" rowspan="2" colspan="2" id="main-logo-container"></th>`;
                    else if (j > 1) {
                        const nameColors = ["", "", "#38bdf8", "#818cf8", "#fbbf24", "#f472b6"];
                        html += `<th style="color: ${nameColors[j]}; font-size: 2.2vh; font-weight: bold;">${cell}</th>`;
                    } else if (j === 1) {
                        // pusta komórka nagłówka dla daty
                        html += `<th></th>`;
                    }
                } 
                else if (i === 1) {
                    if (j > 1) html += `<th style="color: #64748b; font-size: 1.4vh; font-weight: normal;">${cell}</th>`;
                    else if (j === 0) html += `<th></th>`;
                    else if (j === 1) html += `<th></th>`;
                } 
                else {
                    let className = (j === 0) ? "day" : (j === 1) ? "date" : "tech-data";
                    let content = (j === 0) ? shortenDay(cell) : (j === 1) ? shortenDate(cell) : cell;
                    
                    let inlineStyle = ""; 
                    let specialClass = "";
                    const cellText = cell.toLowerCase();

                    const rowDatePart = row[1] ? row[1].split("-") : null;
                    const rowMonth = rowDatePart ? rowDatePart[1] : null; 
                    const isCellInSelectedMonth = (rowMonth === currentViewMonth);

                    if (j > 1) {
                        if (!isCellInSelectedMonth) {
                            inlineStyle = "color: #64748b;";
                        } else {
                            if (cellText.includes("8-16") && isToday && isAlarmTime) {
                                specialClass = " alarm-pulse";
                            }
                            
                            if (cellText.includes("8-16")) {
                                content = content.replace(/8-16/i, '<span class="neon-blue-text">8-16</span>');
                            } else if (cellText.includes("parking") || cellText.includes("8:00")) {
                                inlineStyle = "color: #64748b;";
                            }
                        }
                    } else {
                        if (!isCellInSelectedMonth) inlineStyle = "color: #475569;"; 
                    }
                    
                    html += `<td class="${className}${specialClass}" data-csv-col="${j}">
                                <div class="marquee-box">
                                    <span style="${inlineStyle}">${content}</span>
                                </div>
                             </td>`;
                }
            });
            html += "</tr>";
        });
        html += "</table>";
        document.getElementById("table-container").innerHTML = html;
        
        const logoCont = document.getElementById("main-logo-container");
        if (logoCont) logoCont.innerHTML = `<img src="${logoUrl}" alt="Logo" class="table-logo">`;

        document.getElementById("update-time").innerText = new Date().toLocaleTimeString();
        hideWeekends();
        setTimeout(initSmartMarquee, 200);

        // Przygotuj kafle (tiles) i inicjuj DnD
        prepareTilesAndInitDnD();
    } catch (err) { 
        console.error("Błąd CSV:", err); 
        setTimeout(loadData, 10000);
    }
}

/* ---------- MARQUEE I UTILS (bez zmian) ---------- */
function initSmartMarquee() {
    const spans = document.querySelectorAll('.tech-data span');
    spans.forEach(span => {
        const box = span.parentElement;
        span.classList.remove('animate-scroll');
        if (span.offsetWidth > box.offsetWidth) {
            box.style.justifyContent = "flex-start";
            const distance = span.offsetWidth - box.offsetWidth + 25; 
            span.style.setProperty('--scroll-dist', `-${distance}px`);
            span.classList.add('animate-scroll');
        } else {
            box.style.justifyContent = "center";
        }
    });
}

function shortenDay(day) {
    const days = {"poniedziałek":"Pon","wtorek":"Wt","środa":"Śr","czwartek":"Czw","piątek":"Pt","sobota":"Sob","niedziela":"Nd"};
    return days[day.toLowerCase()] || day;
}

function shortenDate(dateStr) {
    const parts = dateStr.split("-");
    return parts.length === 3 ? `${parts[2]}.${parts[1]}` : dateStr;
}

function hideWeekends() {
    const rows = document.querySelectorAll("table tr");
    rows.forEach((row) => {
        const dayCell = row.querySelector(".day");
        if (dayCell && (dayCell.innerText === "Sob" || dayCell.innerText === "Nd")) row.style.display = "none";
    });
}

/* ---------- NAV I CLOCK (bez zmian) ---------- */
function renderNav() {
    let navHtml = "";
    for (let i = 1; i <= 12; i++) {
        const m = String(i).padStart(2, '0');
        navHtml += `<button class="nav-btn ${m === currentViewMonth ? 'active' : ''}" onclick="changeMonth('${m}')">${monthNames[i-1]}</button>`;
    }
    document.getElementById("month-nav").innerHTML = navHtml;
}

function changeMonth(m) {
    currentViewMonth = m;
    renderNav();
    loadData();
}

function updateClock() {
    const clock = document.getElementById("clock");
    const now = new Date();
    if (clock) clock.innerText = now.toLocaleTimeString("pl-PL");
    const monthHeader = document.getElementById("current-month-name");
    if (monthHeader) monthHeader.innerText = `${monthNames[parseInt(currentViewMonth)-1].toUpperCase()} 2026`;
}

renderNav();
loadData();
setInterval(updateClock, 1000);
updateClock();
setInterval(loadData, 180000);

/* ---------- PRZYGOTOWANIE KAFLI I DnD ---------- */
function prepareTilesAndInitDnD() {
    const table = document.querySelector("#table-container table");
    if (!table) return;

    const trs = Array.from(table.querySelectorAll("tr"));
    trs.forEach((tr, rowIndex) => {
        // rowIndex odpowiada indeksowi i z CSV (tak jak w renderze)
        const tds = Array.from(tr.querySelectorAll("td.tech-data"));
        tds.forEach(td => {
            const colIndex = Number(td.getAttribute('data-csv-col'));
            // utwórz kafel tylko jeśli jeszcze nie ma
            if (!td.querySelector('.tech-tile')) {
                const span = td.querySelector('span');
                const text = span ? span.innerHTML : td.innerHTML;
                const tile = document.createElement('div');
                tile.className = 'tech-tile';
                tile.setAttribute('draggable', 'true');
                tile.dataset.row = rowIndex; // odpowiada i z CSV
                tile.dataset.col = colIndex; // odpowiada j
                // kolor zgodny z kolumną (kolumny techników zaczynają się od j=2)
                if (colIndex >= 2) tile.classList.add(`tile-col-${colIndex}`);
                tile.innerHTML = `<span>${text}</span>`;
                td.innerHTML = "";
                td.appendChild(tile);
            }
        });
    });

    initDragAndDrop();
}

/* ---------- DRAG & DROP + TOUCH (iPhone) ---------- */
function initDragAndDrop() {
    let dragSrc = null;

    function handleDragStart(e) {
        dragSrc = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({
            row: this.dataset.row,
            col: this.dataset.col,
            text: this.querySelector('span').innerText
        }));
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    async function handleDrop(e) {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const targetTile = this;
            if (!dragSrc || dragSrc === targetTile) return;

            const from = { row: Number(data.row), col: Number(data.col) };
            const to = { row: Number(targetTile.dataset.row), col: Number(targetTile.dataset.col) };

            // swap DOM texts
            const fromText = dragSrc.querySelector('span').innerText;
            const toText = targetTile.querySelector('span').innerText;
            dragSrc.querySelector('span').innerText = toText;
            targetTile.querySelector('span').innerText = fromText;

            // swap color classes to reflect new column ownership
            dragSrc.classList.remove(`tile-col-${from.col}`); dragSrc.classList.add(`tile-col-${to.col}`);
            targetTile.classList.remove(`tile-col-${to.col}`); targetTile.classList.add(`tile-col-${from.col}`);

            // send to server
            const resp = await sendSwapToServer(from, to);
            if (!resp.ok) {
                console.error('Błąd zapisu na serwerze', resp);
                // opcjonalnie: rollback (tu prosty rollback)
                dragSrc.querySelector('span').innerText = fromText;
                targetTile.querySelector('span').innerText = toText;
                dragSrc.classList.remove(`tile-col-${to.col}`); dragSrc.classList.add(`tile-col-${from.col}`);
                targetTile.classList.remove(`tile-col-${from.col}`); targetTile.classList.add(`tile-col-${to.col}`);
                alert('Błąd zapisu w arkuszu. Operacja cofnięta.');
            } else {
                document.getElementById("update-time").innerText = new Date().toLocaleTimeString();
                // opcjonalnie: odśwież dane z CSV, jeśli chcesz pełne odświeżenie:
                // setTimeout(loadData, 500);
            }
        } catch (err) {
            console.error('Drop error', err);
        } finally {
            if (dragSrc) dragSrc.classList.remove('dragging');
            dragSrc = null;
        }
    }

    // touch fallback: tap to pick, tap to drop
    let touchPicked = null;
    function handleTouchStart(e) {
        e.preventDefault();
        touchPicked = this;
        this.classList.add('dragging');
    }
    function handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetTile = el && el.closest && el.closest('.tech-tile');
        if (targetTile && touchPicked && targetTile !== touchPicked) {
            // perform swap similar to handleDrop
            const from = { row: Number(touchPicked.dataset.row), col: Number(touchPicked.dataset.col) };
            const to = { row: Number(targetTile.dataset.row), col: Number(targetTile.dataset.col) };
            const fromText = touchPicked.querySelector('span').innerText;
            const toText = targetTile.querySelector('span').innerText;
            touchPicked.querySelector('span').innerText = toText;
            targetTile.querySelector('span').innerText = fromText;
            touchPicked.classList.remove(`tile-col-${from.col}`); touchPicked.classList.add(`tile-col-${to.col}`);
            targetTile.classList.remove(`tile-col-${to.col}`); targetTile.classList.add(`tile-col-${from.col}`);
            sendSwapToServer(from, to).then(resp => {
                if (!resp.ok) {
                    // rollback
                    touchPicked.querySelector('span').innerText = fromText;
                    targetTile.querySelector('span').innerText = toText;
                    touchPicked.classList.remove(`tile-col-${to.col}`); touchPicked.classList.add(`tile-col-${from.col}`);
                    targetTile.classList.remove(`tile-col-${from.col}`); targetTile.classList.add(`tile-col-${to.col}`);
                    alert('Błąd zapisu w arkuszu. Operacja cofnięta.');
                } else {
                    document.getElementById("update-time").innerText = new Date().toLocaleTimeString();
                }
            });
        }
        if (touchPicked) touchPicked.classList.remove('dragging');
        touchPicked = null;
    }

    const tiles = document.querySelectorAll('.tech-tile');
    tiles.forEach(t => {
        t.addEventListener('dragstart', handleDragStart, false);
        t.addEventListener('dragend', handleDragEnd, false);
        t.addEventListener('dragover', handleDragOver, false);
        t.addEventListener('drop', handleDrop, false);
        t.addEventListener('touchstart', handleTouchStart, {passive:false});
        t.addEventListener('touchend', handleTouchEnd, {passive:false});
    });
}

/* ---------- WYWOŁANIE SERWERA (Apps Script) ---------- */
async function sendSwapToServer(from, to) {
    if (!ENDPOINT_URL || ENDPOINT_URL.includes("YOUR_WEBAPP_URL_HERE")) {
        console.warn("ENDPOINT_URL nie ustawiony. Wklej URL web app Apps Script do ENDPOINT_URL.");
        return { ok: false, error: "no_endpoint" };
    }
    const payload = {
        action: "swap",
        spreadsheetId: SPREADSHEET_ID,
        fromRow: from.row,
        fromCol: from.col,
        toRow: to.row,
        toCol: to.col,
        month: currentViewMonth
    };
    try {
        const res = await fetch(ENDPOINT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        return json;
    } catch (err) {
        console.error('Network error', err);
        return { ok: false, error: err.toString() };
    }
}
