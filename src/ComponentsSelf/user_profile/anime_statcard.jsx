import { Progress } from "@/components/ui/progress"
import { CardContent, Card,CardTitle,CardDescription } from "@/components/ui/card"
export default function anime_stat_card(props){
    const stat_data = props.data
    const watchstat =[
        {
            category: 'Completed',
            icon: <div className="h-2 w-2 bg-green-600 rounded-full"/>,
            count: stat_data.num_items_completed
        },
        {
            category: 'Plan To Watch',
            icon: <div className="h-2 w-2 bg-blue-600 rounded-full"/>,
            count: stat_data.num_items_plan_to_watch
        },
        {
            category: 'On Hold',
            icon: <div className="h-2 w-2 bg-yellow-600 rounded-full"/>,
            count: stat_data.num_items_on_hold
        },
         {
            category: 'Dropped',
            icon: <div className="h-2 w-2 bg-red-600 rounded-full"/>,
            count: stat_data.num_items_dropped
        },
    ]
    console.log('state data is ',stat_data)
    return(
        <Card className='w-full text-white  bg-neutral-900 border-1 border-neutral-600'>
            <CardContent className='w-full'>
                <CardTitle>Anime Stats</CardTitle>
                <CardDescription>
                    <br></br>
                    <div className="flex flex-row justify-between">
                        <p>Days Watched:</p>
                        <p>{stat_data.num_days}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>Mean Score:</p>
                        <p>{stat_data.mean_score}</p>
                    </div>
                    <Progress className='my-2 h-2 bg-neutral-600  border-0' value={stat_data.mean_score*10 } ></Progress>
                    <div className="flex flex-row justify-between">
                        <p>Count:</p>
                        <p>{stat_data.num_items}</p>
                    </div>
                    <div className="my-2 h-[1px]  bg-neutral-600"></div>
                    {
                        watchstat.map((element)=>(
                            <div className="flex flex-row justify-between">
                                <div className="flex items-center gap-1 flex-row">{element.icon}<p>{element.category}:</p></div>
                                <p>{element.count}</p>
                            </div>
                        ))
                    }
                    

                    
                </CardDescription>
            </CardContent>
        </Card>
    )
}