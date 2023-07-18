const { log } = require("console");
const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject.userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Book saved successfully!" }))
    .catch((error) => res.status(400).json({ error, request: req.body }));
};

exports.rateBook = (req, res, next) => {
  const ratingObject = req.body;
  delete ratingObject.userId;

  Book.findOne({ _id: req.params.id }).then((book) => {
    if (book.ratings.find((rating) => rating.userId === req.auth.userId)) {
      return res.status(400).json({ error: "You already rated this book!" });
    } else {
      const newRating = {
        userId: req.auth.userId,
        grade: ratingObject.rating,
      };
      const newAverageRating =
        book.ratings.reduce(
          (acc, rating) => acc + rating.grade,
          newRating.grade
        ) /
        (book.ratings.length + 1);

      Book.updateOne(
        { _id: req.params.id },
        {
          $push: { ratings: newRating },
          averageRating: newAverageRating,
        }
      )
        .then(() => {
          Book.findOne({ _id: req.params.id })
            .then((book) => res.status(201).json(book))
            .catch((error) => res.status(404).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
    }
  });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      const bestBooks = books
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3);
      res.status(200).json(bestBooks);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.updateBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject.userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ error: "Unauthorized request" });
      } else {
        if (req.file) {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {});
        }

        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() =>
            res.status(200).json({ message: "Book updated successfully!" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ error: "Unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() =>
              res.status(200).json({ message: "Book deleted successfully!" })
            )
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
