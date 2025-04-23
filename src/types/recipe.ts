export interface Recipe {
    id?: string
    objectId?: string
    title: string
    description: string
    time: string
    servings: number
    image: string
    ingredients: string[]
    steps: string[]
    isFavorite?: boolean
    tags?: string[]
  }
  
  export interface User {
    id?: string
    username: string
    email: string
    password?: string
    favorites?: string[]
  }
  