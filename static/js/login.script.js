/* Login and Register */
let loginForm = document.getElementById("login")
const loginImg = document.getElementById("login-img")
const registerBtn = document.getElementById("register-btn")

let registerForm = document.getElementById("register")
const registerImg = document.getElementById("register-img")
const loginBtn = document.getElementById("login-btn")


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
} )


/* End menu */

registerBtn.addEventListener("click", (e) => {
    e.preventDefault()
    registerForm.classList.remove("d-none")
    registerImg.classList.remove("d-none")
    loginForm.classList.add("d-none")
    loginImg.classList.add("d-none")
})

loginBtn.addEventListener("click", (e) => {
    e.preventDefault()
    loginForm.classList.remove("d-none")
    loginImg.classList.remove("d-none")
    registerForm.classList.add("d-none")
    registerImg.classList.add("d-none")
})

//Auth
// $("#log-in").on("click", () => {
//     const email = $("#email").val().trim()
//     const password = $("#password").val().trim()
//     if(email !== "" && password !== ""){
//         console.log(1)
//     }else{
//         loginForm.classList.remove("d-none")
//         loginImg.classList.remove("d-none")
//         registerForm.classList.add("d-none")
//         registerImg.classList.add("d-none")
//     }
// })

$("#header").css("background-image", "url('../../static/images/bg-4.avif')")



/* End Login and Register */