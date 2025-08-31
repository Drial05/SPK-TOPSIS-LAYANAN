import { Request, Response } from "express";
import { calculateSaw } from "../../services/service.saw";

export const getSawRanking = async (req: Request, res: Response) => {
  const ranking = await calculateSaw();
  //console.log("ranking", ranking);
  res.json(ranking);
};
