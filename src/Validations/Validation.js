import * as yup from 'yup';

export const registrationSchema = yup.object().shape({
    Email:  yup.string().email().required(),
    Fname: yup.string().required(),
    Sname: yup.string().required(),
    Pass: yup.string().min(8, "Must have at least 8 characters").max(50, "Too many characters").required("Password is a required field"),
    Confirm: yup.string().min(8, "Must have at least 8 characters").max(50, "Too many characters").required("Must confirm password"),
    UserType: yup.string().required()
});

export const loginSchema = yup.object().shape({
    Email:  yup.string().email().required(),
    Pass: yup.string().min(8, "Must have at least 8 characters").max(50, "Too many characters").required("Password is a required field"),
    Confirm: yup.string().min(8, "Must have at least 8 characters").max(50, "Too many characters").required("Must confirm password"),
    UserType: yup.string().required()
});