const SHEET_ID =
"1WeR2J62zroTUDGRFnd-Z4bQe196XiP7Kt1Rd_P3SR3M";


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


let currentMonth="MAJ";


const technicians=[
"PRZEMEK",
"RAFAŁ",
"MARCIN",
"MICHAŁ"
];


const colors=[
"przemek",
"rafal",
"marcin",
"michal"
];



function csvUrl(month){

return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${months[month]}`;

}





async function loadPlanner(){

const response =
await fetch(csvUrl(currentMonth));


const text =
await response.text();



const rows=text
.replace(/\r/g,"")
.split("\n")
.filter(x=>x.trim());


const data=[];



rows.forEach(row=>{


const cols=row.split(",");


if(
cols.length>=6 &&
/^\d{4}-\d{2}-\d{2}$/.test(cols[1])
){


data.push({

date:cols[1],

tasks:[

cols[2]||"",
cols[3]||"",
cols[4]||"",
cols[5]||""

]

});


}


});



drawPlanner(data);



document.getElementById("current-month").innerHTML =
currentMonth+" 2026";


document.getElementById("info").innerHTML =
`
Planner v0.3.1 |
${currentMonth} |
dni: ${data.length}
`;



}








function drawPlanner(data){


const planner=document.getElementById("planner");

planner.innerHTML="";



planner.innerHTML+=`

<div class="cell header">
DATA
</div>

`;



technicians.forEach(t=>{


planner.innerHTML+=`

<div class="cell header">
${t}
</div>

`;

});





data.forEach(row=>{


const day=getDayName(row.date);



if(
day==="Sobota" ||
day==="Niedziela"
)
return;




planner.innerHTML+=`

<div class="cell date">

${shortDay(day)}
<br>
${formatDate(row.date)}

</div>

`;





row.tasks.forEach((task,index)=>{


const card=parseTask(task);



planner.innerHTML+=`

<div class="cell">

<div 
class="card ${colors[index]}"
data-full="${escapeHtml(task)}">


<div class="task-type">
${card.icon} ${card.type}
</div>


<div class="task-main">

${card.main}

</div>


${card.lines.map(line=>`

<div class="task-line">
${line}
</div>

`).join("")}


</div>

</div>

`;



});



});



}








function parseTask(text){


let t=text.trim();



if(!t){

return {
type:"",
icon:"",
main:"",
lines:[]
};

}




// BIURO

if(/^B\s*:/i.test(t)){


return {

type:"BIURO",

icon:"🏢",

main:getTime(t),

lines:[
removeTime(t)
]

};

}





// TOWAR

if(/TOWAR/i.test(t)){


return {

type:"TOWAR",

icon:"📦",

main:findNumber(t),

lines:[

cleanText(t)

]

};

}






// CZAS

if(
/\d{1,2}[:.-]\d{2}\s*[-]\s*\d{1,2}/.test(t)
||
/8-16/.test(t)
){


return {

type:"CZAS PRACY",

icon:"🕗",

main:getTime(t),

lines:[

cleanText(t)

]

};

}







// WYJAZD

if(/\b\d{2,4}\b/.test(t)){


let parts=t.split(" ");


return {

type:"WYJAZD",

icon:"🔧",

main:findNumber(t),

lines:

parts
.filter(x=>x!==findNumber(t))
.slice(0,3)

};


}






return {

type:"ZADANIE",

icon:"📌",

main:t.substring(0,25),

lines:[]

};


}







function findNumber(text){

const m=text.match(/\b\d{2,4}\b/);

return m ? m[0] : "";

}




function getTime(text){

const m=text.match(/\d{1,2}[-:]\d{1,2}|\d{1,2}:\d{2}[-]\d{1,2}:\d{2}/);

return m ? m[0] : "";

}




function removeTime(text){

return text.replace(/\d{1,2}[-:]\d{1,2}/,"").trim();

}




function cleanText(text){

return text
.replace(/.*TOWAR/i,"")
.replace(/\(TABLICA WYJAZDY\)/i,"")
.trim();

}






function getDayName(date){

const p=date.split("-");


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

}[day];

}





function formatDate(date){

const p=date.split("-");

return `${p[2]}.${p[1]}`;

}





function escapeHtml(text){

return text
.replace(/"/g,"&quot;");

}







document
.querySelectorAll("#month-bar button")
.forEach(btn=>{


btn.onclick=function(){


document
.querySelectorAll("#month-bar button")
.forEach(b=>b.classList.remove("active"));



this.classList.add("active");


currentMonth=this.dataset.month;


loadPlanner();


};

});




loadPlanner();
