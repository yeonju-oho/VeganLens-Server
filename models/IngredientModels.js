
const mongoose = require('../db');

const Categories = {
    MILK: "milks",
    EGG: "eggs",
    SEAFOOD: "seafoods",
    WHITEMEAT: "whitemeats",
    REDMEAT: "redmeats",
}

// 식단 유형 정의
const VeganTypes = {
    VEGAN: 1,
    LACTO: 2,
    OVO: 3,
    LACTO_OVO: 4,
    PESCO: 5,
    POLLO: 6,
    FLEXITARIAN: 7
};

// Define the schema for ingredients
const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true } // Single name field for both Korean and English
});

// 첫문자만 대문자로 변경
function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Create models dynamically using the Category enum
const models = {};
for (const [key, value] of Object.entries(Categories)) {
    models[value] = mongoose.model(capitalizeFirstLetter(key), ingredientSchema, value);
}

// 공통 검색 로직을 수행하는 헬퍼 함수
async function findIngredientInModel(ingredient, model) {
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const escapedIngredient = escapeRegExp(ingredient);
    const regexPattern = `^${escapedIngredient.split('').join('\\s*')}$`;

    return await model.findOne({
        name: {
            $regex: new RegExp(regexPattern, 'i')
        }
    });
}

// 입력 성분이 모델에 포함되는지 검사하는 함수
async function findIngredient(ingredient) {
    const results = {};

    // 모든 카테고리에서 검색
    for (const [key, collection] of Object.entries(Categories)) {
        const model = models[collection];
        const item = await findIngredientInModel(ingredient, model);

        if (item) {
            results[ingredient] = collection; // 카테고리 키를 반환
            break; // 검색 결과가 발견되면 루프를 종료
        }
    }

    return results;
}

// 입력 성분이 특정 카테고리의 모델에 포함되는지 검사하는 함수
async function checkIngredient(ingredient, category) {
    const model = models[category];
    const item = await findIngredientInModel(ingredient, model);

    return item !== null;
}

// 전체 원재료 목록에 대한 섭취 가능한 식단 유형을 결정하는 함수
function determineSuitableVeganTypes(results) {
    const ingredientCategories = new Set(Object.values(results));

    if (ingredientCategories.has(Categories.REDMEAT)) {
        return [VeganTypes.FLEXITARIAN];
    }
    if (ingredientCategories.has(Categories.WHITEMEAT)) {
        return [VeganTypes.FLEXITARIAN, VeganTypes.POLLO];
    }
    if (ingredientCategories.has(Categories.SEAFOOD)) {
        return [VeganTypes.FLEXITARIAN, VeganTypes.POLLO, VeganTypes.PESCO];
    }

    isEggs = ingredientCategories.has(Categories.EGG);
    isMilks = ingredientCategories.has(Categories.MILK);

    if (isEggs && isMilks) {
        return [VeganTypes.FLEXITARIAN, VeganTypes.POLLO, VeganTypes.PESCO, VeganTypes.LACTO_OVO];
    } else if (isEggs) {
        return [VeganTypes.FLEXITARIAN, VeganTypes.POLLO, VeganTypes.PESCO, VeganTypes.LACTO_OVO, VeganTypes.OVO];
    } else if (isMilks) {
        return [VeganTypes.FLEXITARIAN, VeganTypes.POLLO, VeganTypes.PESCO, VeganTypes.LACTO_OVO, VeganTypes.LACTO];
    } else {
        // 아무 제한이 없는 경우 모든 VeganTypes 반환
        return Object.values(VeganTypes);
    }
}

module.exports = { Categories, models, findIngredient, checkIngredient, determineSuitableVeganTypes};
