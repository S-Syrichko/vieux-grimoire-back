const { BookError, RequestError } = require("../error/customError.js");
const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = async (req, res, next) => {
  try {
    if (!req.file) throw new RequestError(400, "Fichier manquant");
    //Get body
    const book = new Book(JSON.parse(req.body.book || "{}"));
    const validationError = book.validateSync();
    if (!req.body.book || validationError) {
      throw new RequestError(400, "Données invalides");
    }

    //Modify book
    book.userId = req.auth.userId;
    book.imageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;

    //Save Book
    const saveBook = await book.save();
    if (!saveBook) {
      throw new BookError(500, "Erreur lors de la création du livre");
    }

    //Send response
    res.status(201).json({ message: "Book saved successfully!" });
  } catch (err) {
    next(err);
  }
};

exports.rateBook = async (req, res, next) => {
  try {
    //Get body
    const { userId, rating } = req.body;
    if (!userId || !rating || !req.params.id)
      throw new RequestError(400, "Données invalides");
    if (userId !== req.auth.userId)
      throw new RequestError(403, "Requête non authorisée");

    //Find book
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) throw new BookError(404, "Livre non trouvé");
    if (book.ratings.find((rating) => rating.userId === req.auth.userId)) {
      throw new BookError(409, "Livre déjà noté par l'utilisateur");
    }

    //Modify book
    const newRating = {
      userId: req.auth.userId,
      grade: rating,
    };
    const newAverageRating =
      book.ratings.reduce(
        (acc, rating) => acc + rating.grade,
        newRating.grade
      ) / (book.ratings.length + 1 || 1);

    book.ratings.push(newRating);
    book.averageRating = newAverageRating;

    //Save book
    const saveBook = await book.save();
    if (!saveBook)
      throw new BookError(500, "Erreur lors de la sauvegarde du livre");

    //Send response
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    if (!books) throw new BookError(404, "Aucun livre trouvé");

    //Send response
    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
};

exports.getBestBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    if (!books) throw new BookError(404, "Aucun livre trouvé");
    const bestBooks = books
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);

    //Send response
    res.status(200).json(bestBooks);
  } catch (err) {
    next(err);
  }
};

exports.getOneBook = async (req, res, next) => {
  try {
    if (!req.params.id) throw new RequestError(400, "Données invalides");
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) throw new BookError(404, "Livre non trouvé");

    //Send response
    res.status(200).json(book);
  } catch {
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    if (!req.params.id) throw new RequestError(400, "Données invalides");

    //Get body and file
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    delete bookObject.userId;

    //Find book
    let book = await Book.findOne({ _id: req.params.id });
    if (!book) throw new BookError(404, "Livre non trouvé");
    if (book.userId !== req.auth.userId)
      throw new RequestError(403, "Requête non authorisée");

    //Update image
    if (req.file) {
      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {});
    }
    
    //Update book
    Object.assign(book, bookObject);
    const updateBook = await book.save();
    if (!updateBook)
      throw new BookError(500, "Erreur lors de la mise à jour du livre");

    //Send response
    res.status(200).json({ message: "Book updated successfully!" });
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    if (!req.params.id) throw new RequestError(400, "Données invalides");

    //Find book
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) throw new BookError(404, "Livre non trouvé");
    if (book.userId !== req.auth.userId)
      throw new RequestError(403, "Requête non authorisée");

    //Delete book
    const deleteBook = await Book.deleteOne({ _id: req.params.id });
    if (deleteBook.deletedCount === 0)
      throw new BookError(500, "Erreur lors de la suppression du livre");

    //Delete image
    const filename = book.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {});

    //Send response
    res.status(200).json({ message: "Book deleted successfully!" });
  } catch (err) {
    next(err);
  }
};
