import { Router } from 'express'
import { getAll, getByCategory } from '../controllers/menuController.js'

const router = Router()

router.get('/', getAll)
router.get('/:category', getByCategory)

export default router
