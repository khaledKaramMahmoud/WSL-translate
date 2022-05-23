var submit1=document.getElementById('submit1'),
submit2=document.getElementById('submit2'),
arrow=document.getElementById('arrow'),
detailsBoard=document.getElementById('detailsBoard'),
finalRes=document.getElementById('finalResult'),
afterSub=document.getElementById('afterSub');

submit1.onclick=function(){
    detailsBoard.style.display='none'
    finalRes.classList.add('d-block')
}

arrow.onclick=function(){
    finalRes.classList.remove('d-block')
    detailsBoard.style.display='block'
}
submit2.onclick=function(){
    finalRes.classList.remove('d-block')
    afterSub.classList.add('d-block')
}
