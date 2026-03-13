package cit.edu.lendit.backendcon

import cit.edu.lendit.models.AuthResponse
import cit.edu.lendit.models.LoginRequest
import cit.edu.lendit.models.RegisterRequest
import cit.edu.lendit.models.UserResponse
import retrofit2.Call
import retrofit2.http.*

interface AuthApi {

    @POST("api/auth/login")
    fun login(@Body request: LoginRequest): Call<AuthResponse>

    @POST("api/auth/register")
    fun register(@Body request: RegisterRequest): Call<UserResponse>

    @GET("api/user/me")
    fun getCurrentUser(
        @Header("Authorization") token: String
    ): Call<UserResponse>
}