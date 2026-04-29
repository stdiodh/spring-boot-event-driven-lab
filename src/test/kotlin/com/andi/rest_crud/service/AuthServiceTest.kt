package com.andi.rest_crud.service

import com.andi.rest_crud.exception.InvalidCredentialsException
import com.andi.rest_crud.exception.UserAlreadyExistsException
import com.andi.rest_crud.exception.UserNotFoundException
import com.andi.rest_crud.repository.UserRepository
import com.andi.rest_crud.security.JwtTokenProvider
import com.andi.rest_crud.security.PasswordConfig
import com.andi.rest_crud.support.TestFixtureFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.Mockito.mock
import java.util.Optional

class AuthServiceTest {

    private val userRepository: UserRepository = mock(UserRepository::class.java)
    private val passwordEncoder = PasswordConfig().passwordEncoder()
    private val jwtTokenProvider = JwtTokenProvider(
        secret = "change-this-secret-for-sequence-04-change-this-secret",
        expirationMs = 3600000L
    )
    private val authService = AuthService(
        userRepository = userRepository,
        passwordEncoder = passwordEncoder,
        jwtTokenProvider = jwtTokenProvider
    )

    @Test
    fun `login은 올바른 이메일과 비밀번호면 access token을 만든다`() {
        val request = TestFixtureFactory.loginRequest()
        val encodedPassword = requireNotNull(passwordEncoder.encode(request.password))
        val user = TestFixtureFactory.user(
            email = request.email,
            password = encodedPassword
        )
        `when`(userRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

        val result = authService.login(request)

        assertFalse(result.accessToken.isBlank())
        assertEquals(request.email, jwtTokenProvider.getEmail(result.accessToken))
    }

    @Test
    fun `login은 비밀번호가 다르면 실패 예외를 확인한다`() {
        val savedUser = TestFixtureFactory.user(
            email = "tester@example.com",
            password = requireNotNull(passwordEncoder.encode("password123"))
        )
        val wrongPasswordRequest = TestFixtureFactory.loginRequest(
            email = "tester@example.com",
            password = "wrong-password"
        )
        `when`(userRepository.findByEmail(wrongPasswordRequest.email)).thenReturn(Optional.of(savedUser))

        assertThrows(InvalidCredentialsException::class.java) {
            authService.login(wrongPasswordRequest)
        }
    }

    @Test
    fun `signUp은 이메일을 정리한 뒤 저장하고 중복이면 예외를 던진다`() {
        val request = TestFixtureFactory.signUpRequest(email = "  Tester@Example.com  ")
        `when`(userRepository.existsByEmail("tester@example.com")).thenReturn(false)

        authService.signUp(request)

        val userCaptor = ArgumentCaptor.forClass(com.andi.rest_crud.domain.User::class.java)
        verify(userRepository).save(userCaptor.capture())
        assertEquals("tester@example.com", userCaptor.value.email)
    }

    @Test
    fun `signUp은 중복 이메일이면 저장하지 않고 실패한다`() {
        val request = TestFixtureFactory.signUpRequest(email = "tester@example.com")
        `when`(userRepository.existsByEmail("tester@example.com")).thenReturn(true)

        assertThrows(UserAlreadyExistsException::class.java) {
            authService.signUp(request)
        }
    }

    @Test
    fun `getCurrentUser는 없는 이메일이면 사용자 없음 예외를 던진다`() {
        `when`(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty())

        assertThrows(UserNotFoundException::class.java) {
            authService.getCurrentUser("missing@example.com")
        }
    }
}
