const telaIncial = document.querySelector('.telaIncial')
  const janela = window
  janela.addEventListener('load',inciarJanela)
  const main_plash = document.querySelector('.main_plash')
  function inciarJanela(){
    main_plash.style.opacity = '0'
    setTimeout(()=>{
      
      telaIncial.style.display = 'none'
      main_plash.style.opacity= '1'
      main_plash.style.transition = 'opacity 0.9s'
      location.href='./html/index0.html'
    },8000
 )

  }
  