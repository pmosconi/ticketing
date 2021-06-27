import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/api/orders/:orderId', async (req: Request, res: Response) => {

    return res.send('Ok');
});

export { router as showOrderRouter };