import Parse from "../parseConfig"
import type { Recipe } from "../types/recipe"

interface JsonRecipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  instructions: string
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  extendedIngredients: Array<{
    id: number
    original: string
  }>
  analyzedInstructions: Array<{
    name: string
    steps: Array<{
      number: number
      step: string
    }>
  }>
}

// Convertir une recette JSON en format de notre application
const convertJsonRecipe = (jsonRecipe: JsonRecipe): Recipe => {
  return {
    title: jsonRecipe.title,
    description: jsonRecipe.summary,
    time: `${jsonRecipe.readyInMinutes} minutes`,
    servings: jsonRecipe.servings,
    image: jsonRecipe.image,
    ingredients: jsonRecipe.extendedIngredients.map((ing) => ing.original),
    steps: jsonRecipe.analyzedInstructions[0]?.steps.map((step) => step.step) || [],
    tags: [
      ...(jsonRecipe.vegetarian ? ["vegetarian"] : []),
      ...(jsonRecipe.vegan ? ["vegan"] : []),
      ...(jsonRecipe.glutenFree ? ["glutenFree"] : []),
    ],
  }
}

export const importJsonRecipes = async (jsonData: JsonRecipe[]): Promise<number> => {
  try {
    console.log(`Importation de ${jsonData.length} recettes depuis JSON`)

    const Recipe = Parse.Object.extend("Recipe")
    let importedCount = 0

    // Traiter les recettes par lots pour éviter de surcharger Parse
    const batchSize = 5
    for (let i = 0; i < jsonData.length; i += batchSize) {
      const batch = jsonData.slice(i, i + batchSize)
      console.log(`Traitement du lot ${i / batchSize + 1}: ${batch.length} recettes`)

      const parseObjects = batch.map((jsonRecipe) => {
        const recipe = new Recipe()
        const convertedRecipe = convertJsonRecipe(jsonRecipe)

        recipe.set("title", convertedRecipe.title)
        recipe.set("description", convertedRecipe.description)
        recipe.set("time", convertedRecipe.time)
        recipe.set("servings", convertedRecipe.servings)
        recipe.set("image", convertedRecipe.image)
        recipe.set("ingredients", convertedRecipe.ingredients)
        recipe.set("steps", convertedRecipe.steps)
        recipe.set("tags", convertedRecipe.tags)
        recipe.set("isVegetarian", jsonRecipe.vegetarian)
        recipe.set("isVegan", jsonRecipe.vegan)
        recipe.set("isGlutenFree", jsonRecipe.glutenFree)
        recipe.set("externalId", jsonRecipe.id.toString())

        return recipe
      })

      await Parse.Object.saveAll(parseObjects)
      importedCount += parseObjects.length
      console.log(`Importé ${importedCount} recettes sur ${jsonData.length}`)
    }

    return importedCount
  } catch (error) {
    console.error("Erreur lors de l'importation des recettes:", error)
    throw error
  }
}

// Fonction pour importer directement les recettes depuis une variable JavaScript
export const importHardcodedRecipes = async (): Promise<number> => {
  // Recettes extraites du snippet fourni
  const hardcodedRecipes: JsonRecipe[] = [
    {
      id: 8,
      title: "Hara bhara kabab",
      image: "https://images.immediate.co.uk/production/volatile/sites/30/2025/02/Hara-bhara-kabab-350de1b.jpg",
      readyInMinutes: 65,
      servings: 1,
      summary:
        "Enjoy these vegan patties which are a popular snack in North India, with a green tint from the spinach. Serve with your favourite chutney – we went for mango",
      instructions:
        "Tip the potatoes into a pan of cold water. Salt well and bring to the boil, then simmer for 12-15 mins until tender. Drain well and set aside to cool.\nHeat 2 tbsp of the oil in a pan over a medium heat and add the garlic cloves. After a few seconds, add the kale, cover and reduce the heat to low for 5 mins. Add the spinach and peas, cover and cook over a low heat for a further 5 mins. Remove from the heat and tip into a food processor. Blitz to a coarse paste.\nTip the paste into a bowl with the boiled potatoes, spices, cornflour and ½ tsp salt. Mash well and divide into 12 slightly flattened balls.\nHeat the remaining oil in a deep frying pan and cook the kebabs for 1-2 mins on each side until golden. Serve with a chutney of your choice.",
      extendedIngredients: [
        { id: 101, original: "500g Maris Piper potatoes , cut into quarters" },
        { id: 102, original: "130ml sunflower oil" },
        { id: 103, original: "2 garlic cloves , finely chopped" },
        { id: 104, original: "50g kale , finely chopped" },
        { id: 105, original: "50g spinach , finely chopped" },
        { id: 106, original: "50g frozen peas" },
        { id: 107, original: "½ tsp chilli powder" },
        { id: 108, original: "1 tsp ground cumin" },
        { id: 109, original: "1 tsp amchur (mango powder)" },
        { id: 110, original: "3 tbsp cornflour" },
        { id: 111, original: "chutney , to serve" },
      ],
      analyzedInstructions: [
        {
          name: "",
          steps: [
            {
              number: 1,
              step: "Tip the potatoes into a pan of cold water. Salt well and bring to the boil, then simmer for 12-15 mins until tender. Drain well and set aside to cool.",
            },
            {
              number: 2,
              step: "Heat 2 tbsp of the oil in a pan over a medium heat and add the garlic cloves. After a few seconds, add the kale, cover and reduce the heat to low for 5 mins. Add the spinach and peas, cover and cook over a low heat for a further 5 mins. Remove from the heat and tip into a food processor. Blitz to a coarse paste.",
            },
            {
              number: 3,
              step: "Tip the paste into a bowl with the boiled potatoes, spices, cornflour and ½ tsp salt. Mash well and divide into 12 slightly flattened balls.",
            },
            {
              number: 4,
              step: "Heat the remaining oil in a deep frying pan and cook the kebabs for 1-2 mins on each side until golden. Serve with a chutney of your choice.",
            },
          ],
        },
      ],
      vegetarian: true,
      vegan: true,
      glutenFree: false,
    },
    {
      id: 6,
      title: "Feta & pea tart",
      image: "https://images.immediate.co.uk/production/volatile/sites/30/2025/02/Feta-and-pea-tart-04f7002.jpg",
      readyInMinutes: 85,
      servings: 8,
      summary:
        "Celebrate spring with this simple savoury tart with peas, mint and feta. You can make it the day before and warm it up in the oven before serving",
      instructions:
        "Make the pastry by blitzing the flour, butter and a pinch of salt together in a food processor until it resembles fine breadcrumbs. Pulse in the egg yolk until a soft dough forms (you may need to add ½ tsp or so of water but do this very slowly and gradually). Tip the mixture out and form into a flat disc before chilling for 15-20 mins. Roll out the pastry on a lightly floured surface until ½cm thick and wide enough to line a 23cm tart tin (loose-bottomed is easiest). Prick the base all over with a fork and chill for 15 mins.\nHeat the oven to 180C/160C fan/gas 4. Line the pastry case with baking parchment and baking beans, then bake for 10 mins. Remove the parchment and beans, and bake for a further 5-10 mins until a light biscuit colour.\nBlitz a third of the peas with the crème fraîche, half the feta, double cream and eggs, then pour into a bowl and mix in the remaining peas, feta and all the herbs. Season well with salt and pepper, then pour into the prepared pastry case. Bake for a further 25-35 mins until the filling is set and golden. Leave to cool a little in the tin before removing and serving. Will keep chilled for 24 hours. Can be served cold, or warm through in a low oven. Serve with a green salad, if you like.",
      extendedIngredients: [
        { id: 101, original: "175g frozen peas , defrosted" },
        { id: 102, original: "200g crème fraîche" },
        { id: 103, original: "200g feta , roughly chopped" },
        { id: 104, original: "300ml double cream" },
        { id: 105, original: "3 eggs" },
        { id: 106, original: "8-10 mint leaves , finely chopped" },
        { id: 107, original: "handful of parsley , finely chopped" },
        { id: 108, original: "green salad , to serve (optional)" },
        { id: 109, original: "250g plain flour , plus extra for rolling out" },
        { id: 110, original: "125g butter , cold, cubed" },
        { id: 111, original: "1 egg yolk (freeze the white for another recipe)" },
      ],
      analyzedInstructions: [
        {
          name: "",
          steps: [
            {
              number: 1,
              step: "Make the pastry by blitzing the flour, butter and a pinch of salt together in a food processor until it resembles fine breadcrumbs. Pulse in the egg yolk until a soft dough forms (you may need to add ½ tsp or so of water but do this very slowly and gradually). Tip the mixture out and form into a flat disc before chilling for 15-20 mins. Roll out the pastry on a lightly floured surface until ½cm thick and wide enough to line a 23cm tart tin (loose-bottomed is easiest). Prick the base all over with a fork and chill for 15 mins.",
            },
            {
              number: 2,
              step: "Heat the oven to 180C/160C fan/gas 4. Line the pastry case with baking parchment and baking beans, then bake for 10 mins. Remove the parchment and beans, and bake for a further 5-10 mins until a light biscuit colour.",
            },
            {
              number: 3,
              step: "Blitz a third of the peas with the crème fraîche, half the feta, double cream and eggs, then pour into a bowl and mix in the remaining peas, feta and all the herbs. Season well with salt and pepper, then pour into the prepared pastry case. Bake for a further 25-35 mins until the filling is set and golden. Leave to cool a little in the tin before removing and serving. Will keep chilled for 24 hours. Can be served cold, or warm through in a low oven. Serve with a green salad, if you like.",
            },
          ],
        },
      ],
      vegetarian: true,
      vegan: false,
      glutenFree: false,
    },
    {
      id: 1,
      title: "Cajun chicken pasta",
      image: "https://images.immediate.co.uk/production/volatile/sites/30/2022/08/Cajun-chicken-one-pot-3f68774.jpg",
      readyInMinutes: 40,
      servings: 6,
      summary:
        "Make a crowd-pleasing pasta dish for dinner. We've taken inspiration from creamy alfredo sauce with Cajun-style seasoning to add a bit of punch.",
      instructions:
        "Heat the olive oil in a large, shallow saucepan or deep frying pan over a medium heat, then add the chicken, season lightly and fry for 6-8 mins, stirring occasionally until just golden all over – no need to worry about it being cooked through at this stage.\nStir in the garlic and cook for 2 mins more, then scatter over the Cajun-style seasoning and stir so the chicken pieces are evenly coated. Tip in the tomatoes, a quarter of a can of water and the stock cube. Stir, then bring to a simmer and cook for 5 mins.\nMeanwhile, bring a large pan of salted water to the boil and cook the pasta for a minute less than pack instructions. Stir the cream into the chicken and continue to simmer gently. When the pasta is cooked, drain well and stir into chicken mixture. Finish cooking the pasta in the sauce over a low heat for 2 mins, then stir in the parmesan and lemon juice, and cook for 1 min more. Serve the pasta straight from the pan, or tip into a large serving bowl. Scatter with parsley, if you like, and extra parmesan.",
      extendedIngredients: [
        { id: 101, original: "1 tbsp olive oil" },
        { id: 102, original: "400g chicken breasts, chopped into large chunks" },
        { id: 103, original: "3 garlic cloves, finely chopped or grated" },
        { id: 104, original: "2 tbsp Cajun-style seasoning" },
        { id: 105, original: "400g can chopped tomatoes or passata" },
        { id: 106, original: "1 chicken stock cube, crumbled" },
        { id: 107, original: "500g penne or another tube- shaped pasta" },
        { id: 108, original: "150ml double cream" },
        { id: 109, original: "20g parmesan, finely grated, plus extra to serve" },
        { id: 110, original: "½ lemon, juiced" },
        { id: 111, original: "chopped parsley, to serve (optional)" },
      ],
      analyzedInstructions: [
        {
          name: "",
          steps: [
            {
              number: 1,
              step: "Heat the olive oil in a large, shallow saucepan or deep frying pan over a medium heat, then add the chicken, season lightly and fry for 6-8 mins, stirring occasionally until just golden all over – no need to worry about it being cooked through at this stage.",
            },
            {
              number: 2,
              step: "Stir in the garlic and cook for 2 mins more, then scatter over the Cajun-style seasoning and stir so the chicken pieces are evenly coated. Tip in the tomatoes, a quarter of a can of water and the stock cube. Stir, then bring to a simmer and cook for 5 mins.",
            },
            {
              number: 3,
              step: "Meanwhile, bring a large pan of salted water to the boil and cook the pasta for a minute less than pack instructions. Stir the cream into the chicken and continue to simmer gently. When the pasta is cooked, drain well and stir into chicken mixture. Finish cooking the pasta in the sauce over a low heat for 2 mins, then stir in the parmesan and lemon juice, and cook for 1 min more. Serve the pasta straight from the pan, or tip into a large serving bowl. Scatter with parsley, if you like, and extra parmesan.",
            },
          ],
        },
      ],
      vegetarian: false,
      vegan: false,
      glutenFree: false,
    },
  ]

  return await importJsonRecipes(hardcodedRecipes)
}
