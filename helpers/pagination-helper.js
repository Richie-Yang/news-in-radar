module.exports = {
  getOffset: (currentPageNum = 1, numbersPerPage = 9) => {
    const maxNum = currentPageNum * numbersPerPage - 1
    const minNum = maxNum - (numbersPerPage - 1)
    return minNum
  },

  getPagination: (
      currentPageNum = 1, numbersPerPage = 9, totalNumbers
    ) => {
    const totalPages = Math.ceil(Number(totalNumbers) / numbersPerPage)
    const minPage = 1
    const currentPage = currentPageNum < 1 ? 1 : currentPageNum > totalPages ? totalPages : currentPageNum
    const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
    const next = currentPage + 1 > totalPages ? totalPages : currentPage + 1

    const pages = []
    
    for (let i = -2; i <= 2; i++) {
      if (currentPage + i > minPage && currentPage + i < totalPages) {
        pages.push(currentPage + i)
      }
    }

    if (!pages.includes(minPage + 1)) pages.unshift('...')
    pages.unshift(minPage)
    
    if (!pages.includes(totalPages - 1)) pages.push('...')
    pages.push(totalPages)

    return {
      pages, totalPages, currentPage, prev, next
    }
  }
}