const axios = require('axios')
const { News, Category } = require('../models')

module.exports = {
  genNewsList: async (data, cb) => {
    try {
      // don't touch original data, instead assign to temporary one
      const processData = data
      const {
        NEWS_API_URI,
        NEWS_API_QUERY_COUNTRY,
        NEWS_API_KEY,
        PAGE_SIZE
      } = processData

      // process country array to show how many News API request has to be made,
      // at the same time, create different HTTP request URL
      processData.requestUrls = NEWS_API_QUERY_COUNTRY.map((_, i) => {
        const apiKey = NEWS_API_KEY[i] || NEWS_API_KEY[0]
        return `${NEWS_API_URI}?country=${NEWS_API_QUERY_COUNTRY[i]}&apiKey=${apiKey}&pageSize=${PAGE_SIZE}`
      })

      // using Promise.all to fetch API result and category data from DB
      const [categories, ...apiArray] = await Promise.all([
        Category.findAll({ raw: true }),
        ...Array.from({ length: processData.requestUrls.length }, (_, i) => {
          return axios.get(processData.requestUrls[i])
        })
      ])

      processData.categories = []
      const apiSet = new Set()
      // because no category data are send back from API request,
      // so we have to remap category ID based on category data in our DB
      // at the same time, we will try to remove any duplicated news
      for (let i = apiArray.length - 1; i > 0; i--) {
        if (apiArray[i].data.status !== 'ok') throw new Error('新聞自動化擷取程序出錯')

        if (apiSet.has(apiArray[i].title)) {
          apiArray.splice(i, 1)
        } else {
          apiSet.add(apiArray[i].title)
          processData.categories[i] = categories[categories.findIndex(
            category => category.name === NEWS_API_QUERY_COUNTRY[i]
          )].id
        }
      }

      // this is more complex part...
      // previously, we send out several API requests to third party,
      // so we will equally receive identical numbers of HTTP response.
      // And, each response consists of an array of results,
      // therefore, it's necessary to use flatMap to flat out our nest array.
      const promiseArray = apiArray.flatMap((apiItem, index) => {
        return Array.from({ length: apiItem.data.articles.length }, async (_, i) => {
          const { title, description, url, publishedAt } = apiItem.data.articles[i]

          const author = apiItem.data.articles[i].author || '尚無出處'
          const urlToImage = apiItem.data.articles[i].urlToImage || 
            'https://via.placeholder.com/642x500?text=No+Image+Available'


          const news = await News.findOne({ where: { title } })
          if (!news) {
            return News.create({
              author,
              title,
              description,
              url,
              urlToImage,
              publishedAt,
              categoryId: processData.categories[index]
            })
          }
        })
      })

      // finally, that flatted array can be used in allSettled,
      // why Promise.allSettled? because sometimes fetched news data
      // may be processed incorrectly.
      await Promise.allSettled(promiseArray)
      return cb(null)

    } catch (err) { cb(err) }

  }
}