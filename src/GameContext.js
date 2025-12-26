// src/GameContext.js
import { createContext } from "react";

export const GameContext = createContext();

// GameReducer.js (или где у тебя хранится state)
const initialState = {
  plums: 0,
  gp: 0, // ← новая валюта
  level: 1,
  // ...
};