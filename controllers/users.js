const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");

const UsersController = {
  New: (req, res) => {
    res.render("users/new");
  },

  Create: (req, res) => {
    const user = new User();
    let errorMessage = "";
    user.name = req.body.name;
    user.email = req.body.email;

    if (req.body.password1 === req.body.password2) {
      let plainPassword = req.body.password1;
      let passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
      let nameRegex = /^[a-zA-Z ,.'-]+$/;
      if (plainPassword.match(passwordRegex) && user.name.match(nameRegex)) {
        bcrypt.hash(req.body.password1, 10, (err, hash) => {
          if (err) {
            throw err;
          }
          user.password = hash;
          user.save((err) => {
            if (err) {
              errorMessage = "Email already exists.";
              res.render("users/new", { error: errorMessage });
              // throw err;
            } else {
              req.session.user = user;
              res.status(201).redirect("/posts");
            }
          });
          console.log(user.password);
        });
      } else if (!user.name.match(nameRegex)) {
        errorMessage = "Please enter a valid name";
        res.render("users/new", { error: errorMessage });
      } else {
        errorMessage =
          "Password must be 8-15 characters and contain an uppercase, lowercase, numeric and special character";
        res.render("users/new", { error: errorMessage });
      }
    } else {
      errorMessage = "Passwords do not match";
      res.render("users/new", { error: errorMessage });
    }
  },

  ProfileIndex: (req, res) => {
    Post.find({ user_id: req.session.user._id }, (err, posts) => {
      if (err) {
        throw err;
      }
      posts.forEach((post) => {
        post.owner = req.session.user._id == post.user_id;
        post.comments.forEach((comment) => {
          comment.comment_owner = req.session.user._id == comment.user_id;
        });
      });

      // User.findById(req.session.user._id, (err, user) => {
      //   if (err) {
      //     throw err;
      //   }

        let notRequestedFriendship = true;
        console.log(req.session.user.friendRequests.length);
        if (req.session.user.friendRequests.length == 0){
          notRequestedFriendship = false;
        }
      
        res.render("users/account", {
          title: "Profile page",
          session: req.session,
          posts: posts,
          notRequestedFriendship: notRequestedFriendship
        });
      // })

      
    }).sort({ createdAt: -1 });
  },

  PublicIndex: (req, res) => {
    Post.find({ user_id: req.params.id }, (err, posts) => {
      if (err) {
        throw err;
      }
      posts.forEach((post) => {
        post.owner = req.session.user._id == post.user_id;
        post.comments.forEach((comment) => {
          comment.comment_owner = req.session.user._id == comment.user_id;
        });
      });
      User.findById(req.params.id, (err, user) => {
        if (err) {
          throw err;
        }

        let isNoFriend = true;
        req.session.user.friends.forEach((friend) => {
          if (friend.id == user._id  || req.session.user._id == user._id) {
            isNoFriend = false;
          } 
        })

        user.friendRequests.forEach((friend) => {
          if (friend.id == req.session.user._id) {
            isNoFriend = false;
          } 
        })
  
        res.render("users/publicAccount", {
          currentAccount: user,
          session: req.session,
          posts: posts,
          isNoFriend: isNoFriend
        });
      });
    }).sort({ createdAt: -1 });
  },

  Image: (req, res) => {
    // find a user by id in mongodb
    User.findById(req.session.user._id, (err, user) => {
      // change the image property of the user in database and session
      user.photo_link = req.file.filename;
      req.session.user.photo_link = req.file.filename;
      // find and change the image property of all posts by that user
      Post.find({ user_id: req.session.user._id }, (err, posts) => {
        posts.forEach((post) => {
          post.photo_link = req.file.filename;
          post.save((err) => {
            if (err) {
              throw err;
            }
          });
        });
      });
      user.save((err) => {
        if (err) {
          throw err;
        }
        res.status(201).redirect("/users/account");
      });
    });
  },

  RequestFriend: (req, res) => {
    User.findById(req.body.friend_id, (err, user) => {
      let requestedFriendObject = {
        name: req.session.user.name,
        id: req.session.user._id
      }
      user.friendRequests.push(requestedFriendObject);
      user.save((err) => {
        if (err) {
          throw err;
        }
      })
    })
    res.status(201).redirect("/users/"+ req.body.friend_id);
  },

  

  // assumes we are getting the id of the user who we want to be friends with as req.body.user_id
  AddFriend: (req, res) => {
    // Saving the new friend's id in our friend-array
    User.findById(req.session.user._id, (err, user) => {

      let friendObject = {
        name: req.body.friend_name,
        id: req.body.friend_id
      }

      user.friends.push(friendObject);

      for (let i = 0; i < user.friendRequests.length; i++){
        if (user.friendRequests[i].id === req.body.friend_id){
          user.friendRequests.splice(i, 1);
        }
      }

      user.save((err) => {
        if (err) {
          throw err;
        }
      })
    })

    // Saving our id into our new friend's friend-array
    User.findById(req.body.friend_id, (err, user) => {

      let friendObject = {
        name: req.session.user.name,
        id: req.session.user._id
      }

      user.friends.push(friendObject);
      user.save((err) => {
        if (err){
          throw err;
        }
      })
    })
    res.status(201).redirect("/posts");
  },

  DeclineFriend: (req, res) =>{
    User.findById(req.session.user._id, (err, user) => {
      
      for (let i = 0; i < user.friendRequests.length; i++){
        if (user.friendRequests[i].id === req.body.friend_id){
          user.friendRequests.splice(i, 1);
        }
      }
      user.save((err) => {
        if (err){
          throw err;
        }
      })
    })
    res.status(201).redirect("/users/account");
  }
};

module.exports = UsersController;
