module.exports = {
  getOffset: (currentPageNum = 1, numbersPerPage = 9) => {
    const maxNum = currentPageNum * numbersPerPage - 1
    const minNum = maxNum - (numbersPerPage - 1)
    return minNum
  },

  getPagination: (
    currentPageNum = 1, numbersPerPage = 9, totalNumbers
  ) => {
    let totalPages = Math.ceil(Number(totalNumbers) / numbersPerPage)
    totalPages = totalPages || 1

    const minPage = 1
    const currentPage = currentPageNum < 1 ? 1 : currentPageNum > totalPages ? totalPages : currentPageNum
    const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
    const next = currentPage + 1 > totalPages ? totalPages : currentPage + 1

    // if total display pages (exclude minPage and totalPages) are 5
    // then both left and right displayPages are all 2
    // ex: [3 and 4 <- leftPages, 5 <- currentPage, 6 and 7 <- rightPages]
    const displayLeftPages = -2
    const displayRightPages = 2
    const displaySidePages = displayRightPages

    const pages = []

    // only push page numbers between minPage and totalPages
    for (let i = displayLeftPages; i <= displayRightPages; i++) {
      if (currentPage + i > minPage && currentPage + i < totalPages) {
        pages.push(currentPage + i)
      }
    }

    // prepend '...' if following conditions are met
    if (!pages.includes(minPage + 1) && pages.length >= displaySidePages) pages.unshift('...')
    pages.unshift(minPage)

    // append '...' if following conditions are met
    if (!pages.includes(totalPages - 1) && pages.length >= displaySidePages) pages.push('...')
    if (minPage !== totalPages) pages.push(totalPages)

    return {
      pages, totalPages, currentPage, prev, next
    }
  }
}
