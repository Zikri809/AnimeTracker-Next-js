const HOVER_CLASSES = [
  'hover:text-green-500',
  'hover:text-blue-400',
  'hover:text-indigo-500',
  'hover:text-yellow-300',
  'hover:text-red-500'
];

export default function statusbutton(
  e: any,
  btnref: { current: any[] },
  Setstatus: (status: string) => void
): void {
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

      btnref.current[i].classList.add(HOVER_CLASSES[i]);
      btnref.current[i].classList.add('text-white');
    }
  }
  if (e.target) {
    const text = e.target.innerText;
    if (text === 'Watching') {
      e.target.classList.replace('text-white', 'text-green-500');
    } else if (text === 'Plan To Watch') {
      e.target.classList.replace('text-white', 'text-indigo-500');
    } else if (text === 'On Hold') {
      e.target.classList.replace('text-white', 'text-yellow-300');
    } else if (text === 'Completed') {
      e.target.classList.replace('text-white', 'text-blue-400');
    } else {
      e.target.classList.replace('text-white', 'text-red-500');
    }
    Setstatus(text);
  }
}
