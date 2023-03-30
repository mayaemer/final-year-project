import * as yup from "yup";

export const registrationSchema = yup.object().shape({
  Email: yup.string().email().required(),
  Fname: yup.string().required(),
  Sname: yup.string().required(),
  Pass: yup
    .string()
    .max(50)
    .required()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    ),
  Confirm: yup
    .string()
    .max(50)
    .required()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    ),
  UserType: yup.string().required(),
});

export const loginSchema = yup.object().shape({
  Email: yup.string().email().required(),
  Pass: yup
    .string()
    .min(8)
    .max(50)
    .required(),
});

export const updateGroupNameSchema = yup.object().shape({
  Name: yup.string().required(),
});

export const updatePassSchema = yup.object().shape({
  Pass: yup
    .string()
    .min(8)
    .max(50)
    .required()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    ),
});

export const createGroupSchema = yup.object().shape({
  GroupName: yup.string().max(100),
  Password: yup
    .string()
    .min(8)
    .max(50)
    .required()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    ),
  Confirm: yup.string().min(8).max(50).required(),
});

export const postQuestionSchema = yup.object().shape({
  title: yup.string().max(50).required(),
  textBody: yup.string().min(8).max(1000).required(),
});

export const postCommenSchema = yup.object().shape({
  textBody: yup.string().max(500).required(),
});

export const createQuizInfoSchema = yup.object().shape({
  title: yup.string().max(50).required(),
  type: yup.string().required(),
  start: yup.string().required(),
  end: yup.string().required(),
});

export const createQuizSchema = yup.object().shape({
  question: yup.string().max(250).required()
});

export const messageSchema = yup.object().shape({
  textBody: yup.string().max(1000).required()
});
