export default function conversionjikanmal(jikanAnime){
    return{
        node:{
            id: jikanAnime.mal_id,
            main_picture: {
              large: jikanAnime.images?.webp?.large_image_url || jikanAnime.images?.jpg?.large_image_url || null
            },
        
            status: jikanAnime.status.split(' ').map(word => word[0].toLowerCase() + word.slice(1)).join('_') || null,
        
            start_season: (jikanAnime.season && jikanAnime.year)
              ? { season: jikanAnime.season.toLowerCase(), year: jikanAnime.year }
              : null,
        
            num_episodes: jikanAnime.episodes ?? null,
        
            title: jikanAnime.title ?? null,
        
            alternative_titles: {
              en: jikanAnime.title_english || null,
              ja: jikanAnime.title_japanese || null,
              synonyms: jikanAnime.title_synonyms || []
            },
        
            mean: jikanAnime.score ?? null,
        
            num_scoring_users: jikanAnime.scored_by ?? null,
        
            popularity: jikanAnime.popularity ?? null,
        
            genres: (jikanAnime.genres || []).map(g => ({
              id: g.mal_id,
              name: g.name
            }))
       }, 
       list_status: {
        status: null,
        score: 0,
        num_episodes_watched: 0,
        is_rewatching: false,
        updated_at: null
        },    
     // Jikan doesn't provide this; get from MAL user list if needed

}
    
}