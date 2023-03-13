const Joi = require("joi");

const validationUser = (data) => {
  const userSchema = Joi.object({
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().min(8).max(20).required(),
  });
  return userSchema.validate(data);
};

const validationPassword = (data) => {
  const userSchema = Joi.object({
    password: Joi.string().min(8).max(20).required(),
  });
  return userSchema.validate(data);
};

module.exports = { validationUser, validationPassword };
