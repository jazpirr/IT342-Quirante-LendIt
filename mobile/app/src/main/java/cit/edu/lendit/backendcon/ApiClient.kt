package cit.edu.lendit.backendcon

object ApiClient {
    private const val BASE_URL = "http://10.0.2.2:8080/"

    val retrofit = retrofit2.Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(retrofit2.converter.gson.GsonConverterFactory.create())
        .build()

    val apiService: AuthApi = retrofit.create(AuthApi::class.java)
}
