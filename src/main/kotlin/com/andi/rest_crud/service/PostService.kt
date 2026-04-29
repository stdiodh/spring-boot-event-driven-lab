package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.dto.PostCreateRequest
import com.andi.rest_crud.dto.PostResponse
import com.andi.rest_crud.dto.PostUpdateRequest
import com.andi.rest_crud.exception.InvalidPostRequestException
import com.andi.rest_crud.exception.PostNotFoundException
import com.andi.rest_crud.repository.PostRepository
import org.springframework.stereotype.Service

@Service
class PostService(
    private val postRepository: PostRepository
) {

    fun create(request: PostCreateRequest): PostResponse {
        val command = validateCreateRequest(request)
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

    fun update(id: Long, request: PostUpdateRequest): PostResponse {
        val post = findPostById(id)
        val command = validateUpdateRequest(request)
        applyUpdate(post, command)
        val updatedPost = postRepository.save(post)
        return toResponse(updatedPost)
    }

    fun delete(id: Long) {
        val post = findPostById(id)
        postRepository.delete(post)
    }

    private fun findPostById(id: Long): PostEntity {
        return postRepository.findById(id)
            .orElseThrow { PostNotFoundException(id) }
    }

    private fun validateCreateRequest(request: PostCreateRequest): PostCommand {
        return validatePostFields(
            title = request.title,
            content = request.content,
            author = request.author
        )
    }

    private fun validateUpdateRequest(request: PostUpdateRequest): PostCommand {
        return validatePostFields(
            title = request.title,
            content = request.content,
            author = request.author
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
        post.author = command.author
    }

    private fun toResponse(post: PostEntity): PostResponse = PostResponse.from(post)

    private data class PostCommand(
        val title: String,
        val content: String,
        val author: String
    )
}
