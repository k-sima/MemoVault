
 const typingDemo = document.querySelector('.typing-demo');  
 const description = document.getElementById('description');  
 const actionButton = document.getElementById('actionButton');  
 const developersTitle = document.getElementById('developersTitle');  
 const developersList = document.getElementById('developersList');  

 typingDemo.addEventListener('animationend', () => {  

     description.classList.add('visible');  
     description.classList.remove('hidden');  
     setTimeout(() => {  

         actionButton.classList.add('visible');  
         actionButton.classList.remove('hidden');  
     }, 500);   
     setTimeout(() => {  
 
         developersTitle.classList.add('visible');  
         developersTitle.classList.remove('hidden');  
     }, 1000); 
     setTimeout(() => {  
 
         developersList.classList.add('visible');  
         developersList.classList.remove('hidden');  
     }, 1500); 
 });  