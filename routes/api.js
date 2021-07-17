/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var mongodb = require('mongodb');
var mongoose = require('mongoose');

const uri = process.env['MONGO_URI']
mongoose.set('useFindAndModify', false);


module.exports = function (app) {

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  var bookSchema = new mongoose.Schema({
    title: {type: String, required: true},
    comments: [String],
    commentcount: Number
  })

  var Book = mongoose.model('Book', bookSchema)


  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, (error, arrayOfResults) => {
        if(!error && arrayOfResults) {
          return res.json(arrayOfResults)
        }
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      if (!title) {
        return res.json('missing required field title')
      }

      var newBook = new Book({
        title: title,
        commentcount: 0
      })

      newBook.save((error, savedBook) => {
        if(!error && savedBook) {
          return res.json(savedBook)
        }
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.remove({}, (error, responseJson) => {
        if (error) {
          console.log(error)
        } else {
          return res.json('complete delete successful')
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      Book.findById(bookid, (error, returnObject) => {
        if (!error && returnObject) {
          return res.json(returnObject)
        } else if (!returnObject) {
          return res.json('no book exists')
        }
      })

    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment) {
        return res.json('missing required field comment')
      }

      Book.findByIdAndUpdate(
        bookid,
        {$push: {comments: comment}, $inc: {commentcount: 1}},
        {new: true},
        (error, updatedBook) => {
          if (!error && updatedBook) {
            return res.json(updatedBook)
          } else if (!updatedBook) {
            return res.json('no book exists')
          }
        }
      )


    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      Book.findByIdAndDelete(bookid, (error, deletedBook) => {
        if (!error && deletedBook) {
          return res.json('delete successful')
        } else if (!deletedBook) {
          return res.json('no book exists')
        }
      })
    });
  
};
