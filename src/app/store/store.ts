import { atom } from "jotai";
import { createStore } from "jotai/vanilla";

export const superlikeCounterAtom = atom(0);

export const store = createStore();
