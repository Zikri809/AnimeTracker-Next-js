// this is mylist page
import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/ComponentsSelf/mylistnavbar';
import Horizontalcard from '@/ComponentsSelf/animecardhorizontal';
import Link from "next/link";
import progress from "@/Utility/progress";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/sonner";
import scrollsaver from "@/Utility/ScrollSaver";
import useSwipeGesture from "@/hooks/useSwipeGesture";
import { fetchAuthSession } from "@/lib/auth-session";
import storage_Parser from "@/Utility/safety/storage_parser";
import airing_sort from "@/Utility/filter/airing_sort";
import completed_sort from "@/Utility/filter/completed_sort";
import top_member from "@/Utility/filter/top_members";
import top_score from "@/Utility/filter/top_score";

export default function MyList() {
  const [planmap, Setplan] = useState<any[]>([]);
  const [completedmap, Setcompleted] = useState<any[]>([]);
  const [watchinmap, Setwatching] = useState<any[]>([]);
  const [onholdmap, Setonhold] = useState<any[]>([]);
  const [droppedmap, Setdropped] = useState<any[]>([]);
  const [isloading, Setloading] = useState(false);
  const [activetab, Setactivetab] = useState('Plan To Watch');
  const router = useRouter();
  const [currentpagearr, setpagearr] = useState(30);
  const isupdated = useRef(false);

  function onswiperight() {
    Setactivetab((currentTab) => {
      const tabArray = ['Plan To Watch', 'Completed', 'Watching', 'On Hold', 'Dropped'];
      if (currentTab === tabArray[tabArray.length - 1]) {
        scrollreset();
        return 'Plan To Watch';
      } else {
        const index = tabArray.indexOf(currentTab);
        scrollreset();
        return tabArray[index + 1];
      }
    });
  }

  function onswipeleft() {
    Setactivetab((currentTab) => {
      const tabArray = ['Plan To Watch', 'Completed', 'Watching', 'On Hold', 'Dropped'];
      if (currentTab === tabArray[0]) {
        scrollreset();
        return 'Dropped';
      } else {
        const index = tabArray.indexOf(currentTab);
        scrollreset();
        return tabArray[index - 1];
      }
    });
  }

  useSwipeGesture('x-axis', [onswiperight, onswipeleft], 100);

  function scrollreset() {
    console.log('scrollreset triggered');
    sessionStorage.setItem('scrollY', '0');
    setpagearr(30);
    sessionStorage.removeItem('sort_type');
    sessionStorage.removeItem('sorted_anime');
    Setcompleted(JSON.parse(localStorage.getItem('Completed') || '[]' || '[]'));
    Setplan(JSON.parse(localStorage.getItem('PlanToWatch') || '[]' || '[]'));
    Setwatching(JSON.parse(localStorage.getItem('Watching') || '[]' || '[]'));
    Setonhold(JSON.parse(localStorage.getItem('OnHold') || '[]' || '[]'));
    Setdropped(JSON.parse(localStorage.getItem('Dropped') || '[]' || '[]'));
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      if (sessionStorage.getItem('slicearr') !== null && currentpagearr < parseInt(sessionStorage.getItem('slicearr')!)) {
        setpagearr(parseInt(sessionStorage.getItem('slicearr')!));
        console.log('updated the current page arr ');
        isupdated.current = true;
      }
    });
  }, [currentpagearr]);

  useEffect(() => {
    function scrollhandler() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && isupdated.current && router.isReady) {
        const addedpage = currentpagearr + 30;
        setpagearr(addedpage);
        console.log('added page is ', addedpage);
        console.log('current page is ', currentpagearr);
        sessionStorage.setItem('slicearr', String(addedpage));
        console.log('condition fulfilled', currentpagearr);
        isupdated.current = true;
      }
    }
    window.addEventListener('scroll', scrollhandler);
    return () => {
      window.removeEventListener('scroll', scrollhandler);
    };
  }, [currentpagearr, router.isReady]);

  useEffect(() => {
    isupdated.current = true;
  }, [currentpagearr]);

  scrollsaver([currentpagearr, planmap, watchinmap, droppedmap, onholdmap, completedmap]);

  const hasrunned = useRef(false);

  useEffect(() => {
    let worker: Worker | undefined;
    let cancelled = false;

    fetchAuthSession().then((session) => {
      if (cancelled || !session.authenticated || hasrunned.current) return;

      const completed_fallback = JSON.parse(localStorage.getItem('Completed') || '[]' || '[]');
      const plan_fallback = JSON.parse(localStorage.getItem('PlanToWatch') || '[]' || '[]');
      const watching_fallback = JSON.parse(localStorage.getItem('Watching') || '[]' || '[]');
      const onhold_fallback = JSON.parse(localStorage.getItem('OnHold') || '[]' || '[]');
      const dropped_fallback = JSON.parse(localStorage.getItem('Dropped') || '[]' || '[]');

      worker = new Worker('/worker/worker.js');
      worker.postMessage('start');
      hasrunned.current = true;

      worker.onmessage = (e) => {
        const watchingmapData = e.data.collectionarr[0];
        const completedmapData = e.data.collectionarr[1];
        const onholdmapData = e.data.collectionarr[2];
        const droppedmapData = e.data.collectionarr[3];
        const plantowatchmapData = e.data.collectionarr[4];

        localStorage.setItem('Watching', JSON.stringify(Array.from(watchingmapData)));
        localStorage.setItem('Completed', JSON.stringify(Array.from(completedmapData)));
        localStorage.setItem('OnHold', JSON.stringify(Array.from(onholdmapData)));
        localStorage.setItem('Dropped', JSON.stringify(Array.from(droppedmapData)));
        localStorage.setItem('PlanToWatch', JSON.stringify(Array.from(plantowatchmapData)));

        const selectedValue = storage_Parser(sessionStorage, 'sort_type', '');
        const rawTabItems = localStorage.getItem(activetab.split(' ').join(''));
        const anime_data = JSON.parse(rawTabItems || '[]').map((value: any) => value[1]);
        let sorted: any[] = [];
        switch (selectedValue) {
          case 'TopScore': {
            sorted = top_score(anime_data);
            break;
          }
          case 'Top Member': {
            sorted = top_member(anime_data);
            break;
          }
          case 'Completed': {
            sorted = completed_sort(anime_data);
            break;
          }
          case 'Airing': {
            sorted = airing_sort(anime_data);
            break;
          }
        }
        const sortedMapped = sorted.map((value) => [value.node.id, value]);
        if (sortedMapped.length !== 0) {
          sessionStorage.setItem('sorted_anime', JSON.stringify(sortedMapped));
        }

        Setcompleted(sortedMapped.length !== 0 ? sortedMapped : Array.from(completedmapData));
        Setplan(sortedMapped.length !== 0 ? sortedMapped : Array.from(plantowatchmapData));
        Setwatching(sortedMapped.length !== 0 ? sortedMapped : Array.from(watchingmapData));
        Setonhold(sortedMapped.length !== 0 ? sortedMapped : Array.from(onholdmapData));
        Setdropped(sortedMapped.length !== 0 ? sortedMapped : Array.from(droppedmapData));
      };

      Promise.resolve().then(() => {
        if (sessionStorage.getItem('activetab') === undefined || sessionStorage.getItem('activetab') === null) {
          Setactivetab('Plan To Watch');
        } else {
          const savedTab = sessionStorage.getItem('activetab');
          Setactivetab(savedTab === 'PlanToWatch' ? 'Plan To Watch' : (savedTab === 'OnHold' ? 'On Hold' : savedTab!));
        }
        Setcompleted(storage_Parser(sessionStorage, 'sorted_anime', completed_fallback));
        Setplan(storage_Parser(sessionStorage, 'sorted_anime', plan_fallback));
        Setwatching(storage_Parser(sessionStorage, 'sorted_anime', watching_fallback));
        Setonhold(storage_Parser(sessionStorage, 'sorted_anime', onhold_fallback));
        Setdropped(storage_Parser(sessionStorage, 'sorted_anime', dropped_fallback));
        Setloading(false);
      });
    });

    return () => {
      cancelled = true;
      worker?.terminate();
    };
  }, []);

  function handletabchange(value: string) {
    Setactivetab(value);
    sessionStorage.setItem('activetab', value);
    const tab_arr = ['Plan To Watch', 'Completed', 'Watching', 'On Hold', 'Dropped'];
    const active_tab_index = tab_arr.indexOf(value);
    const storage_id = ['PlanToWatch', 'Completed', 'Watching', 'OnHold', 'Dropped'];
    const setters = [Setplan, Setcompleted, Setwatching, Setonhold, Setdropped];
    for (let index = 0; index < storage_id.length; index++) {
      if (index === active_tab_index) continue;
      const defaultArr = JSON.parse(localStorage.getItem(storage_id[index]) || '[]');
      setters[index](defaultArr);
    }
  }

  return (
    <>
      <Navbar isLoading={isloading} Setcompleted={Setcompleted} Setplan={Setplan} Setwatching={Setwatching} Setonhold={Setonhold} Setdropped={Setdropped} SetpageArr={setpagearr} />
      <Toaster className='fixed top-0 z-[1000]' richColors />
      <Tabs defaultValue="Plan To Watch" value={activetab} onValueChange={handletabchange} className="relative w-full top-20 border-0 border-blue-500 bg-black">
        <TabsList style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} className='no-scrollbar::-webkit-scrollbar w-screen justify-start text-xl z-[2] fixed touch-auto pb-0 rounded-none bg-black text-black border-b-0 overflow-auto border-gray-600 gap-0'>
          <TabsTrigger onClick={scrollreset} className='border-x-0 text-base border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none data-[state=active]:bg-inherit data-[state=active]:text-white text-neutral-400' value="Plan To Watch">Plan To Watch</TabsTrigger>
          <TabsTrigger onClick={scrollreset} className='border-x-0 text-neutral-400 text-base data-[state=active]:bg-inherit data-[state=active]:text-white border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none' value="Completed">Completed</TabsTrigger>
          <TabsTrigger onClick={scrollreset} className='border-x-0 text-neutral-400 text-base data-[state=active]:bg-inherit data-[state=active]:text-white border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none' value="Watching">Watching</TabsTrigger>
          <TabsTrigger onClick={scrollreset} className='border-x-0 text-neutral-400 text-base data-[state=active]:bg-inherit data-[state=active]:text-white border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none' value="On Hold">On Hold</TabsTrigger>
          <TabsTrigger onClick={scrollreset} className='border-x-0 text-neutral-400 text-base data-[state=active]:bg-inherit data-[state=active]:text-white border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none' value="Dropped">Dropped</TabsTrigger>
        </TabsList>
        <TabsContent className='relative top-10 pb-38 sm:pb-20' value="Plan To Watch">
          {isloading ? <p>Loading please wait</p> :
            (planmap.length !== 0 ? <div className="lg:grid lg:grid-cols-2 w-screen lg:grid-rows pb-8 sm:pb-0">
              {
                (planmap.slice(0, currentpagearr).map(([key, value]) => (
                  <Link key={value.node.id} href={'/mylist/PlanToWatch/' + value.node.id}>
                    <Horizontalcard
                      className=''
                      mal_id={value.node.id}
                      image={value.node.main_picture?.large === undefined ? '' : value.node.main_picture?.large}
                      status={value.node.status.split('_').map((word: string) => word[0].toUpperCase() + word.slice(1)).join(' ')}
                      season={value.node.season == null ? ' ' : value.node.season + ' ' + value.node.year}
                      episodes={value.node.num_episodes}
                      title={value.node.alternative_titles?.en === '' ? value.node.title : value.node.alternative_titles?.en}
                      score={value.node.mean}
                      users={value.node.num_scoring_users}
                      ranking={value.node.popularity}
                      genre={value.node.genres}
                    />
                  </Link>
                )))
              }
            </div> : <p className="text-white w-full h-full text-center py-60">No shows in record yet</p>)
          }
        </TabsContent>
        <TabsContent className='relative top-10 max-w-screen pb-38 sm:pb-20' value="Completed">
          {isloading ? <p>Loading please wait</p> :
            (completedmap.length !== 0 ? <div className="lg:grid lg:grid-cols-2 max-w-screen pb-8 sm:pb-0 lg:grid-rows">
              {
                (completedmap.slice(0, currentpagearr).map(([key, value]) => (
                  <Link key={value.node.id} href={'/mylist/Completed/' + value.node.id}>
                    <Horizontalcard
                      className=''
                      mal_id={value.node.id}
                      image={value.node.main_picture?.large === undefined ? '' : value.node.main_picture?.large}
                      status={value.node.status.split('_').map((word: string) => word[0].toUpperCase() + word.slice(1)).join(' ')}
                      season={value.node.season == null ? ' ' : value.node.season + ' ' + value.node.year}
                      episodes={value.node.num_episodes}
                      title={value.node.alternative_titles?.en === '' ? value.node.title : value.node.alternative_titles?.en}
                      score={value.node.mean}
                      users={value.node.num_scoring_users}
                      ranking={value.node.popularity}
                      genre={value.node.genres}
                    />
                  </Link>
                )))
              }
            </div> : <p className="text-white w-full h-full text-center py-60">No shows in record yet</p>)
          }
        </TabsContent>
        <TabsContent className='relative top-10 bg-black pb-38 sm:pb-20' value="Watching">
          {isloading ? <p>Loading please wait</p> :
            (watchinmap.length !== 0 ? <div className="lg:grid lg:grid-cols-2 max-w-screen pb-8 sm:pb-0 lg:grid-rows">
              {
                (watchinmap.slice(0, currentpagearr).map(([key, value]) => (
                  <Link key={value.node.id} href={'/mylist/Watching/' + value.node.id}>
                    <Horizontalcard
                      className=''
                      mal_id={value.node.id}
                      image={value.node.main_picture?.large === undefined ? '' : value.node.main_picture?.large}
                      status={value.node.status.split('_').map((word: string) => word[0].toUpperCase() + word.slice(1)).join(' ')}
                      season={value.node.season == null ? ' ' : value.node.season + ' ' + value.node.year}
                      episodes={value.node.num_episodes}
                      title={value.node.alternative_titles?.en === '' ? value.node.title : value.node.alternative_titles?.en}
                      score={value.node.mean}
                      users={value.node.num_scoring_users}
                      ranking={value.node.popularity}
                      user_episode={progress(Number(key))}
                    />
                  </Link>
                )))
              }
            </div> : <p className="text-white w-full h-full text-center py-60">No shows in record yet</p>)
          }
        </TabsContent>
        <TabsContent className='relative top-10 pb-38 sm:pb-20' value="On Hold">
          {isloading ? <p>Loading please wait</p> :
            (onholdmap.length !== 0 ? <div className="lg:grid lg:grid-cols-2 w-screen pb-8 sm:pb-0 lg:grid-rows">
              {
                (onholdmap.slice(0, currentpagearr).map(([key, value]) => (
                  <Link key={value.node.id} href={'/mylist/OnHold/' + value.node.id}>
                    <Horizontalcard
                      className=''
                      mal_id={value.node.id}
                      image={value.node.main_picture?.large === undefined ? '' : value.node.main_picture?.large}
                      status={value.node.status.split('_').map((word: string) => word[0].toUpperCase() + word.slice(1)).join(' ')}
                      season={value.node.season == null ? ' ' : value.node.season + ' ' + value.node.year}
                      episodes={value.node.num_episodes}
                      title={value.node.alternative_titles?.en === '' ? value.node.title : value.node.alternative_titles?.en}
                      score={value.node.mean}
                      users={value.node.num_scoring_users}
                      ranking={value.node.popularity}
                      genre={value.node.genres}
                    />
                  </Link>
                )))
              }
            </div> : <p className="text-white w-full h-full text-center py-60">No shows in record yet</p>)
          }
        </TabsContent>
        <TabsContent className='relative top-10 pb-38 sm:pb-20' value="Dropped">
          {isloading ? <p>Loading please wait</p> :
            (droppedmap.length !== 0 ?
              <div className="lg:grid lg:grid-cols-2 w-screen pb-8 sm:pb-0 lg:grid-rows">
                {
                  (droppedmap.slice(0, currentpagearr).map(([key, value]) => (
                    <Link key={value.node.id} href={'/mylist/Dropped/' + value.node.id}>
                      <Horizontalcard
                        className=''
                        mal_id={value.node.id}
                        image={value.node.main_picture?.large === undefined ? '' : value.node.main_picture?.large}
                        status={value.node.status.split('_').map((word: string) => word[0].toUpperCase() + word.slice(1)).join(' ')}
                        season={value.node.season == null ? ' ' : value.node.season + ' ' + value.node.year}
                        episodes={value.node.num_episodes}
                        title={value.node.alternative_titles?.en === '' ? value.node.title : value.node.alternative_titles?.en}
                        score={value.node.mean}
                        users={value.node.num_scoring_users}
                        ranking={value.node.popularity}
                        genre={value.node.genres}
                      />
                    </Link>
                  )))
                }
              </div> : <p className="text-white w-full h-full text-center py-60">No shows in record yet</p>)
          }
        </TabsContent>
      </Tabs>
    </>
  );
}
