interface SaveSpotParams<TSpot = unknown, TPresented = unknown> {
    spot: TSpot,
    adapter: (presented: TPresented) => Promise<any>,
    presenter: (spot: TSpot) => TPresented,
    callback: (label: string, payload: any) => void
}

export async function saveSpotUseCase<TSpot, TPresented>(params: SaveSpotParams<TSpot, TPresented>) {
    console.log('[bs] usecase::SAVED SPOT PARAMS', params)
    try {
        console.log('[bs] usecase::SAVED SPOT', params.spot)
        const result = params.presenter(params.spot)
        console.log('[bs] usecase::I WOULD SAVE THIS INPUT', result)
        const doc = await params.adapter(result)
        params.callback('[bs] usecase::SAVED SPOT', doc)
    } catch (error) {
        console.error(error)
        // params.callback(null)
    }
}
