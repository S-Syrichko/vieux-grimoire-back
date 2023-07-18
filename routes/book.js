const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");

const bookCtrl = require("../controllers/book");

router.post("/", auth, multer, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestBooks);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, bookCtrl.updateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);


module.exports = router;