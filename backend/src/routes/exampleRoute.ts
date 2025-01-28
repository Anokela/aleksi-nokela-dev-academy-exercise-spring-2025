import { Router, Request, Response } from "express";

const router = Router();

// Esimerkki API-reitti
router.get("/data", (req: Request, res: Response) => {
    res.json({ message: "Terveisiä Palvelimelta", data: [1, 2, 3] });
});

export default router;