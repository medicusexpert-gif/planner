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



const rows = text
.replace(/\r/g,"")
.split("\n")
.filter(x=>x.trim());



const data=[];



rows.forEach(row=>{


const cols =
row.split(",")
.map(x=>x.trim());



if(

cols.length>=6 &&

/^\d{4}-\d{2}-\d{2}$/.test(cols[1])

){


data.push({

day:cols[0],

date:cols[1],

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



document.getElementById("current-month").innerHTML =
currentMonth+" 2026";



document.getElementById("info").innerHTML =


`
Planner v0.2.1 |
${currentMonth} |
dni robocze: ${data.length} |
${new Date().toLocaleTimeString()}
`;



}

catch(error){

console.error(error);

document.getElementById("info").innerHTML =
"BŁĄD: "+error.message;

}


}









function drawPlanner(data){



const planner =
document.getElementById("planner");



planner.innerHTML="";



planner.innerHTML +=

`
<div class="cell header">
DATA
</div>
`;



technicians.forEach(t=>{


planner.innerHTML +=

`
<div class="cell header">
${t}
</div>

`;

});





data.forEach(row=>{



const dayName =
getDayName(row.date);



if(

dayName==="Sobota" ||

dayName==="Niedziela"

){

return;

}





planner.innerHTML +=

`
<div class="cell date">

<div>
${shortDay(dayName)}
</div>

<div>
${formatDate(row.date)}
</div>

</div>

`;





row.tasks.forEach((task,index)=>{



planner.innerHTML +=

`

<div class="cell">


<div class="card ${colors[index]}">

${formatTask(task)}

</div>


</div>

`;



});



});



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



const parts=date.split("-");

const d =
new Date(
parts[0],
parts[1]-1,
parts[2]
);



return days[d.getDay()];


}







function shortDay(day){


const short={

"Poniedziałek":"Pon",
"Wtorek":"Wt",
"Środa":"Śr",
"Czwartek":"Czw",
"Piątek":"Pt"

};


return short[day] || day;


}







function formatDate(date){


const parts=date.split("-");

return `

${parts[2]}.
${parts[1]}

`;

}







function formatTask(text){



let t=text.trim();



if(!t){

return "";

}



if(
t.toLowerCase().includes("urlop")
){

return "🏖 "+t;

}




if(
t.toLowerCase().includes("towar")
){

return "📦 "+t;

}




if(
t.includes("8-16")
){

return "🕗 "+t;

}




return t;


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
