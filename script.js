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
Planner v0.2 |
${currentMonth} |
dni: ${data.length} |
${new Date().toLocaleTimeString()}
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


planner.innerHTML +=

`
<div class="cell date">

${formatDate(row.date)}

</div>

`;



row.tasks.forEach((task,index)=>{


planner.innerHTML +=

`
<div class="cell">

<div class="card ${colors[index]}">

${task}

</div>

</div>

`;


});


});


}







function formatDate(date){


const d=new Date(date);


return `
${String(d.getDate()).padStart(2,"0")}.
${String(d.getMonth()+1).padStart(2,"0")}
`;

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
