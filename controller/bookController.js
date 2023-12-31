const bookModel = require('../models/bookModel');
const validator = require('validator');
const { ObjectIdCheck } = require('../utils/verification');
const reviewModel = require('../models/reviewModel');
const userModel = require('../models/userModel');


const createBook = async (req, res) => {
    try {
        const { title, excerpt, releasedAt, userId, subcategory, category, ISBN } = req.body
        if (!title || !excerpt || !userId || !subcategory || !category || !ISBN || !releasedAt) {
            return res.status(400).json({ status: false, message: 'All fields are required' });
        }
        if (!ObjectIdCheck(userId)) {
            return res.status(400).json({ status: false, message: 'User Id is invalid' });
        }
        const titleBook = await bookModel.findOne({ title: title });
        if (titleBook) {
            return res.status(400).json({ status: false, message: 'Title already exists' });
        }
        const user = await userModel.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User does not exist' });
        }
        else {
            const IsbnBook = await bookModel.findOne({ ISBN: ISBN });
            if (IsbnBook) {
                return res.status(400).json({ status: false, message: 'ISBN already exists' });
            }
            else {
                const book = await bookModel.create(req.body)
                res.status(201).json({ status: true, data: book });
            }
        }
    } catch (error) {
        if (error.message.includes('validation')) {
            return res.status(400).send({ status: false, message: error.message })
        } else if (error.message.includes('duplicate')) {
            return res.status(400).send({ status: false, message: error.message })
        } else {
            res.status(500).json({ status: false, message: error.message })
        }
    }
}




const getBooks = async (req, res) => {
    try {
        const value = req.query;
        const books = await bookModel.find({ ...value, isDeleted: false }).sort({ title: 1 });
        if (books.length == 0) {
            return res.status(404).json({ status: false, message: 'No books found' });
        }
        res.status(200).json({ status: true, message: 'Books list', data: books });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}


const getBooksById = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        if (!ObjectIdCheck(bookId)) {
            return res.status(400).json({ status: false, message: 'Book Id is invalid' });
        }
        const book = await bookModel.findById(bookId)
        if (!book) {
            return res.status(404).json({ status: false, message: 'Book does not exist' });
        }
        const reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false });
        book.reviewsData = reviewsData;
        res.status(200).json({ status: true, data: book });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}

const updateBook = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        if (!bookId) {
            return res.status(404).json({ status: false, message: 'Book Id is required' });
        }
        if (!ObjectIdCheck(bookId)) {
            return res.status(400).json({ status: false, message: 'Book Id is invalid' });
        }
        
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!book) {
            return res.status(404).json({ status: false, message: 'Book does not exist' });
        }
        if (book.userId != req.userId) {
            return res.status(403).json({ status: false, message: 'Access denied' });
        }
        const updateBookData = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, req.body, { new: true });
        res.status(200).json({ status: true, message: "Update book Success", data: updateBookData });

    } catch (error) {
        if (error.message.includes('validation')) {
            return res.status(400).send({ status: false, message: error.message })
        } else if (error.message.includes('duplicate')) {
            return res.status(400).send({ status: false, message: error.message })
        } else {
            res.status(500).json({ status: false, message: error.message })
        }
    }
}


const deleteBookById = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        if (!ObjectIdCheck(bookId)) {
            return res.status(400).json({ status: false, message: 'Book Id is invalid' });
        }
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!book) {
            return res.status(404).json({ status: false, message: 'Book does not exist' });
        }
        if (book.userId != req.userId) {
            return res.status(403).json({ status: false, message: 'Access denied' });
        }
        const deleteBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });
        res.status(200).json({ status: true, message: "Delete book Successfully" });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ status: false, message: error.message });
        }
        res.status(500).json({ status: false, message: error.message });
    }
}
module.exports = {
    createBook,
    getBooks,
    getBooksById,
    updateBook,
    deleteBookById
}