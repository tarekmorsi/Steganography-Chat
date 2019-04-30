const Joi = require('joi');

// const addUserSchema = Joi.object().keys({
//   email: Joi.string().email().required(),
//   password: Joi.string()
// });

module.exports = {

    addUserSchema:  Joi.object().keys({
                      username : Joi.string().min(5).max(10).required(),
                      email : Joi.string().trim().email().required(),
                      password: Joi.string().min(5).max(10).required()
                    }),
    AuthenticateSchema: Joi.object().keys({
                          username : Joi.string().required(),
                          password: Joi.string().required()
                        }),

}
