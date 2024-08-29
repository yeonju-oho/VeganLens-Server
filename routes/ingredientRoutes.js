
const express = require('express');
const router = express.Router();
const { models, findIngredient, checkIngredient, determineSuitableVeganTypes } = require('../models/IngredientModels');
const { Categories } = require('../models/define');

// POST /add-ingredient - 새로운 성분을 특정 카테고리에 추가하는 API
router.post('/add-ingredient', async (req, res) => {
    const { category, name } = req.body;

    // 입력 값이 없는 경우 에러 응답
    if (!category || !name) {
        return res.status(400).json({ error: "카테고리와 성분 이름이 필요합니다." });
    }

    // 유효한 카테고리인지 확인
    if (!Object.values(Categories).includes(category)) {
        return res.status(400).json({ error: "카테고리가 존재하지 않습니다." });
    }

    try {
        // 성분이 이미 존재하는지 확인
        if (await checkIngredient(name, category)) {
            return res.status(400).json({ error: `${name}은 이미 ${category}에 존재합니다.` });
        }

        // 새로운 성분 추가
        const model = models[category];
        const newItem = new model({ name });
        await newItem.save();

        res.status(201).json({ message: `${name}이(가) ${category}에 성공적으로 추가되었습니다.` });
    } catch (error) {
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});

// GET /check-ingredients - 원재료 목록을 검사하는 API
router.get('/check-ingredients', async (req, res) => {
    const { items } = req.query;

    // 입력 값이 없는 경우 에러 응답
    if (!items) {
        return res.status(400).json({ error: "원재료 목록이 필요합니다." });
    }

    // 콤마로 구분된 경우 문자열을 배열로 변환
    const ingredientList = items.split(',').map(item => item.trim());

    try {
        // 각 원재료를 검사하여 결과를 저장
        const results = {};
        for (const ingredient of ingredientList) {
            const result = await findIngredient(ingredient);
            if (Object.keys(result).length > 0) {
                results[ingredient] = result[ingredient];
            }
        }        
        
        // 어느 비건 등급까지 먹을 수 있는지 결과 가져오기
        const suitableVeganTypes = determineSuitableVeganTypes(results);

        res.json({
            ingredients: results,
            suitableVeganTypes: suitableVeganTypes
        });
    } catch (error) {
        console.error('Error checking ingredients:', error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});


// GET /ingredients/:category - 카테고리별 모든 재료를 가져오는 API
router.get('/ingredients/:category', async (req, res) => {
    const { category } = req.params;

    // 카테고리 이름이 유효한지 확인
    if (!Object.values(Categories).includes(category)) {
        return res.status(400).json({ error: "유효하지 않은 카테고리입니다." });
    }

    try {
        // 해당 카테고리의 모델 가져오기
        const model = models[category];

        // 모든 재료 가져오기
        const ingredients = await model.find({}, 'name');

        // 결과 반환
        res.json({
            category: category,
            ingredients: ingredients.map(item => item.name)
        });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});

// DELETE /ingredients/:category/:name 특정 카테고리에서 원재료를 삭제하는 API
router.delete('/ingredients/:category/:name', async (req, res) => {
    const { category, name } = req.params;

    // 카테고리 이름이 유효한지 확인
    if (!Object.values(Categories).includes(category)) {
        return res.status(400).json({ error: "유효하지 않은 카테고리입니다." });
    }

    try {
        // 해당 카테고리의 모델 가져오기
        const model = models[category];

        // 원재료 삭제
        const result = await model.findOneAndDelete({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (result) {
            res.json({
                message: `"${name}" 원재료가 ${category} 카테고리에서 성공적으로 삭제되었습니다.`,
                deletedIngredient: result.name
            });
        } else {
            res.status(400).json({ error: `${name} 원재료를 ${category} 카테고리에서 찾을 수 없습니다.` });
        }
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});

module.exports = router;
