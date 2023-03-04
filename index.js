const express = require('express');
const bodyPparser = require('body-parser');
const { Users } = require('./database/database');
const { schemaUser } = require('./validate/validate');
const helmet = require('helmet');
const app = express();
const PORT = 8080;
app.use(helmet())
app.use(bodyPparser.urlencoded({ extended: true }))
app.post("/users/signup", async (req, res) => {
    const { value, error } = schemaUser.validate(req.body)
    if (error) {
        res.json(error.message)

    } else if ((await Users.find({ email: req.body.email })).length > 0) {
        res.json({
            res: false,
            mes: "Email is exist!"
        })
    } else {
        let user = new Users(req.body)
        await user.save()
        res.json({
            res: true,
            mes: "Succeeful"
        })
    }

})
app.listen(process.env.PORT || PORT)

