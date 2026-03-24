const CHARACTERS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = CHARACTERS.length;

function encode(num) {
  let str = "";
  while (num > 0) {
    str = CHARACTERS.charAt(num % BASE) + str;
    num = Math.floor(num / BASE);
  }
  return str || CHARACTERS[0];
}

function decode(str) {
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    num = num * BASE + CHARACTERS.indexOf(str.charAt(i));
  }
  return num;
}

export { encode, decode };
