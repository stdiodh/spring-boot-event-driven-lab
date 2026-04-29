package com.andi.rest_crud.service

import com.andi.rest_crud.domain.User
import com.andi.rest_crud.dto.CurrentUserResponse
import com.andi.rest_crud.dto.LoginRequest
import com.andi.rest_crud.dto.TokenResponse
import com.andi.rest_crud.dto.UserSignUpRequest
import com.andi.rest_crud.exception.InvalidCredentialsException
import com.andi.rest_crud.exception.UserNotFoundException
import com.andi.rest_crud.exception.UserAlreadyExistsException
import com.andi.rest_crud.repository.UserRepository
import com.andi.rest_crud.security.JwtTokenProvider
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    fun signUp(request: UserSignUpRequest) {
        val email = normalizeEmail(request.email)
        ensureEmailAvailable(email)
        userRepository.save(createLocalUser(email, request.password))
    }

    fun login(request: LoginRequest): TokenResponse {
        val email = normalizeEmail(request.email)
        val user = findUserByEmailOrThrowInvalidCredentials(email)
        verifyPassword(request.password, user.password)
        return createTokenResponse(user.email)
    }

    fun getCurrentUser(email: String): CurrentUserResponse {
        val normalizedEmail = normalizeEmail(email)
        val user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow { UserNotFoundException(normalizedEmail) }

        return CurrentUserResponse(email = user.email)
    }

    private fun normalizeEmail(email: String): String = email.trim().lowercase()

    private fun ensureEmailAvailable(email: String) {
        if (userRepository.existsByEmail(email)) {
            throw UserAlreadyExistsException(email)
        }
    }

    private fun createLocalUser(email: String, rawPassword: String): User {
        return User(
            email = email,
            password = requireNotNull(passwordEncoder.encode(rawPassword))
        )
    }

    private fun findUserByEmailOrThrowInvalidCredentials(email: String): User {
        return userRepository.findByEmail(email)
            .orElseThrow { InvalidCredentialsException() }
    }

    private fun verifyPassword(rawPassword: String, encodedPassword: String) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw InvalidCredentialsException()
        }
    }

    private fun createTokenResponse(email: String): TokenResponse {
        return TokenResponse(
            accessToken = jwtTokenProvider.createToken(email)
        )
    }
}
