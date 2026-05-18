//#region src/generator/congruential32.ts
const MULTIPLIER = 214013;
const INCREMENT = 2531011;
const MASK = 4294967295;
const MASK_2 = -2147483649;
const JUMP_MULTIPLIER = 1994129409;
const JUMP_INCREMENT = 916127744;
var LinearCongruential32 = class LinearCongruential32 {
	constructor(seed) {
		this.seed = seed;
	}
	clone() {
		return new LinearCongruential32(this.seed);
	}
	next() {
		const s1 = computeNextSeed(this.seed);
		const v1 = computeValueFromNextSeed(s1);
		const s2 = computeNextSeed(s1);
		const v2 = computeValueFromNextSeed(s2);
		this.seed = computeNextSeed(s2);
		return computeValueFromNextSeed(this.seed) + (v2 + (v1 << 15) << 15) | 0;
	}
	jump() {
		this.seed = Math.imul(this.seed, JUMP_MULTIPLIER) + JUMP_INCREMENT & MASK;
	}
	getState() {
		return [this.seed];
	}
};
function computeNextSeed(seed) {
	return Math.imul(seed, MULTIPLIER) + INCREMENT & MASK;
}
function computeValueFromNextSeed(nextseed) {
	return (nextseed & MASK_2) >> 16;
}
function congruential32FromState(state) {
	if (!(state.length === 1)) throw new Error("The state must have been produced by a congruential32 RandomGenerator");
	return new LinearCongruential32(state[0]);
}
function congruential32(seed) {
	return new LinearCongruential32(seed);
}
//#endregion
export { congruential32, congruential32FromState };
