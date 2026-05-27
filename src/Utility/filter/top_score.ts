export default function top_score(anime_arr_of_object: any[]): any[] {
  const encoded_arr = anime_arr_of_object.map((element, index) => {
    const encoded = Math.round((element.node.mean ?? 1.0) * 1000000 + index);
    return encoded;
  });
  encoded_arr.sort((a, b) => b - a);
  const sorted_arr = encoded_arr.map(element => {
    return anime_arr_of_object[element % 10000];
  });
  return sorted_arr;
}
