const { GoogleGenAI } = require("@google/genai");
const productModel = require("../models/productModel");
const { convertQuantity } = require("../utils/productUnits");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const getModelFallbacks = (environmentVariable, defaults) => {
    const configuredModels = process.env[environmentVariable];
    const configuredList = (configuredModels ? configuredModels.split(",") : defaults)
        .map((model) => model.trim())
        .filter(Boolean);
    const models = [...new Set(configuredList)];
    return (models.length ? models : defaults).slice(0, 3);
};

const isRetryableModelError = (error) => {
    const status = Number(error.status || error.statusCode);
    const code = String(error.code || error.cause?.code || "").toUpperCase();
    const message = String(error.message || "").toUpperCase();

    return [408, 429, 500, 502, 503, 504].includes(status) ||
        (status === 404 && /NOT_FOUND|MODEL/i.test(`${code} ${message}`)) ||
        ["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "ECONNREFUSED"].includes(code) ||
        ["RESOURCE_EXHAUSTED", "UNAVAILABLE", "DEADLINE_EXCEEDED"].some((reason) =>
            code.includes(reason) || message.includes(reason)
        );
};

const generateContentWithFallback = async ({ models, contents, config }) => {
    let lastError;

    for (const [index, model] of models.entries()) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    ...config,
                    httpOptions: {
                        ...config.httpOptions,
                        timeout: 20000,
                        retryOptions: { attempts: 1 },
                    },
                },
            });

            if (index > 0) {
                console.info(`SmartieAI recovered using fallback model "${model}".`);
            }
            return response;
        } catch (error) {
            lastError = error;
            if (!isRetryableModelError(error) || index === models.length - 1) {
                throw error;
            }

            const status = error.status || error.statusCode || error.code || "unknown";
            console.warn(`SmartieAI model "${model}" failed (${status}); trying the next configured model.`);
        }
    }

    throw lastError;
};

const ignoredIngredientWords = new Set([
    "fresh", "dried", "chopped", "diced", "minced", "large", "small", "medium",
    "cup", "cups", "tbsp", "tsp", "tablespoon", "tablespoons", "teaspoon", "teaspoons",
    "kg", "g", "l", "ml", "piece", "pieces",
]);

const normalizeWords = (value) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => {
            if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
            if (word.endsWith("oes") && word.length > 4) return word.slice(0, -2);
            if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) return word.slice(0, -1);
            return word;
        })
        .filter((word) => !/^\d+(\.\d+)?$/.test(word) && !ignoredIngredientWords.has(word));

const getProductMatch = (ingredientName, products) => {
    const ingredientWords = normalizeWords(ingredientName);
    let bestMatch = null;
    let bestScore = 0;

    products.forEach((product) => {
        if (product.stocks <= 0) return;
        const names = [product.name, ...(product.aliases || [])].map(normalizeWords);
        const score = names.reduce((best, productWords) => {
            const matches = ingredientWords.filter((word) => productWords.includes(word));
            const coverage = ingredientWords.length ? matches.length / ingredientWords.length : 0;
            const precision = productWords.length ? matches.length / productWords.length : 0;
            return Math.max(best, coverage * 0.75 + precision * 0.25);
        }, 0);

        if (score > bestScore) {
            bestMatch = product;
            bestScore = score;
        }
    });

    return bestScore >= 0.5 ? bestMatch : null;
};

const getProductMatches = (searchTerm, products) => {
    const searchWords = normalizeWords(searchTerm);
    if (!searchWords.length) return [];

    return products
        .map((product) => {
            const names = [product.name, ...(product.aliases || [])].map(normalizeWords);
            const score = names.reduce((best, productWords) => {
                const matches = searchWords.filter((word) => productWords.includes(word));
                const coverage = matches.length / searchWords.length;
                const precision = productWords.length ? matches.length / productWords.length : 0;
                return Math.max(best, coverage * 0.75 + precision * 0.25);
            }, 0);
            return { product, score };
        })
        .filter(({ score }) => score >= 0.5)
        .sort((left, right) => right.score - left.score)
        .slice(0, 5)
        .map(({ product }) => product);
};

const findProductsForIngredient = async (ingredientName) => {
    let candidates = [];
    try {
        candidates = await productModel
            .find({ $text: { $search: ingredientName }, stocks: { $gt: 0 } }, { score: { $meta: "textScore" } })
            .select("name aliases unit rate stocks url quantityOptions")
            .sort({ score: { $meta: "textScore" } })
            .limit(100)
            .lean();
    } catch (error) {
        if (
            error.code !== 27 &&
            error.codeName !== "IndexNotFound" &&
            !/text index required for \$text query/i.test(error.message || "")
        ) {
            throw error;
        }
        candidates = [];
    }

    if (candidates.length) return candidates;

    const words = normalizeWords(ingredientName);
    if (!words.length) return [];
    const patterns = words.map((word) => new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    return productModel
        .find({
            stocks: { $gt: 0 },
            $or: patterns.flatMap((pattern) => [{ name: pattern }, { aliases: pattern }]),
        })
        .select("name aliases unit rate stocks url quantityOptions")
        .limit(100)
        .lean();
};

const getQuantityOptions = (product) => {
    const options = (product.quantityOptions || [])
        .map((option) => ({ quantity: Number(option.quantity), unit: option.unit || product.unit || "kg" }))
        .filter((option) =>
            Number.isFinite(option.quantity) &&
            option.quantity > 0 &&
            convertQuantity(option.quantity, option.unit, product.unit || "kg") !== null
        );

    return options;
};

const getSelectableQuantities = (product, recommendedQuantity, maxQuantity) => {
    const productUnit = product.unit || "kg";
    const quantities = getQuantityOptions(product)
        .map((option) => convertQuantity(option.quantity, option.unit, productUnit))
        .filter((quantity) => quantity <= maxQuantity);

    if (Number.isFinite(recommendedQuantity) && recommendedQuantity > 0 && recommendedQuantity <= maxQuantity) {
        quantities.push(recommendedQuantity);
    }

    return [...new Set(quantities)].sort((left, right) => left - right);
};

const getCartQuantity = (product, requestedQuantity, requestedUnit) => {
    const productUnit = product.unit || "kg";
    const options = getQuantityOptions(product)
        .map((option) => convertQuantity(option.quantity, option.unit, productUnit))
        .sort((left, right) => left - right);
    if (!options.length) return null;

    const sourceUnit = requestedUnit || (productUnit === "g" ? "kg" : productUnit === "ml" ? "l" : productUnit);
    const requestedAmount = Number(requestedQuantity);
    const convertedTarget = Number.isFinite(requestedAmount) && requestedAmount > 0
        ? convertQuantity(requestedAmount, sourceUnit, productUnit)
        : null;
    const target = convertedTarget === null ? options[0] : convertedTarget;
    const smallestOption = options[0];
    return Number((Math.ceil(target / smallestOption - 1e-10) * smallestOption).toFixed(10));
};

const parseRecipeResponse = (text) => {
    try {
        return JSON.parse(text);
    } catch (error) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw error;
        return JSON.parse(jsonMatch[0]);
    }
};

const sendChatMessage = async (req, res) => {
    try {
        const { message, history, cartItems } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is not configured.",
            });
        }

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "A message is required.",
            });
        }

        const userMessage = message.trim().slice(0, 1000);

        // Build conversation context
        const conversationHistory = Array.isArray(history)
            ? history
                .slice(-10)
                .filter(
                    (item) =>
                        item &&
                        (item.sender === "user" || item.sender === "bot") &&
                        typeof item.text === "string" &&
                        item.text.trim()
                )
                .map((item) => ({
                    role: item.sender === "user" ? "user" : "model",
                    parts: [{ text: item.text.trim().slice(0, 1000) }],
                }))
            : [];

        // Current user message
        conversationHistory.push({
            role: "user",
            parts: [{ text: userMessage }],
        });

        const cartSummary = Array.isArray(cartItems) && cartItems.length
            ? cartItems
                .slice(0, 30)
                .filter((item) => item && typeof item.name === "string")
                .map((item) => {
                    const quantity = Number(item.quantity);
                    const quantityText = Number.isFinite(quantity)
                        ? `, quantity: ${quantity} ${item.quantityUnit || item.unit || ""}`.trimEnd()
                        : "";
                    return `- ${item.name.trim().slice(0, 120)}${quantityText}`;
                })
                .join("\n")
            : "The user's cart is currently empty.";

        const isRecipeRequest = /\b(recipe|recipes|cook|cooking|meal|dish|prepare)\b|what can i make|based on.{0,20}(cart|ingredient)|using.{0,20}cart/i.test(userMessage);

        if (isRecipeRequest) {
            const recipePrompt = `Create one practical recipe for the user's request. Use cart ingredients when relevant, but include every additional ingredient the recipe needs. Estimate the recipe amount for each ingredient and a practical shopping quantity. Use only kg, g, l, ml, or piece as cartUnit; use kg for mass, l or ml for volume, and piece for counted items. Return only valid JSON with this exact structure:
{
  "reply": "A short, engaging, conversational message to the user introducing the recipe and mentioning that matching ShopSmart products are listed and if they wish they can add it to their cart.",
  "title": "Recipe title",
  "servings": "Servings text",
  "prepTime": "Preparation time",
  "cookTime": "Cooking time",
    "ingredients": [{ "name": "ingredient", "quantity": "amount", "unit": "unit", "cartQuantity": 0.5, "cartUnit": "kg" }],
  "instructions": ["step 1", "step 2"]
}
Do not include Markdown fences or any text outside the JSON. Keep ingredient names specific enough to match grocery products. Cart contents: ${cartSummary}\n\nUser request: ${userMessage}`;

            const recipeResponse = await generateContentWithFallback({
                models: getModelFallbacks("GEMINI_RECIPE_MODELS", [
                    "gemini-3.6-flash",
                    "gemini-3.5-flash",
                ]),
                contents: recipePrompt,
                config: {
                    temperature: 0.4,
                    maxOutputTokens: 1200,
                    responseMimeType: "application/json",
                },
            });

            const recipe = parseRecipeResponse(recipeResponse.text);
            const matchedIngredients = await Promise.all(
                (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).slice(0, 50).map(async (ingredient) => {
                    if (!ingredient || typeof ingredient.name !== "string") return null;
                    const candidates = await findProductsForIngredient(ingredient.name);
                    const product = getProductMatch(ingredient.name, candidates);
                    if (!product) {
                        return { ...ingredient, matchedProduct: null };
                    }

                    const requiredCartQuantity = getCartQuantity(
                        product,
                        ingredient.cartQuantity,
                        ingredient.cartUnit || ingredient.unit
                    );
                    if (requiredCartQuantity === null) {
                        return { ...ingredient, matchedProduct: null };
                    }

                    const existingCartItem = Array.isArray(cartItems)
                        ? cartItems.find((item) => String(item?.id) === product._id.toString())
                        : null;
                    const existingQuantity = convertQuantity(
                        existingCartItem?.quantity || 0,
                        existingCartItem?.quantityUnit || existingCartItem?.unit || product.unit || "kg",
                        product.unit || "kg"
                    ) || 0;
                    const maxQuantity = Math.max(0, Number(product.stocks) - existingQuantity);
                    const quantityToAdd = Math.max(0, requiredCartQuantity - existingQuantity);
                    const recommendedCartQuantity = quantityToAdd > 0
                        ? getCartQuantity(product, quantityToAdd, product.unit || "kg")
                        : 0;
                    const cartQuantityOptions = getSelectableQuantities(
                        product,
                        recommendedCartQuantity,
                        maxQuantity
                    );
                    const cartQuantity = recommendedCartQuantity === 0
                        ? 0
                        : cartQuantityOptions.includes(recommendedCartQuantity)
                            ? recommendedCartQuantity
                            : cartQuantityOptions[cartQuantityOptions.length - 1] || 0;

                    return {
                        ...ingredient,
                        matchedProduct: {
                            id: product._id.toString(),
                            name: product.name,
                            rate: product.rate,
                            stocks: product.stocks,
                            quantityOptions: getQuantityOptions(product),
                            cartQuantityOptions,
                            unit: product.unit || "kg",
                            image: product.url,
                            cartQuantity,
                            requiredCartQuantity,
                            existingQuantity,
                        },
                    };
                })
            );

            return res.status(200).json({
                success: true,
                reply: recipe.reply,
                recipe: { ...recipe, ingredients: matchedIngredients.filter(Boolean) },
            });
        }

        const systemInstruction = `You are SmartieAI, a concise and helpful shopping assistant for ShopSmart. Help users with grocery products, meal ideas, shopping lists, and general store questions. If a request is unrelated, politely guide it back to shopping.

The user's current cart is:
${cartSummary}

When the user asks for a recipe based on their cart, use the listed ingredients as the primary ingredients. Clearly mention any extra ingredients needed, provide concise step-by-step instructions, and do not claim that an ingredient is in the cart unless it is listed above.

Use the full conversation, including earlier turns, to understand follow-up questions. For example, resolve "what about a smaller one?" to the product discussed immediately before. Return only valid JSON with this exact structure:
{
  "reply": "A concise, conversational answer. Do not claim a product is in stock or quote its price; matching live store products are displayed separately.",
  "productQuery": null
}
If the user asks whether a specific store product is available, wants to see/find/buy a product, or asks a product-related follow-up, set productQuery to {"searchTerm":"the specific product name or terms","requestedQuantity":null,"requestedUnit":null}. Include requestedQuantity and requestedUnit only when the user specifies a quantity, using a positive number and one of kg, g, l, ml, or piece. Extract only the product name in searchTerm, not availability or shopping words. Do not set productQuery for general store questions, recipe requests, or general discussion about products.`;

        const response = await generateContentWithFallback({
            models: getModelFallbacks("GEMINI_CHAT_MODELS", [
                "gemini-3.5-flash",
                "gemini-3.6-flash",
            ]),
            contents: conversationHistory,
            config: {
                temperature: 0.7,
                maxOutputTokens: 600,
                systemInstruction,
                responseMimeType: "application/json",
            },
        });
        const assistantResponse = parseRecipeResponse(response.text);
        let reply = typeof assistantResponse.reply === "string" && assistantResponse.reply.trim()
            ? assistantResponse.reply.trim()
            : "How else can I help with your shopping?";
        let products = [];
        const productQuery = assistantResponse.productQuery;

        if (productQuery && typeof productQuery.searchTerm === "string" && productQuery.searchTerm.trim()) {
            const searchTerm = productQuery.searchTerm.trim();
            const candidates = await findProductsForIngredient(searchTerm);
            const matchedProducts = getProductMatches(searchTerm, candidates);
            const requestedQuantity = Number(productQuery.requestedQuantity);
            const requestedUnit = typeof productQuery.requestedUnit === "string"
                ? productQuery.requestedUnit
                : undefined;

            products = matchedProducts.map((product) => {
                const unit = product.unit || "kg";
                const requestedCartQuantity = Number.isFinite(requestedQuantity) && requestedQuantity > 0
                    ? getCartQuantity(product, requestedQuantity, requestedUnit)
                    : null;
                const existingCartItem = Array.isArray(cartItems)
                    ? cartItems.find((item) => String(item?.id) === product._id.toString())
                    : null;
                const existingQuantity = convertQuantity(
                    existingCartItem?.quantity || 0,
                    existingCartItem?.quantityUnit || existingCartItem?.unit || unit,
                    unit
                ) || 0;
                const maxQuantity = Math.max(0, Number(product.stocks) - existingQuantity);
                const availableOptionQuantities = getQuantityOptions(product)
                    .map((option) => convertQuantity(option.quantity, option.unit, unit))
                    .filter((quantity) => quantity <= maxQuantity)
                    .sort((left, right) => left - right);
                const defaultQuantity = requestedCartQuantity && requestedCartQuantity <= maxQuantity
                    ? requestedCartQuantity
                    : requestedCartQuantity
                        ? availableOptionQuantities[availableOptionQuantities.length - 1] || 0
                        : availableOptionQuantities[0] || 0;

                return {
                    id: product._id.toString(),
                    name: product.name,
                    rate: product.rate,
                    stocks: product.stocks,
                    unit,
                    image: product.url,
                    quantityOptions: getSelectableQuantities(product, defaultQuantity, maxQuantity),
                    defaultQuantity,
                    existingQuantity,
                    requestedQuantityUnavailable: requestedCartQuantity > maxQuantity,
                };
            });
            products = products.filter((product) => product.quantityOptions.length > 0);
            if (products.length) {
                reply += `\n\nMatching in-stock products: ${products.map((product) => product.name).join(", ")}.`;
            } else if (matchedProducts.length) {
                reply += `\n\nI found ${matchedProducts.map((product) => product.name).join(", ")}, but no additional quantity can be added right now.`;
            } else {
                reply += `\n\nI couldn't find an in-stock match for "${searchTerm}".`;
            }
        }

        return res.status(200).json({
            success: true,
            reply,
            products,
        });
    } catch (error) {
        console.error("SmartieAI request failed:", error.message);

        return res.status(502).json({
            success: false,
            message: "SmartieAI is unavailable right now. Please try again after some time.",
        });
    }
};

module.exports = { sendChatMessage };