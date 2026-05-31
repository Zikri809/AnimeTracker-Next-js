export default function completed_click(
  e: any,
  api: any,
  btnref: { current: any[] },
  Setstatus: (status: string) => void,
  num_episodes: number
): void {
  api.scrollTo(num_episodes);
  for (let i = 0; i < 5; i++) {
    if (btnref.current[i]) {
      btnref.current[i].classList.remove('hover:text-green-500');
      btnref.current[i].classList.remove('hover:text-indigo-500');
      btnref.current[i].classList.remove('hover:text-yellow-300');
      btnref.current[i].classList.remove('hover:text-red-500');
      btnref.current[i].classList.remove('hover:text-blue-400');

      btnref.current[i].classList.remove('text-green-500');
      btnref.current[i].classList.remove('text-indigo-500');
      btnref.current[i].classList.remove('text-yellow-300');
      btnref.current[i].classList.remove('text-red-500');
      btnref.current[i].classList.remove('text-blue-400');

      btnref.current[i].classList.add('hover:text-black');
      btnref.current[i].classList.add('text-white');
    }
  }
  if (e.target) {
    e.target.classList.replace('hover:text-black', 'hover:text-blue-400');
    e.target.classList.replace('text-white', 'text-blue-400');
    Setstatus(e.target.innerText);
  }
}
