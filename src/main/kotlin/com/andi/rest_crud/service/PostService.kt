package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.dto.PostCreateRequest
import com.andi.rest_crud.dto.PostResponse
import com.andi.rest_crud.dto.PostUpdateRequest
import com.andi.rest_crud.exception.InvalidPostRequestException
import com.andi.rest_crud.exception.ForbiddenPostAccessException
import com.andi.rest_crud.exception.PostNotFoundException
import com.andi.rest_crud.repository.PostRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class PostService(
    private val postRepository: PostRepository
) {

    @Transactional
    fun create(request: PostCreateRequest, authorEmail: String): PostResponse {
        val command = validateCreateRequest(request, authorEmail)
        val savedPost = postRepository.save(buildPost(command))
        return toResponse(savedPost)
    }

    fun getAll(): List<PostResponse> {
        return postRepository.findAll()
            .map(::toResponse)
    }

    fun getById(id: Long): PostResponse {
        return toResponse(findPostById(id))
    }

    @Transactional
    fun update(id: Long, request: PostUpdateRequest, currentUserEmail: String): PostResponse {
        val post = findPostById(id)
        validateAuthor(post, currentUserEmail)
        val command = validateUpdateRequest(request, post.author)
        applyUpdate(post, command)
        val updatedPost = postRepository.save(post)
        return toResponse(updatedPost)
    }

    @Transactional
    fun delete(id: Long, currentUserEmail: String) {
        val post = findPostById(id)
        validateAuthor(post, currentUserEmail)
        postRepository.delete(post)
    }

    private fun findPostById(id: Long): PostEntity {
        return postRepository.findById(id)
            .orElseThrow { PostNotFoundException(id) }
    }

    private fun validateCreateRequest(request: PostCreateRequest, authorEmail: String): PostCommand {
        return validatePostFields(
            title = request.title,
            content = request.content,
            author = authorEmail
        )
    }

    private fun validateUpdateRequest(request: PostUpdateRequest, authorEmail: String): PostCommand {
        return validatePostFields(
            title = request.title,
            content = request.content,
            author = authorEmail
        )
    }

    private fun validatePostFields(title: String, content: String, author: String): PostCommand {
        val normalizedTitle = title.trim()
        val normalizedContent = content.trim()
        val normalizedAuthor = author.trim()
        val errors = linkedMapOf<String, String>()

        if (normalizedTitle.isBlank()) {
            errors["title"] = "title은 비어 있을 수 없습니다."
        }
        if (normalizedContent.isBlank()) {
            errors["content"] = "content는 비어 있을 수 없습니다."
        }
        if (normalizedAuthor.isBlank()) {
            errors["author"] = "author는 비어 있을 수 없습니다."
        }

        if (errors.isNotEmpty()) {
            throw InvalidPostRequestException(errors)
        }

        return PostCommand(
            title = normalizedTitle,
            content = normalizedContent,
            author = normalizedAuthor
        )
    }

    private fun buildPost(command: PostCommand): PostEntity {
        return PostEntity(
            title = command.title,
            content = command.content,
            author = command.author
        )
    }

    private fun applyUpdate(post: PostEntity, command: PostCommand) {
        post.title = command.title
        post.content = command.content
    }

    private fun toResponse(post: PostEntity): PostResponse = PostResponse.from(post)

    private data class PostCommand(
        val title: String,
        val content: String,
        val author: String
    )

    private fun validateAuthor(post: PostEntity, currentUserEmail: String) {
        if (!post.isWrittenBy(currentUserEmail)) {
            throw ForbiddenPostAccessException(post.id)
        }
    }
}
