/**
 * Low-level protobuf wire format encoding utilities.
 *
 * Protobuf wire types:
 * - 0: Varint (int32, int64, uint32, uint64, sint32, sint64, bool, enum)
 * - 1: 64-bit (fixed64, sfixed64, double)
 * - 2: Length-delimited (string, bytes, embedded messages, packed repeated fields)
 * - 5: 32-bit (fixed32, sfixed32, float)
 */
const WireType = {
  Varint: 0,
  Fixed64: 1,
  LengthDelimited: 2,
  Fixed32: 5
};
/**
 * Encodes a field tag (field number + wire type)
 */
const encodeTag = (fieldNumber, wireType) => fieldNumber << 3 | wireType;
/**
 * Encodes a varint (variable-length integer)
 *
 * @internal
 */
export const encodeVarint = value => {
  const bytes = [];
  let n = typeof value === "bigint" ? value : BigInt(value);
  while (n > BigInt(127)) {
    bytes.push(Number(n & BigInt(127)) | 0x80);
    n >>= BigInt(7);
  }
  bytes.push(Number(n));
  return new Uint8Array(bytes);
};
/**
 * Encodes a signed varint using ZigZag encoding
 *
 * @internal
 */
export const encodeSint = value => {
  const n = typeof value === "bigint" ? value : BigInt(value);
  const zigzag = n << BigInt(1) ^ n >> BigInt(63);
  return encodeVarint(zigzag);
};
/**
 * Encodes a 64-bit fixed value (little-endian)
 *
 * @internal
 */
export const encodeFixed64 = value => {
  const bytes = new Uint8Array(8);
  const view = new DataView(bytes.buffer);
  view.setBigUint64(0, value, true);
  return bytes;
};
/**
 * Encodes a 32-bit fixed value (little-endian)
 *
 * @internal
 */
export const encodeFixed32 = value => {
  const bytes = new Uint8Array(4);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, value, true);
  return bytes;
};
/**
 * Encodes a double (64-bit float, little-endian)
 *
 * @internal
 */
export const encodeDouble = value => {
  const bytes = new Uint8Array(8);
  const view = new DataView(bytes.buffer);
  view.setFloat64(0, value, true);
  return bytes;
};
/**
 * Encodes a string to UTF-8 bytes
 *
 * @internal
 */
export const encodeString = value => new TextEncoder().encode(value);
/**
 * Encodes bytes as a hex string to Uint8Array
 *
 * @internal
 */
export const encodeHexBytes = hex => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};
/**
 * Concatenates multiple Uint8Arrays
 *
 * @internal
 */
export const concat = (...arrays) => {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};
// Field encoders
/**
 * Encodes a varint field
 *
 * @internal
 */
export const varintField = (fieldNumber, value) => concat(encodeVarint(encodeTag(fieldNumber, WireType.Varint)), encodeVarint(value));
/**
 * Encodes a sint field (ZigZag encoded)
 *
 * @internal
 */
export const sintField = (fieldNumber, value) => concat(encodeVarint(encodeTag(fieldNumber, WireType.Varint)), encodeSint(value));
/**
 * Encodes a bool field
 *
 * @internal
 */
export const boolField = (fieldNumber, value) => varintField(fieldNumber, value ? 1 : 0);
/**
 * Encodes a fixed64 field
 *
 * @internal
 */
export const fixed64Field = (fieldNumber, value) => concat(encodeVarint(encodeTag(fieldNumber, WireType.Fixed64)), encodeFixed64(value));
/**
 * Encodes a fixed32 field
 *
 * @internal
 */
export const fixed32Field = (fieldNumber, value) => concat(encodeVarint(encodeTag(fieldNumber, WireType.Fixed32)), encodeFixed32(value));
/**
 * Encodes a double field
 *
 * @internal
 */
export const doubleField = (fieldNumber, value) => concat(encodeVarint(encodeTag(fieldNumber, WireType.Fixed64)), encodeDouble(value));
/**
 * Encodes a length-delimited field (bytes, string, embedded message)
 *
 * @internal
 */
export const lengthDelimitedField = (fieldNumber, value) => concat(encodeVarint(encodeTag(fieldNumber, WireType.LengthDelimited)), encodeVarint(value.length), value);
/**
 * Encodes a string field
 *
 * @internal
 */
export const stringField = (fieldNumber, value) => lengthDelimitedField(fieldNumber, encodeString(value));
/**
 * Encodes a bytes field from hex string
 *
 * @internal
 */
export const bytesFieldFromHex = (fieldNumber, hex) => lengthDelimitedField(fieldNumber, encodeHexBytes(hex));
/**
 * Encodes an embedded message field
 *
 * @internal
 */
export const messageField = (fieldNumber, message) => lengthDelimitedField(fieldNumber, message);
/**
 * Encodes repeated fields
 *
 * @internal
 */
export const repeatedField = (fieldNumber, values, encode) => concat(...values.map(v => messageField(fieldNumber, encode(v))));
/**
 * Encodes repeated varint fields (not packed)
 *
 * @internal
 */
export const repeatedVarintField = (fieldNumber, values) => concat(...values.map(v => varintField(fieldNumber, v)));
/**
 * Helper to conditionally encode an optional field
 *
 * @internal
 */
export const optionalField = (value, encode) => value !== undefined ? encode(value) : new Uint8Array(0);
/**
 * Helper to conditionally encode a string field if non-empty
 *
 * @internal
 */
export const optionalStringField = (fieldNumber, value) => value !== undefined && value !== "" ? stringField(fieldNumber, value) : new Uint8Array(0);
//# sourceMappingURL=protobuf.js.map