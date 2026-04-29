package com.andi.rest_crud.exception

class UserNotFoundException(email: String) : RuntimeException("사용자를 찾을 수 없습니다. email=$email")
