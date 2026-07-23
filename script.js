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

try{


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


const cols=row
.split(",")
.map(x=>x.trim());



if(
cols.length>=6 &&
/^\d{4}-\d{2}-\d{2}$/.test(cols[1])
){


data.push({

day:cols[0],

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
Planner v0.3 |
${currentMonth} |
dni: ${data.length}
`;



}

catch(e){

console.error(e);

}


}







function drawPlanner(data){


const planner =
document.getElementById("planner");


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


const dayName=getDayName(row.date);



if(
dayName==="Sobota" ||
dayName==="Niedziela"
){

return;

}




planner.innerHTML+=`

<div class="cell date">

${shortDay(dayName)}
<br>
${formatDate(row.date)}

</div>

`;





row.tasks.forEach((task,index)=>{


const card=parseTask(task);



planner.innerHTML+=`

<div class="cell">

<div class="card ${colors[index]}"
data-full="${task}">


<div class="task-type">
${card.icon} ${card.type}
</div>


<div class="task-main">
${card.main}
</div>


${card.lines.map(x=>`

<div class="task-line">
${x}
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





if(
t.toLowerCase().includes("urlop")
){

return {

type:"URLOP",

icon:"🏖",

main:"",

lines:[

"wolne"

]

};

}





if(
t.toLowerCase().includes("towar")
){

let clean=t
.replace(/.*towar/i,"")
.trim();



return {

type:"TOWAR",

icon:"📦",

main:extractNumber(t),

lines:[

clean

]

};


}






if(
t.includes("8-16")
){

return {

type:"PRACA",

icon:"🕗",

main:"8-16",

lines:[

t.replace("8-16","").trim()

]

};


}







return {


type:"SERWIS",

icon:"🔧",

main:extractNumber(t),

lines:splitWords(t)


};



}









function extractNumber(text){


const match=text.match(/\b\d{2,4}\b/);


return match ? match[0] : "";

}






function splitWords(text){


let words=text.split(" ");


return words
.filter(x=>x.length>2)
.slice(1,3);

}








function getDayName(date){


const days=[

"Niedziela",
"Poniedziałek",
"Wtorek",
"Środa",
"Czwartek",
"Piątek",
"Sobota"

];


const p=date.split("-");


return days[
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
