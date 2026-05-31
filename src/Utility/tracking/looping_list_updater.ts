export default async function looping_updater(status: string): Promise<void> {
  const datamap = new Map<number, any>();
  let paging: string | undefined = 'sdsfsf'; // placeholder to let first run
  let offset = 0;

  while (paging !== undefined) {
    const pagingresult = await apifetch(offset, datamap, status);
    paging = pagingresult?.next;
    console.log('fetching area paging is ', paging);
    offset += 100;
  }

  // status checker because the passed value are in mal format
  if (status === 'plan_to_watch') {
    localStorage.setItem('PlanToWatch', JSON.stringify(Array.from(datamap)));
  } else if (status === 'watching') {
    localStorage.setItem('Watching', JSON.stringify(Array.from(datamap)));
  } else if (status === 'completed') {
    localStorage.setItem('Completed', JSON.stringify(Array.from(datamap)));
  } else if (status === 'on_hold') {
    localStorage.setItem('OnHold', JSON.stringify(Array.from(datamap)));
  } else {
    localStorage.setItem('Dropped', JSON.stringify(Array.from(datamap)));
  }
}

const apifetch = async (
  offset: number,
  datamap: Map<number, any>,
  status: string
): Promise<{ next?: string } | undefined> => {
  try {
    const result = await fetch(`/api/users/data/userlist?&sort=list_updated_at&offset=${offset}&status=${status}`);
    const resultjson = await result.json();
    if (!result.ok) throw new Error();

    // iterate across the array of result.data
    if (resultjson.data) {
      for (const element of resultjson.data) {
        if (element?.node?.id) {
          datamap.set(element.node.id, element);
        }
      }
    }
    return resultjson.paging;
  } catch {
    console.log('error occur in looping_list_updater api fetch for each anime status');
    return undefined;
  }
};
