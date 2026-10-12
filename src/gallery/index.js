import { categories } from './categories'
import { travelItems } from './items/travel'
import { filmItems } from './items/film'
import { dailyItems } from './items/daily'

export const categoryItems = {
  travel: travelItems,
  film: filmItems,
  daily: dailyItems
}

export function getCategoryData(categoryId) {
  if (!categoryId || !categories[categoryId]) {
    return null
  }
  return {
    ...categories[categoryId],
    items: categoryItems[categoryId] || []
  }
}
