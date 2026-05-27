//this is a search result page
import React, { useState, useEffect, useRef } from "react";
import Navbar from '@/ComponentsSelf/searchnavbar';
import Horizontalcard from '@/ComponentsSelf/animecardhorizontal';
import Link from 'next/link';
import { useRouter } from 'next/router';
import scrollsaver from "@/Utility/ScrollSaver";

export default function SearchPage() {
  const [animearr, setAnimearr] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [currentpage, setpage] = useState(1);
  const isupdated = useRef(false);
  const isaddedarr = useRef(false);
  const [searchtarget, Set_search_target] = useState<string | null>(null);
  const [plantowatchmap, Setplantowatchmap] = useState(new Map());
  const [watchingmap, Setwatchingmap] = useState(new Map());
  const [completedmap, Setcompletedmap] = useState(new Map());
  const [onholdmap, Setonholdmap] = useState(new Map());
  const [droppedmap, Setdroppedmap] = useState(new Map());

  const router = useRouter();
  const queryTitle = typeof router.query.title === 'string' ? router.query.title : '';

  function clearstate(inputval: string) {
    setpage(1);
    setLoading(true);
    setAnimearr([]);
    Set_search_target(inputval);
    sessionStorage.removeItem('animedatasearch');
    isaddedarr.current = false;
    isupdated.current = false;
  }

  scrollsaver([isLoading]);

  useEffect(() => {
    function scrollhandler() {
      console.log('scroll event working');
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2000 && !isupdated.current) {
        setpage((currentpage) => currentpage + 1);
        isaddedarr.current = false;
        isupdated.current = true;
        window.removeEventListener('scroll', scrollhandler);
      }
    }
    window.addEventListener('scroll', scrollhandler);
    return () => {
      window.removeEventListener('scroll', scrollhandler);
    };
  }, [currentpage]);

  const fetchapiRef = useRef<(currpage: number) => Promise<void>>(null as any);

  const fetchapi = React.useCallback(async (currpage: number) => {
    try {
      const storeddata = JSON.parse(sessionStorage.getItem('animedatasearch') || 'null');
      if (storeddata !== null) {
        const lastUpdate = JSON.parse(sessionStorage.getItem('lastupdatetimesearch') || '0');
        if (!(Math.floor(Date.now() / 86400000) - lastUpdate >= 1)) {
          if (storeddata.length > animearr.length) {
            console.log('using already stored data', storeddata);
            setpage(Math.ceil(storeddata.length / 24) + 1);
            setAnimearr(storeddata);
            setLoading(false);
            return;
          }
        } else {
          sessionStorage.removeItem("animedatasearch");
          sessionStorage.removeItem("lastupdatetimesearch");
        }
      }

      const q = searchtarget === null ? queryTitle : searchtarget;
      if (!q) {
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.jikan.moe/v4/anime?letter&limit=24&sfw=true&page=' + currpage + '&q=' + encodeURIComponent(q));
      const apifeedback = await response.json();
      const top24 = apifeedback.data || [];

      const tempfilteredSetid = new Set();
      const tempfiltered = new Set<any>();
      top24.forEach((element: any) => {
        if (!tempfilteredSetid.has(element.mal_id)) {
          tempfiltered.add(element);
          tempfilteredSetid.add(element.mal_id);
        }
      });

      const deconstructed: any[] = [];
      tempfiltered.forEach(({ status, mal_id, images, season, year, episodes, title_english, title, score, scored_by, popularity, genres }) => {
        deconstructed.push({ title_english, status, mal_id, images, season, year, episodes, title, score, scored_by, popularity, genres });
      });

      if (!isaddedarr.current) {
        isaddedarr.current = true;
        const newArr = [...animearr, ...deconstructed];
        setAnimearr(newArr);
        const currenttimedays = Math.floor(Date.now() / 86400000);
        sessionStorage.setItem('lastupdatetimesearch', JSON.stringify(currenttimedays));
        sessionStorage.setItem('animedatasearch', JSON.stringify(newArr));
        isupdated.current = false;
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      // retry once
      setTimeout(() => {
        fetchapiRef.current?.(currpage);
      }, 1000);
    }
  }, [animearr, queryTitle, searchtarget]);

  useEffect(() => {
    fetchapiRef.current = fetchapi;
  }, [fetchapi]);

  useEffect(() => {
    if (router.isReady) {
      Promise.resolve().then(() => {
        fetchapi(currentpage);
      });
    }
  }, [currentpage, router.isReady, fetchapi]);

  useEffect(() => {
    Promise.resolve().then(() => {
      Setplantowatchmap(new Map(JSON.parse(localStorage.getItem('PlanToWatch') || '[]' || '[]')));
      Setwatchingmap(new Map(JSON.parse(localStorage.getItem('Watching') || '[]' || '[]')));
      Setcompletedmap(new Map(JSON.parse(localStorage.getItem('Completed') || '[]' || '[]')));
      Setonholdmap(new Map(JSON.parse(localStorage.getItem('OnHold') || '[]' || '[]')));
      Setdroppedmap(new Map(JSON.parse(localStorage.getItem('Dropped') || '[]' || '[]')));
    });
  }, []);

  return (
    <>
      <Navbar set_state={clearstate} searchtitle={queryTitle === 'NA' ? 'Search' : queryTitle} />
      {isLoading ? (
        <div className="w-screen h-screen flex flex-row justify-center items-center">
          <div className="loader"></div>
        </div>
      ) : (
        <div className='relative left-0 mb-16 h-fit sm:pb-0 pt-18 lg:grid lg:grid-cols-2 w-screen min-h-screen lg:grid-rows flex flex-col'>
          {animearr.length !== 0 && queryTitle !== 'NA' ? (
            animearr.map((element: any) => (
              <Link key={element.mal_id + 10} href={'/search/' + queryTitle + '/' + element.mal_id}>
                <Horizontalcard
                  key={element.mal_id}
                  mal_id={element.mal_id}
                  image={element.images.webp.large_image_url}
                  status={element.status}
                  season={element.season == null ? ' ' : element.season + ' ' + element.year}
                  episodes={element.episodes}
                  title={element.title_english == null ? element.title : element.title_english}
                  score={element.score}
                  users={element.scored_by}
                  ranking={element.popularity}
                  genre={element.genres}
                  addstatus={plantowatchmap.has(element.mal_id) || watchingmap.has(element.mal_id) || completedmap.has(element.mal_id) || onholdmap.has(element.mal_id) || droppedmap.has(element.mal_id)}
                />
              </Link>
            ))
          ) : (
            <div className='flex m-auto p-0 gap-0 items-center justify-center'>
              <p className="text-neutral-300 text-base font-bold text-center">Your anime journey starts here !</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
