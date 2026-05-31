export default function generaterandomstring(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let generated = "";
  for (let i = 0; i < length; i++) {
    const randomindex = Math.floor(Math.random() * characters.length);
    generated += characters.charAt(randomindex);
  }
  return generated;
}
