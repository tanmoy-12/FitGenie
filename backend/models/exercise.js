const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Define the exercise schema and model
const exerciseSchema = new mongoose.Schema({
    exerciseName: { type: String, required: true },
    exerciseType: { type: String, required: true },
    exerciseDuration: { type: Number, required: true },
    exerciseMuscleGroup: { type: String, required: true },
    difficultyLevel: { type: String, required: true },
    exerciseCategory: { type: String, required: true },
    details: { type: String, required: true },
    equipments: [{ type: String }],
    benefits: { type: String, required: true },
    limitations: { type: String, required: true },
    images: [{ type: String }],
    videos: [{ type: String }],
    procedures: [{ type: String, required: true }],
    precautions: { type: String, required: true },
});

module.exports = mongoose.model('Exercise', exerciseSchema);