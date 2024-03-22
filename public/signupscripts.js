const form=document.querySelector('form');
const emailError=document.querySelector('.email.error');
const passwordError=document.querySelector('.password.error');

form.addEventListener('submit', async (e)=>{
    e.preventDefault();

    //reset errors
    emailError.textContent='';
    passwordError.textContent= '';

    //get values
    const username=form.name.value;
    const email=form.email.value;
    const password=form.password.value;
    try{
        const res=await fetch('/signup', {
            method: 'POST',
            body: JSON.stringify({username, email, password}),
            headers: {'Content-Type': 'Application/json'}
        })

        const data=await res.json();

        console.log(data)
        if(data.errors){
           emailError.textContent=data.errors.email
           passwordError.textContent=data.errors.password 
        }
        if(data.user){
            location.assign('/')
        }
    }catch(err){
        console.log(err);
    }
})