package com.andi.rest_crud.exception

class InvalidPostRequestException(
    val errors: Map<String, String>
) : RuntimeException("게시글 요청값이 올바르지 않습니다.")
