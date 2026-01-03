import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createQuiz, deleteQuizByNoteId, getQuizByNoteId } from "../controllers/quiz.controller.js";

const router = Router();

router.route('/create-quiz/:noteId').post(verifyJWT, createQuiz);
router.route('/get-quiz/:noteId').get(verifyJWT, getQuizByNoteId);
router.route('/delete-quiz/:noteId').delete(verifyJWT, deleteQuizByNoteId);

export default router;