const commentSection = document.querySelector('#comment-section')

commentSection.addEventListener('click', function onCommentSectionClicked (event) {
  if (event.target.classList.contains('edit-button')) {
    const newsId = Number(event.target.dataset.newsId)
    const commentId = Number(event.target.dataset.commentId)

    const comment = document.querySelector(`#comment-${commentId}`)
    const commentContent = document.querySelector(`#comment-content-${commentId}`).innerText

    const editCommentTemplate = `
      <form action="/news/${newsId}/comments/${commentId}?_method=PUT" method="POST" class="mb-3">
        <div class="form-floating mb-3">
          <textarea class="form-control" placeholder="Leave a comment here" id="comment" style="height: 80px" name="comment">${commentContent}</textarea>
          <label for="comment">評論</label>
        </div>
        <div class="d-flex justify-content-end mt-1">
          <button type="button" id="back-button-${commentId}" class="btn btn-secondary me-2">返回</button>
          <button type="submit" class="btn btn-primary">回覆</button>
        </div>
      </form>
    `

    const originalTemplate = comment.innerHTML
    comment.innerHTML = editCommentTemplate

    const backButton = document.querySelector(`#back-button-${commentId}`)
    backButton.addEventListener('click', function onBackButtonClicked () {
      comment.innerHTML = originalTemplate
    }, { once: true })
  }

  if (event.target.classList.contains('reply-button')) {
    const newsId = Number(event.target.dataset.newsId)
    const commentId = Number(event.target.dataset.commentId)
    const { userName } = event.target.dataset

    const commentForm = document.querySelector('#comment-form')

    const replyCommentTemplate = `
      <form action="/news/${newsId}/comments/${commentId}" method="POST" class="mb-3">
        <div class="form-floating mb-3">
          <textarea class="form-control" placeholder="Leave a comment here" id="comment" style="height: 100px"
            name="comment">回覆 ${userName} 的留言:\n</textarea>
          <label for="comment">評論</label>
        </div>
        <button type="button" id="back-button-reply-${commentId}" class="btn btn-secondary me-2">取消回覆</button>
        <button type="submit" class="btn btn-primary">回覆</button>
      </form>
    `

    const originalTemplate = commentForm.innerHTML
    commentForm.innerHTML = replyCommentTemplate

    const backButton = document.querySelector(`#back-button-reply-${commentId}`)
    backButton.addEventListener('click', function onBackButtonClicked () {
      commentForm.innerHTML = originalTemplate
    }, { once: true })
  }
})
