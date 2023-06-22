const router = require('express').Router();
const { createBook, getBooks, getBooksById, updateBook, deleteBookById } = require('../controller/bookController');
const { createReview, updateReview, deletedReview } = require('../controller/reviewController');
const { userRegister, userLogin } = require('../controller/userController');
const { authentication } = require('../middlewares/authMidd');




//=======================user routes======================
router.post("/register", userRegister)
router.post('/login', userLogin)


//======================= Book routes======================

router.post('/books', authentication, createBook)
router.get('/books',getBooks)
router.get('/books/:bookId',getBooksById)
router.put('/books/:bookId', authentication, updateBook)
router.delete('/books/:bookId', authentication, deleteBookById)

// ===================== review routes ====================

router.post('/books/:bookId/review', createReview)
router.put('/books/:bookId/review/:reviewId', updateReview)
router.delete('/books/:bookId/review/:reviewId', deletedReview)

module.exports = router