/* Welcome page index  */
/* Menu  */

let list = $("#menu-list")
let listStat = false

$(".menu-toggler").on("click", () => {
    console.log("dfgbdfhb")
    if(!listStat){
        list.css("display", "flex")
        listStat = true
    }else{
        list.css("display", "none")
        listStat = false
    }
})


/* End menu */

/* Slide Animation */
let headerPart = document.getElementById("header-part")
let slideBtnContainer = document.getElementById("slide-btn-container")
const bg = ["../../static/images/bg-1.avif", "../../static/images/bg-2.jpg", "../../static/images/bg-3.avif"]
const buttonId = []
let i = 1

//Create apropriated indicatior button for the background
for(let c = 0; c < bg.length; c++){
    let newBtn = document.createElement("button");
    newBtn.classList.add("p-0", "inactive-btn-slide-indicator", "slide-indicator")
    newBtn.id = `btn-${c}`
    buttonId.push(newBtn.id)
    slideBtnContainer.appendChild(newBtn)
}

document.getElementById(`btn-${i}`).classList.add("active-btn")
document.getElementById(`btn-${i}`).classList.remove("inactive-btn-slide-indicator")

function autoChange(){
    headerPart.style.backgroundImage = `url(${bg[i]})`
    rightChange()
}

setInterval(autoChange, 6000)

autoChange()

function rightChange(){
    i += 1
    if( i > bg.length - 1){
        i = 0
        document.getElementById(`btn-${bg.length - 1}`).classList.remove("active-btn")
        document.getElementById(`btn-${bg.length - 1}`).classList.add("inactive-btn-slide-indicator")
    }else{
        document.getElementById(`btn-${i - 1}`).classList.remove("active-btn")
        document.getElementById(`btn-${i - 1}`).classList.add("inactive-btn-slide-indicator")
    }
    activeBtn()
    headerPart.style.backgroundImage = `url(${bg[i]})`
}

function activeBtn(){
    document.getElementById(`btn-${i}`).classList.add("active-btn")
    document.getElementById(`btn-${i}`).classList.remove("inactive-btn-slide-indicator")
}

let arrow = document.getElementById("arrow")
let logs = []
let nav = document.getElementById("nav")

window.addEventListener("scroll", () => {
    let y = window.scrollY
    logs.push(y)
    if( y!= 0){
        nav.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
        nav.style.backdropFilter = "blur(5px)";
        
    }else{
        nav.style.backgroundColor = "transparent"
        nav.style.backdropFilter =  "blur(0)";

    }
    if(logs[logs.length - 2] < window.scrollY){
        goTo("down")
    }else{
        goTo("up")
    }
})


function goTo(dir){
    if(dir == "down"){
        nav.style.top = -86 + "px"
    }else{
        nav.style.top = "0px"
    }
}