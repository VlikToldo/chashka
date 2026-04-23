import { menuService } from '../services/menuService.js'

export async function getAll(req, res) {
  const items = await menuService.getAll()
  res.json(items)
}

export async function getByCategory(req, res) {
  const items = await menuService.getByCategory(req.params.category)
  res.json(items)
}
