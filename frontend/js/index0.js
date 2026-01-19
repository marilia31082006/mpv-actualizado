let mode = "login";
let userType = "";

const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const emailMsg = document.getElementById("emailMsg");
const passwordMsg = document.getElementById("passwordMsg");
const confirmMsg = document.getElementById("confirmMsg");

function openLogin(type) {
  userType = type;
  document.getElementById("loginChoice").classList.add("hidden");
  document.getElementById("authForm").classList.remove("hidden");
  setLoginMode();
}

document.getElementById("btnRegister").onclick = () => {
  userType = "novo";
  document.getElementById("loginChoice").classList.add("hidden");
  document.getElementById("authForm").classList.remove("hidden");
  setRegisterMode();
};

function setLoginMode() {
  mode = "login";
  document.getElementById("formTitle").innerText =
    `Login (${userType})`;
  document.getElementById("submitBtn").innerText = "Entrar";
  document.getElementById("confirmBox").classList.add("hidden");
  document.getElementById("switchMode").innerHTML =
    `Não tem conta? <a href="#" onclick="setRegisterMode()">Criar conta</a>`;
}

function setRegisterMode() {
  mode = "register";
  document.getElementById("formTitle").innerText = "Criar conta";
  document.getElementById("submitBtn").innerText = "Registrar";
  document.getElementById("confirmBox").classList.remove("hidden");
  document.getElementById("switchMode").innerHTML =
    `Já tem conta? <a href="#" onclick="setLoginMode()">Entrar</a>`;
}

/* === VALIDAÇÕES EM TEMPO REAL === */

email.addEventListener("input", () => {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  emailMsg.textContent = valid ? "Email válido" : "Email inválido";
  emailMsg.className = valid ? "valid" : "invalid";
});

password.addEventListener("input", () => {
  const strong =
    password.value.length >= 8 &&
    /[A-Z]/.test(password.value) &&
    /[0-9]/.test(password.value) &&
    /[\W]/.test(password.value);

  passwordMsg.textContent = strong
    ? "Senha forte"
    : "Mín. 8 caracteres, maiúscula, número e símbolo";

  passwordMsg.className = strong ? "valid" : "invalid";
});

confirmPassword?.addEventListener("input", () => {
  const match = confirmPassword.value === password.value;
  confirmMsg.textContent = match ? "Senhas coincidem" : "Senhas diferentes";
  confirmMsg.className = match ? "valid" : "invalid";
});

/* === SUBMIT (ainda sem backend) === */

document.getElementById("authForm").addEventListener("submit", e => {
  e.preventDefault();
  fetch("https://SEU_BACKEND.vercel.app/check-email?email=" + email.value)
  fetch("https://SEU_BACKEND.vercel.app/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
})


});

async function register() {
  const data = {
    name:
    document.getElementById("r-name").value,
    email:
    document.getElementById("r-email").value,
    password:
    document.getElementById("r-password").value,
    role:
    document.getElementById("r-role").value
  };

  const res = await fetch("/backend/auth/register.php",{
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });

  const json = await res.json();
  alert(json.sucess ? "Conta criada": json.error);
}

async function login() {
  const data = {
    email:
    document.getElementById("l-email").value,
    password:
    document.getElementById("l-pass").value
   };

   const res = await fetch("/backend/auth/login.php",{
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
  
  const json = await res.json();

  if(json.token){
    localStorge.setItem("token", json.token);
    window.location.href = json.role === "empresa" 
    ? "/html/index3.html"
    : "/html/index2.html";
  }
  else{
    alert(json.error)
  }
  
}
// parte da mudança de turno
const btn = document.getElementById("toggle-theme");

btn.addEventListener("click", ()=>{
   document.body.classList.toggle("dark");
   
   if(document.body.classList.contains("dark")){
    btn.textContent= "🌕";

   } else{
    btn.textContent = "🌙";
   }
});
