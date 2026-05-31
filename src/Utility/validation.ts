import sleep from "./sleep";

export default function validator(): void {
  const storageidentifier = ["PlanToWatch", "Completed", "Watching", "OnHold", "Dropped"];
  storageidentifier.forEach((storagename) => {
    const stored = sessionStorage.getItem("needstocheck" + storagename);
    const idtobevalidated: number[] = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(idtobevalidated)) return;

    const localStored = localStorage.getItem(storagename);
    const watchlistcategory = new Map<number, any>(localStored ? JSON.parse(localStored) : []);

    idtobevalidated.forEach((mal_id, index) => {
      apifetch(mal_id);

      console.log(
        "The storage name is ",
        storagename,
        " slicedarr is ",
        idtobevalidated.slice(index + 1, idtobevalidated.length)
      );
      sessionStorage.setItem(
        "needstocheck" + storagename,
        JSON.stringify(idtobevalidated.slice(index + 1, idtobevalidated.length))
      );
    });

    async function apifetch(mal_id: number): Promise<void> {
      try {
        const item = watchlistcategory.get(mal_id);
        if (!item) return;
        const userwatch = {
          userstatus: item.userstatus,
          userprogress: item.userprogress,
          userscore: item.userscore,
        };
        const res = await fetch("https://api.jikan.moe/v4/anime/" + mal_id);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        console.log("validation fetching calls");
        const apidata = await res.json();
        watchlistcategory.set(mal_id, Object.assign(apidata.data, userwatch));
        localStorage.setItem(storagename, JSON.stringify([...watchlistcategory]));
      } catch (error) {
        // Correct the immediate execution bug: pass a lambda function to .then
        sleep(1000).then(() => apifetch(mal_id));
      }
    }
  });
}
