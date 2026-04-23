import MenuItem from '../models/MenuItem.js'

export const menuService = {
  getAll: () => MenuItem.find().lean(),

  getByCategory: (category) => MenuItem.find({ category }).lean(),
}
