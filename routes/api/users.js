module.exports = function (app) {
  const db = require("../../models");
  const passport = require("passport");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const keys = require("../../config/keys");
  require("dotenv").config();

  const multer = require("multer");
  var multerS3 = require('multer-s3')
  var AWS = require("aws-sdk");
  var s3 = new aws.S3({ /* ... */ })
  var storage = multer.memoryStorage();
  var upload = multer({ storage: storage });

 

  // Test Routes
  app.get("/users/noAuthTest", (req, res) => {
    res.json({
      msg: "Users route works (no auth)",
    });
  });

  app.get(
    "/users/test",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      res.json({
        msg: "users routes works!",
      });
    }
  );

  // GET ROUTE

  app.get(
    "/api/user",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      db.User.findById(req.user.id)
        .then((user) => {
          if (user) {
            res.status(200).json(user);
          }
        })
        .catch((err) => console.log(err));
    }
  );

  //Create new user POST ROUTE

  app.post("/upload", upload.single("file"), function(req, res) {
    const file = req.file;
    const s3FileURL = process.env.AWS_UPLOADED_FILE_URL_LINK;
  
    let s3bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  
    console.log(process.env.AWS_ACCESS_KEY_ID);
    console.log(process.env.AWS_SECRET_ACCESS_KEY);
  
    //Where you want to store your file
  
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read"
    };
  console.log(params)
    s3bucket.upload(params, function(err, data) {
      if (err) {
        res.status(500).json({ error: true, Message: err });
      } else {
        res.send({ data });
        var newFileUploaded = {
        //   description: req.body.description,
          fileLink: s3FileURL + file.originalname,
          s3_key: params.Key
        };
        var document = new DOCUMENT(newFileUploaded);
        document.save(function(error, newFile) {
          if (error) {
            throw error;
          }
        });
      }
    });
  });
  

  // LOGIN

  app.post("/api/user/login", (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    db.User.findOne({ email: email })
      .then((user) => {
        // console.log("********************",user)
        if (!user) {
          return res.status(404).json({ user: "User not found" });
        }
        // let currentUser = user.get()
        // TypeError: Cannot read property 'replace' of undefined
        bcrypt
          .compare(password, user.password)
          .then((isMatch) => {
            if (isMatch) {
              // console.log("bycrypt user", user._id)
              db.User.findById(user._id)
                .then((user) => {
                  // console.log("###############", user)
                  const payload = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                  };
                  jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 * 12 },
                    (err, token) => {
                      res.json({
                        ...payload,
                        success: true,
                        token: `Bearer ${token}`,
                        // GOOD FOR 12 HOURS
                      });
                    }
                  );
                })
                .catch((err) => console.log(err));
            } else {
              return res.status(400).json({
                password: "User password could not be validated",
              });
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  });

  // PUT

  app.put(
    "/api/user",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      console.log("put route", req.body);
      db.User.findByIdAndUpdate(req.user.id, { $set: req.body })
        .then((user) => {
          res.status(200).json({
            message: "User account successfully created.",
            userCreated: true,
          });
        })
        .catch((err) => console.log(err));
    }
  );


  app.post('/api/upload', upload.single('file'), (req,res)=>{
    console.log('**********************************'+ req +'*****************************')
    const file = req.file
    const s3FileURL = process.env.AWS_UPLOADED_FILE_URL_LINK

    let s3bucket = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    })

    var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
      };

      s3bucket.upload(params, function(err, data) {
        if (err) {
          res.status(500).json({ error: true, Message: err });
        } else {
          res.send({ data });
          var newFileUploaded = {
            description: req.body.description,
            fileLink: s3FileURL + file.originalname,
            s3_key: params.Key
          };
          var document = new DOCUMENT(newFileUploaded);
          document.save(function(error, newFile) {
            if (error) {
              throw error;
            }
          });
        }
      });
})

  // end
};
