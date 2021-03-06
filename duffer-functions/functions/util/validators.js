const isEmail = (email) => {
    const regEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(email.match(regEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

exports.validateSignUpData = (data) => {
    let errors = {};

    if(isEmpty(data.email)) {
        errors.email = 'Must not be empty'
    } else if(!isEmail(data.email)){
        errors.email = 'Must be a valid email address'
    }

    if(isEmpty(data.password)) errors.password = 'Must not be empty'
    if(data.password !== data.confirmPassword) 
        errors.confirmPassword = 'Passwords must be the same';
    if(isEmpty(data.handle)) errors.handle = 'Must not be empty'

   return {
       errors,
       valid: Object.keys(errors).length === 0 ? true : false
   }
}

exports.validateLoginData = (data) => {
    let errors = {};
    
    if(isEmpty(data.email)) errors.email = 'Must not be empty';
    if(isEmpty(data.password)) errors.password = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}
