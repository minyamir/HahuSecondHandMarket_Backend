import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Verification route working" });
});

export default router;