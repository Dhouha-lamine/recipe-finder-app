export interface Recipe {
    id: number
    title: string
    image: string
    readyInMinutes: number
    servings: number
    summary: string
    instructions: string
    extendedIngredients: {
      id: number
      original: string
    }[]
    analyzedInstructions: {
      name: string
      steps: {
        number: number
        step: string
      }[]
    }[]
    vegetarian: boolean
    vegan: boolean
    glutenFree: boolean
  }
  