const router = require("express").Router();
const User = require("./users-model");

const restricted = require("../auth/restricted");

const { isValid } = require("./users-service");

router.use(restricted);

router.get("/", (req, res) => {
    User.find()
        .then(users => {
            res.status(200).json({ users, jwt: req.jwt })
        })
        .catch(err =>{
            res.status(500).json({ message: err.message })
        })
})

router.post("/", checkRoles(["admin"]), (req, res) => {
    const user = req.body;

    if(isValid(user)) {
        User.add(user)
            .then(saved => {
                res.status(201).json({ data: saved });
            })
            .catch(err => {
                res.status(500).json({ error: err.message })
            })
    } else {
        res.status(400).json({ message: "provide user info" })
    }
})

function checkRoles(roles) {
    return function (req, res, next) {
      const role = req.jwt.role;
  
      if (req.jwt && req.jwt.role && roles.includes(role)) {
        next();
      } else {
        res.status(403).json({ you: "have no power here" });
      }
    };
  }
  
  module.exports = router;