const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = require("express").Router();
const User = require("../users/users-model");

const { isValid } = require("../users/users-service");

router.post("/register", (req, res) => {
    const credentials = req.body;

    if (isValid(credentials)) {
        const rounds = process.env.BCRYPT_ROUNDS || 8;
        const hash = bcryptjs.hashSync(credentials.password, rounds);

        credentials.password = hash;

        User.add(credentials)
            .then(user => {
                res.status(201).json({ user });
            })
            .catch(err => {
                res.status(500).json({ message: err.message });
            })
    } else {
        res.status(400).json({
            message: "provide user and pass"
        })
    }
})

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if(isValid(req.body)) {
        User.findBy({ "u.username": username })
            .then(([user]) => {
                if (user && bcryptjs.compareSync(password, user.password)) {
                    const token = createToken(user);
                    res.status(200).json({ message: "Welcome to our API", token });
                } else {
                    res.status(401).json({ message: "invalid credentials" });
                }
            })
            .catch(err => {
                res.status(500).json({ message: err.message })
            })
    } else {
        res.status(400).json({ message: "please provide user and pass" })
    }
})



function createToken(user) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const secret = process.env.JWT_SECRET || "keepitsecret,keepitsafe";
  
    const options = {
      expiresIn: "1d",
    };
  
    return jwt.sign(payload, secret, options);
  }
  
  module.exports = router;