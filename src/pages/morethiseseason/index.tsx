import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import Morenavabr from '@/ComponentsSelf/morenavbar';
import Horizontalcard from '@/ComponentsSelf/animecardhorizontal';
import { useRouter } from 'next/router';
import seasonaldata from '@/Utility/seasonaldata';
import scrollsaver from '@/Utility/ScrollSaver';

export const getStaticProps = async () => {
  const seasoninfo = seasonaldata();
  const fields = 'main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres';
  const offset = 0;
  let data: any = {};
  try {
    const result = await fetch(`https://api.myanimelist.net/v2/anime/season/${seasoninfo.current_year}/${seasoninfo.current_season}?sort=descending&limit=500&offset=${offset}&fields=${fields}`, {
      method: 'GET',
      headers: {
        'X-MAL-CLIENT-ID': process.env.Client_ID || '',
      }
    });
    if (!result.ok) {
      throw new Error(`HTTP ${result.status}`);
    }
    data = await result.json();
  } catch (error) {
    console.log('error fetching data');
  }
  let revalidate_time = 43200;
  return {
    props: {
      seasonaldata: data.data || [],
      seasoninfo: seasoninfo
    },
    revalidate: revalidate_time
  };
};

interface MoreProps {
  seasonaldata: any[];
  seasoninfo: any;
}

export default function More({ seasonaldata, seasoninfo }: MoreProps) {
  const [animearr, setAnimearr] = useState<any[]>([]);
  const [isLoading] = useState(false);
  const [currentpagearr, setpagearr] = useState(30);
  const cardref = useRef(null);
  const isupdated = useRef(false);
  const [plantowatchmap, Setplantowatchmap] = useState(new Map());
  const [watchingmap, Setwatchingmap] = useState(new Map());
  const [completedmap, Setcompletedmap] = useState(new Map());
  const [onholdmap, Setonholdmap] = useState(new Map());
  const [droppedmap, Setdroppedmap] = useState(new Map());

  const router = useRouter();

  useEffect(() => {
    Promise.resolve().then(() => {
      Setplantowatchmap(new Map(JSON.parse(localStorage.getItem('PlanToWatch') || '[]' || '[]')));
      Setwatchingmap(new Map(JSON.parse(localStorage.getItem('Watching') || '[]' || '[]')));
      Setcompletedmap(new Map(JSON.parse(localStorage.getItem('Completed') || '[]' || '[]')));
      Setonholdmap(new Map(JSON.parse(localStorage.getItem('OnHold') || '[]' || '[]')));
      Setdroppedmap(new Map(JSON.parse(localStorage.getItem('Dropped') || '[]' || '[]')));
    });
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      setAnimearr(JSON.parse(sessionStorage.getItem('sorted_anime') || 'null') || seasonaldata);
      if (sessionStorage.getItem('slicearr') !== null && currentpagearr < parseInt(sessionStorage.getItem('slicearr')!)) {
        setpagearr(parseInt(sessionStorage.getItem('slicearr')!));
        console.log('updated the current page arr ');
        isupdated.current = true;
      }
    });
  }, [currentpagearr, seasonaldata]);

  scrollsaver([currentpagearr, animearr]);

  useEffect(() => {
    function scrollhandler() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && isupdated.current && router.isReady && (currentpagearr < seasonaldata.length)) {
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
  }, [currentpagearr, seasonaldata, router.isReady]);

  useEffect(() => {
    isupdated.current = true;
  }, [currentpagearr]);

  return (
    <div className='relative top-0 left-0 font-poppins overflow-hidden m-0 w-screen h-auto bg-black text-white ml-1 antialiased'>
      <Morenavabr sectionTitle={'This Season'} SetAnimeArr={setAnimearr} IsUpdateRef={isupdated} SetpageArr={setpagearr} season={seasoninfo.current_season} year={seasoninfo.current_year} defaultArr={seasonaldata}/>
      {isLoading ? (
        <div className="w-screen h-screen flex flex-row justify-center items-center">
          <div className="loader"></div>
        </div>
      ) : (
        <div className='relative top-18 lg:grid lg:grid-cols-2 w-screen pb-33 sm:pb-15 lg:grid-rows'>
          {animearr.slice(0, currentpagearr).map((element: any) => (
            <Link key={element.node.id} href={'/morethiseseason/' + element.node.id}>
              <Horizontalcard
                ref={cardref}
                addstatus={plantowatchmap.has(element.node.id) || watchingmap.has(element.node.id) || completedmap.has(element.node.id) || onholdmap.has(element.node.id) || droppedmap.has(element.node.id)}
                mal_id={element.node.id}
                image={element.node.main_picture?.large === undefined ? '' : element.node.main_picture.large}
                status={element.node.status.split('_').map((word: string) => word[0].toUpperCase() + word.slice(1)).join(' ')}
                season={element.node.season === null ? ' ' : element.node.season + ' ' + element.node.year}
                episodes={element.node.num_episodes}
                title={element.node.alternative_titles?.en === '' ? element.node.title : element.node.alternative_titles?.en}
                score={element.node.mean}
                users={element.node.num_scoring_users}
                ranking={element.node.popularity}
                genre={element.node.genres}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
