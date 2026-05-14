Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region src/generator/xorshift128plus.ts
var XorShift128Plus = class XorShift128Plus {
	constructor(s01, s00, s11, s10) {
		this.s01 = s01;
		this.s00 = s00;
		this.s11 = s11;
		this.s10 = s10;
	}
	clone() {
		return new XorShift128Plus(this.s01, this.s00, this.s11, this.s10);
	}
	next() {
		const a0 = this.s00 ^ this.s00 << 23;
		const a1 = this.s01 ^ (this.s01 << 23 | this.s00 >>> 9);
		const b0 = a0 ^ this.s10 ^ (a0 >>> 18 | a1 << 14) ^ (this.s10 >>> 5 | this.s11 << 27);
		const b1 = a1 ^ this.s11 ^ a1 >>> 18 ^ this.s11 >>> 5;
		const out = this.s00 + this.s10 | 0;
		this.s01 = this.s11;
		this.s00 = this.s10;
		this.s11 = b1;
		this.s10 = b0;
		return out;
	}
	jump() {
		let ns01 = 0;
		let ns00 = 0;
		let ns11 = 0;
		let ns10 = 0;
		const jump = [
			1667051007,
			2321340297,
			1548169110,
			304075285
		];
		for (let i = 0; i !== 4; ++i) for (let mask = 1; mask; mask <<= 1) {
			if (jump[i] & mask) {
				ns01 ^= this.s01;
				ns00 ^= this.s00;
				ns11 ^= this.s11;
				ns10 ^= this.s10;
			}
			this.next();
		}
		this.s01 = ns01;
		this.s00 = ns00;
		this.s11 = ns11;
		this.s10 = ns10;
	}
	getState() {
		return [
			this.s01,
			this.s00,
			this.s11,
			this.s10
		];
	}
};
function xorshift128plusFromState(state) {
	if (!(state.length === 4)) throw new Error("The state must have been produced by a xorshift128plus RandomGenerator");
	return new XorShift128Plus(state[0], state[1], state[2], state[3]);
}
function xorshift128plus(seed) {
	return new XorShift128Plus(-1, ~seed, seed | 0, 0);
}
//#endregion
exports.xorshift128plus = xorshift128plus;
exports.xorshift128plusFromState = xorshift128plusFromState;
