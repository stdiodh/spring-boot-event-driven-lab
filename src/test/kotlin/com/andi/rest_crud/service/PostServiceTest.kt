package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.exception.InvalidPostRequestException
import com.andi.rest_crud.exception.PostNotFoundException
import com.andi.rest_crud.repository.PostRepository
import com.andi.rest_crud.support.TestFixtureFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import java.util.Optional

class PostServiceTest {

    private val postRepository: PostRepository = mock(PostRepository::class.java)
    private val postService = PostService(postRepository)

    @Test
    fun `create는 요청 값을 저장하고 응답으로 돌려준다`() {
        val request = TestFixtureFactory.postCreateRequest()
        val savedPost = TestFixtureFactory.postEntity(
            id = 1L,
            title = request.title,
            content = request.content,
            author = "owner@example.com"
        )
        `when`(postRepository.save(any(PostEntity::class.java))).thenReturn(savedPost)

        val result = postService.create(request, "owner@example.com")

        assertEquals(1L, result.id)
        assertEquals(request.title, result.title)
        assertEquals(request.content, result.content)
        assertEquals("owner@example.com", result.author)
    }

    @Test
    fun `getById는 없는 게시글 id면 예외 흐름을 확인한다`() {
        `when`(postRepository.findById(999L)).thenReturn(Optional.empty())

        assertThrows(PostNotFoundException::class.java) {
            postService.getById(999L)
        }
    }

    @Test
    fun `create는 공백만 있는 제목이면 서비스 레벨 검증 예외를 던진다`() {
        val invalidRequest = TestFixtureFactory.postCreateRequest(title = "   ")

        val exception = assertThrows(InvalidPostRequestException::class.java) {
            postService.create(invalidRequest, "owner@example.com")
        }

        assertEquals("title은 비어 있을 수 없습니다.", exception.errors["title"])
    }

    @Test
    fun `update는 요청값을 정리한 뒤 게시글을 저장한다`() {
        val savedPost = TestFixtureFactory.postEntity(id = 7L)
        val updateRequest = TestFixtureFactory.postUpdateRequest(
            title = "  수정 제목  ",
            content = "  수정 내용  "
        )
        val updatedPost = TestFixtureFactory.postEntity(
            id = 7L,
            title = "수정 제목",
            content = "수정 내용",
            author = "tester"
        )
        `when`(postRepository.findById(7L)).thenReturn(Optional.of(savedPost))
        `when`(postRepository.save(savedPost)).thenReturn(updatedPost)

        val result = postService.update(7L, updateRequest, "tester")

        assertEquals("수정 제목", result.title)
        assertEquals("수정 내용", result.content)
        assertEquals("tester", result.author)
    }
}
