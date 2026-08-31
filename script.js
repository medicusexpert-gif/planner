/*
==================================================
MEDICUS PLANNER
DRAG & DROP + TOUCH + POTWIERDZENIE
==================================================
*/

const SHEET_ID =
"1WeR2J62zroTUDGRFnd-Z4bQe196XiP7Kt1Rd_P3SR3M";


/*
==================================================
GOOGLE APPS SCRIPT
==================================================
*/

const API_URL =
"https://script.google.com/macros/s/AKfycbytRF53HvJAylZXgdUlLOB8gEwFKtFGWMexLqMjdIORNjf8_R3Edx7tMHPu4SgCLy0wcg/exec";


/*
==================================================
MIESIĄCE
==================================================
*/

const months = {

    "STYCZEŃ":"1901112775",
    "LUTY":"761522376",
    "MARZEC":"427047031",
    "KWIECIEŃ":"1456994350",
    "MAJ":"605689359",
    "CZERWIEC":"1218108803",
    "LIPIEC":"975199346",
    "SIERPIEŃ":"878375304",
    "WRZESIEŃ":"1634226018",
    "PAŹDZIERNIK":"954794309",
    "LISTOPAD":"930192024",
    "GRUDZIEŃ":"1626189679"

};


/*
==================================================
MIESIĄC
==================================================
*/

let currentMonth =
localStorage.getItem("plannerMonth") || "MAJ";


/*
==================================================
TECHNICY
==================================================
*/

const technicians = [

    "PRZEMEK",
    "RAFAŁ",
    "MARCIN",
    "MICHAŁ"

];


const colors = [

    "przemek",
    "rafal",
    "marcin",
    "michal"

];


/*
==================================================
CSV URL
==================================================
*/

function csvUrl(month){

    return (
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${months[month]}`
    );

}


/*
==================================================
ŁADOWANIE PLANNERA
==================================================
*/

async function loadPlanner(){

    try{

        setStatus("Ładowanie danych...");


        const response =
        await fetch(
            csvUrl(currentMonth) +
            "&t=" +
            Date.now()
        );


        if(!response.ok){

            throw new Error(
                "Nie udało się pobrać danych"
            );

        }


        const text =
        await response.text();


        const rows =
        text
        .replace(/\r/g,"")
        .split("\n")
        .filter(row => row.trim());


        const data = [];


        /*
        ==========================================
        ODCZYT CSV
        ==========================================
        */

        rows.forEach((row, rowIndex) => {

            const cols =
            parseCSVLine(row);


            if(
                cols.length >= 6 &&
                /^\d{4}-\d{2}-\d{2}$/.test(
                    cols[1]
                )
            ){

                data.push({

                    sheetRow:
                    rowIndex + 1,

                    date:
                    cols[1],

                    tasks:[

                        cols[2] || "",
                        cols[3] || "",
                        cols[4] || "",
                        cols[5] || ""

                    ]

                });

            }

        });


        drawPlanner(data);


        document
        .getElementById("current-month")
        .innerHTML =
        `${currentMonth} 2026`;


        document
        .getElementById("info")
        .innerHTML =
        `MEDICUS Planner | ${currentMonth} | dni robocze: ${data.length}`;


        setStatus("Gotowe");


    }
    catch(error){

        console.error(error);


        setStatus("Błąd");


        document
        .getElementById("info")
        .innerHTML =
        "Błąd: " + error.message;

    }

}


/*
==================================================
RYSOWANIE PLANNERA
==================================================
*/

function drawPlanner(data){

    const planner =
    document.getElementById("planner");


    planner.innerHTML = "";


    /*
    ==========================================
    NAGŁÓWKI
    ==========================================
    */

    planner.innerHTML += `

        <div class="cell header">
            DATA
        </div>

    `;


    technicians.forEach(t => {

        planner.innerHTML += `

            <div class="cell header">
                ${t}
            </div>

        `;

    });


    /*
    ==========================================
    DNI
    ==========================================
    */

    data.forEach(row => {

        const day =
        getDayName(row.date);


        /*
        SOBOTA / NIEDZIELA
        */

        if(
            day === "Sobota" ||
            day === "Niedziela"
        ){

            return;

        }


        /*
        ========================================
        DATA
        ========================================
        */

        planner.innerHTML += `

            <div class="cell date">

                ${shortDay(day)}

                <br>

                ${formatDate(row.date)}

            </div>

        `;


        /*
        ========================================
        KAFELKI
        ========================================
        */

        row.tasks.forEach(
            (task,index) => {

                const card =
                parseTask(task);


                const escapedTask =
                escapeHtml(task);


                planner.innerHTML += `

                    <div class="cell">

                        <div
                            class="card ${colors[index]}"
                            draggable="true"

                            data-full="${escapedTask}"

                            data-row="${row.sheetRow}"

                            data-col="${index + 3}"

                            data-date="${row.date}"

                            data-day="${day}"

                            data-technician="${technicians[index]}"

                        >

                            <div class="task-type">

                                ${card.icon}
                                ${card.type}

                            </div>


                            <div class="task-main">

                                ${card.main}

                            </div>


                            ${card.lines.map(
                                line => `

                                <div class="task-line">
                                    ${line}
                                </div>

                                `
                            ).join("")}

                        </div>

                    </div>

                `;

            }

        );

    });


    /*
    ==========================================
    WŁĄCZENIE DRAG & DROP
    ==========================================
    */

    enableDragAndDrop();

}


/*
==================================================
DRAG & DROP
==================================================
*/

function enableDragAndDrop(){

    const cards =
    document.querySelectorAll(".card");


    let draggedCard = null;


    /*
    ==========================================
    KOMPUTER
    ==========================================
    */

    cards.forEach(card => {

        card.addEventListener(
            "dragstart",
            function(e){

                draggedCard = this;

                this.classList.add(
                    "dragging"
                );


                e.dataTransfer.effectAllowed =
                "move";


                e.dataTransfer.setData(
                    "text/plain",
                    ""
                );

            }
        );


        card.addEventListener(
            "dragend",
            function(){

                this.classList.remove(
                    "dragging"
                );

            }
        );


        card.addEventListener(
            "dragover",
            function(e){

                e.preventDefault();

                this.classList.add(
                    "drag-over"
                );

            }
        );


        card.addEventListener(
            "dragleave",
            function(){

                this.classList.remove(
                    "drag-over"
                );

            }
        );


        card.addEventListener(
            "drop",
            async function(e){

                e.preventDefault();


                this.classList.remove(
                    "drag-over"
                );


                if(
                    !draggedCard ||
                    draggedCard === this
                ){

                    return;

                }


                /*
                ==================================
                POTWIERDZENIE
                ==================================
                */

                const confirmed =
                await showSwapConfirmation(
                    draggedCard,
                    this
                );


                if(!confirmed){

                    draggedCard = null;

                    return;

                }


                await swapCards(
                    draggedCard,
                    this
                );


                draggedCard = null;

            }
        );

    });


    /*
    ==========================================
    TELEFON / TOUCH
    ==========================================
    */

    enableTouchDrag(cards);

}


/*
==================================================
TOUCH DRAG
==================================================
*/

function enableTouchDrag(cards){

    let touchCard = null;

    let ghost = null;

    let startX = 0;

    let startY = 0;

    let currentTarget = null;

    let isDragging = false;


    cards.forEach(card => {


        card.addEventListener(
            "touchstart",
            function(e){

                if(
                    e.touches.length !== 1
                ){

                    return;

                }


                touchCard = this;

                isDragging = false;


                const touch =
                e.touches[0];


                startX =
                touch.clientX;


                startY =
                touch.clientY;


            },
            {
                passive:true
            }
        );


        card.addEventListener(
            "touchmove",
            function(e){

                if(
                    !touchCard ||
                    e.touches.length !== 1
                ){

                    return;

                }


                const touch =
                e.touches[0];


                const dx =
                touch.clientX - startX;


                const dy =
                touch.clientY - startY;


                const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


                if(distance < 10){

                    return;

                }


                isDragging = true;


                e.preventDefault();


                if(!ghost){

                    ghost =
                    touchCard.cloneNode(true);


                    ghost.classList.add(
                        "touch-ghost"
                    );


                    ghost.style.width =
                    touchCard.offsetWidth +
                    "px";


                    document.body
                    .appendChild(
                        ghost
                    );

                }


                ghost.style.left =
                (
                    touch.clientX -
                    touchCard.offsetWidth / 2
                ) + "px";


                ghost.style.top =
                (
                    touch.clientY -
                    touchCard.offsetHeight / 2
                ) + "px";


                const element =
                document.elementFromPoint(
                    touch.clientX,
                    touch.clientY
                );


                const target =
                element ?
                element.closest(".card") :
                null;


                if(
                    currentTarget &&
                    currentTarget !== target
                ){

                    currentTarget.classList.remove(
                        "drag-over"
                    );

                }


                if(
                    target &&
                    target !== touchCard
                ){

                    target.classList.add(
                        "drag-over"
                    );

                    currentTarget =
                    target;

                }

            },
            {
                passive:false
            }
        );


        card.addEventListener(
            "touchend",
            async function(){

                if(!touchCard){

                    return;

                }


                if(ghost){

                    ghost.remove();

                    ghost = null;

                }


                if(currentTarget){

                    currentTarget.classList.remove(
                        "drag-over"
                    );


                    /*
                    ==================================
                    POTWIERDZENIE
                    ==================================
                    */

                    const confirmed =
                    await showSwapConfirmation(
                        touchCard,
                        currentTarget
                    );


                    if(confirmed){

                        await swapCards(
                            touchCard,
                            currentTarget
                        );

                    }

                }


                touchCard = null;

                currentTarget = null;

                isDragging = false;

            }
        );


        card.addEventListener(
            "touchcancel",
            function(){

                if(ghost){

                    ghost.remove();

                    ghost = null;

                }


                if(currentTarget){

                    currentTarget.classList.remove(
                        "drag-over"
                    );

                }


                touchCard = null;

                currentTarget = null;

                isDragging = false;

            }
        );

    });

}


/*
==================================================
OKNO POTWIERDZENIA
==================================================
*/

function showSwapConfirmation(card1, card2){

    return new Promise(resolve => {

        /*
        ==========================================
        USUŃ STARE OKNO
        ==========================================
        */

        const oldModal =
        document.getElementById(
            "swap-confirm-modal"
        );


        if(oldModal){

            oldModal.remove();

        }


        /*
        ==========================================
        DANE KAFELKÓW
        ==========================================
        */

        const tech1 =
        card1.dataset.technician || "";


        const tech2 =
        card2.dataset.technician || "";


        const date1 =
        formatDatePL(
            card1.dataset.date
        );


        const date2 =
        formatDatePL(
            card2.dataset.date
        );


        const task1 =
        card1.dataset.full || "";


        const task2 =
        card2.dataset.full || "";


        /*
        ==========================================
        MODAL
        ==========================================
        */

        const modal =
        document.createElement("div");


        modal.id =
        "swap-confirm-modal";


        modal.innerHTML = `

            <div class="swap-modal-backdrop">

                <div class="swap-modal">

                    <div class="swap-modal-title">

                        Zamiana kafelków?

                    </div>


                    <div class="swap-modal-question">

                        Czy na pewno chcesz
                        zamienić te zadania
                        miejscami?

                    </div>


                    <div class="swap-preview">

                        <div class="swap-preview-card">

                            <div class="swap-preview-tech">

                                ${escapeHtml(tech1)}

                            </div>

                            <div class="swap-preview-date">

                                ${escapeHtml(date1)}

                            </div>

                            <div class="swap-preview-task">

                                ${escapeHtml(
                                    task1 || "Puste"
                                )}

                            </div>

                        </div>


                        <div class="swap-arrow">

                            ⇅

                        </div>


                        <div class="swap-preview-card">

                            <div class="swap-preview-tech">

                                ${escapeHtml(tech2)}

                            </div>

                            <div class="swap-preview-date">

                                ${escapeHtml(date2)}

                            </div>

                            <div class="swap-preview-task">

                                ${escapeHtml(
                                    task2 || "Puste"
                                )}

                            </div>

                        </div>

                    </div>


                    <div class="swap-modal-buttons">

                        <button
                            id="swap-cancel"
                            class="swap-button cancel"
                        >

                            ANULUJ

                        </button>


                        <button
                            id="swap-confirm"
                            class="swap-button confirm"
                        >

                            ZAMIEŃ

                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        /*
        ==========================================
        ANULUJ
        ==========================================
        */

        document
        .getElementById("swap-cancel")
        .onclick = function(){

            modal.remove();

            resolve(false);

        };


        /*
        ==========================================
        ZAMIEŃ
        ==========================================
        */

        document
        .getElementById("swap-confirm")
        .onclick = function(){

            modal.remove();

            resolve(true);

        };


        /*
        ==========================================
        KLIKNIĘCIE W TŁO = ANULUJ
        ==========================================
        */

        modal
        .querySelector(
            ".swap-modal-backdrop"
        )
        .addEventListener(
            "click",
            function(e){

                if(
                    e.target === this
                ){

                    modal.remove();

                    resolve(false);

                }

            }
        );

    });

}


/*
==================================================
FORMAT DATY DO POTWIERDZENIA
==================================================
*/

function formatDatePL(date){

    if(!date){

        return "";

    }


    const p =
    date.split("-");


    if(p.length !== 3){

        return date;

    }


    return `${p[2]}.${p[1]}.${p[0]}`;

}


/*
==================================================
ZAMIANA KAFELKÓW
==================================================
*/

async function swapCards(card1, card2){

    const row1 =
    Number(
        card1.dataset.row
    );


    const col1 =
    Number(
        card1.dataset.col
    );


    const row2 =
    Number(
        card2.dataset.row
    );


    const col2 =
    Number(
        card2.dataset.col
    );


    if(
        !row1 ||
        !row2 ||
        !col1 ||
        !col2
    ){

        alert(
            "Nie można określić komórek arkusza."
        );

        return;

    }


    setStatus(
        "Zapisywanie..."
    );


    const task1 =
    card1.dataset.full || "";


    const task2 =
    card2.dataset.full || "";


    /*
    ==========================================
    ZABEZPIECZENIE PRZED PODWÓJNYM ZAPISEM
    ==========================================
    */

    document.body.classList.add(
        "saving"
    );


    try{

        const response =
        await fetch(
            API_URL,
            {

                method:"POST",

                headers:{
                    "Content-Type":
                    "text/plain;charset=utf-8"
                },

                body:JSON.stringify({

                    action:"swap",

                    month:
                    currentMonth,

                    row1:
                    row1,

                    col1:
                    col1,

                    row2:
                    row2,

                    col2:
                    col2

                })

            }
        );


        const result =
        await response.json();


        if(
            !result.success
        ){

            throw new Error(
                result.error ||
                "Google Sheets odrzucił zapis"
            );

        }


        /*
        ========================================
        ODCZYT ŚWIEŻYCH DANYCH
        ========================================
        */

        await loadPlanner();


        setStatus(
            "Zapisano ✓"
        );


    }
    catch(error){

        console.error(error);


        setStatus(
            "Błąd zapisu"
        );


        alert(
            "Nie udało się zapisać zmiany.\n\n" +
            error.message
        );


        await loadPlanner();

    }
    finally{

        document.body.classList.remove(
            "saving"
        );

    }

}


/*
==================================================
STATUS
==================================================
*/

function setStatus(text){

    const status =
    document.getElementById("status");


    if(status){

        status.innerText =
        text;

    }

}


/*
==================================================
PARSER ZADAŃ
==================================================
*/

function parseTask(text){

    let t =
    text.trim();


    if(!t){

        return {

            type:"",
            icon:"",
            main:"",
            lines:[]

        };

    }


    /*
    URLOP
    */

    if(
        t.toLowerCase()
        .includes("urlop")
    ){

        return {

            type:"URLOP",
            icon:"🏖",
            main:"Urlop",
            lines:[]

        };

    }


    /*
    BIURO
    */

    if(
        /^B\s*:/i.test(t)
    ){

        let clean =
        t.replace(
            /^B\s*:/i,
            ""
        ).trim();


        return {

            type:"BIURO",
            icon:"🏢",
            main:getTime(clean),
            lines:[
                removeTime(clean)
            ]

        };

    }


    /*
    GODZINA NA POCZĄTKU
    */

    let timeMatch =
    t.match(
        /^(\d{1,2}:\d{2})\s*(.*)$/
    );


    if(timeMatch){

        return {

            type:"ZADANIE",
            icon:"📌",

            main:
            timeMatch[2],

            lines:[
                "(od " +
                timeMatch[1] +
                ")"
            ]

        };

    }


    /*
    TOWAR
    */

    if(
        /TOWAR/i.test(t)
    ){

        return {

            type:"TOWAR",
            icon:"📦",

            main:
            t
            .replace(
                /TOWAR/i,
                ""
            )
            .trim(),

            lines:[]

        };

    }


    /*
    CZAS PRACY
    */

    if(
        /\b\d{1,2}[-]\d{1,2}\b/
        .test(t)
    ){

        return {

            type:"CZAS PRACY",
            icon:"🕗",

            main:t,

            lines:[]

        };

    }


    /*
    WYJAZD
    */

    if(
        /\b\d{2,4}\b/
        .test(t)
    ){

        return {

            type:"WYJAZD",
            icon:"🔧",

            main:t,

            lines:[]

        };

    }


    /*
    ZWYKŁE ZADANIE
    */

    return {

        type:"ZADANIE",
        icon:"📌",
        main:t,
        lines:[]

    };

}


/*
==================================================
CZAS
==================================================
*/

function getTime(text){

    const match =
    text.match(
        /\d{1,2}[:.-]\d{2}\s*[-]\s*\d{1,2}(:\d{2})?|\b8-16\b/
    );


    return match ?
    match[0] :
    "";

}


/*
==================================================
USUWANIE CZASU
==================================================
*/

function removeTime(text){

    return text

    .replace(
        /\d{1,2}[:.-]\d{2}\s*[-]\s*\d{1,2}/,
        ""
    )

    .replace(
        /\b8-16\b/,
        ""
    )

    .trim();

}


/*
==================================================
DATY
==================================================
*/

function getDayName(date){

    const p =
    date.split("-");


    return [

        "Niedziela",
        "Poniedziałek",
        "Wtorek",
        "Środa",
        "Czwartek",
        "Piątek",
        "Sobota"

    ][

        new Date(
            p[0],
            p[1]-1,
            p[2]
        ).getDay()

    ];

}


function shortDay(day){

    return {

        "Poniedziałek":"Pon",
        "Wtorek":"Wt",
        "Środa":"Śr",
        "Czwartek":"Czw",
        "Piątek":"Pt"

    }[day] || "";

}


function formatDate(date){

    const p =
    date.split("-");


    return `${p[2]}.${p[1]}`;

}


/*
==================================================
CSV PARSER
==================================================
*/

function parseCSVLine(line){

    const result=[];

    let current="";

    let insideQuotes=false;


    for(
        let i=0;
        i<line.length;
        i++
    ){

        const char =
        line[i];


        if(
            char === '"'
        ){

            insideQuotes =
            !insideQuotes;

            continue;

        }


        if(
            char === "," &&
            !insideQuotes
        ){

            result.push(
                current.trim()
            );


            current="";

        }
        else{

            current +=
            char;

        }

    }


    result.push(
        current.trim()
    );


    return result;

}


/*
==================================================
ESCAPE HTML
==================================================
*/

function escapeHtml(text){

    return String(text || "")

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/*
==================================================
ZMIANA MIESIĄCA
==================================================
*/

document
.querySelectorAll(
    "#month-bar button"
)
.forEach(btn => {

    btn.onclick =
    function(){

        document
        .querySelectorAll(
            "#month-bar button"
        )
        .forEach(b =>
            b.classList.remove(
                "active"
            )
        );


        this.classList.add(
            "active"
        );


        currentMonth =
        this.dataset.month;


        localStorage.setItem(
            "plannerMonth",
            currentMonth
        );


        loadPlanner();

    };

});


/*
==================================================
AKTYWNY MIESIĄC
==================================================
*/

document
.querySelectorAll(
    "#month-bar button"
)
.forEach(btn => {

    if(
        btn.dataset.month ===
        currentMonth
    ){

        btn.classList.add(
            "active"
        );

    }

});


/*
==================================================
START
==================================================
*/

loadPlanner();


/*
==================================================
AUTO ODŚWIEŻANIE
==================================================
*/

setInterval(
    () => {

        loadPlanner();

    },
    5 * 60 * 1000
);
