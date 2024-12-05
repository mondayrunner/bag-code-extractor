export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const path = event.path.replace('/api/bag/', '')

  // Add the required headers
  setHeaders(event, {
    'Accept': 'application/hal+json',
    'Accept-Crs': 'epsg:28992',
    'X-Api-Key': config.bagApiKey
  })

  // Construct the full URL
  const baseUrl = 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2'
  const url = `${baseUrl}/${path}`

  try {
    // Make the request to the BAG API
    const response = await $fetch(url, {
      headers: {
        'Accept': 'application/hal+json',
        'Accept-Crs': 'epsg:28992',
        'X-Api-Key': config.bagApiKey
      },
      query
    })

    return response
  } catch (error) {
    console.error('BAG API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error fetching data from BAG API'
    })
  }
}) 