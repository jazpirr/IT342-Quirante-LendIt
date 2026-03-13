package cit.edu.lendit.auth

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.addTextChangedListener
import cit.edu.lendit.databinding.ActivityLoginBinding
import cit.edu.lendit.DashboardActivity
import cit.edu.lendit.backendcon.ApiClient
import cit.edu.lendit.models.AuthResponse
import cit.edu.lendit.models.LoginRequest
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupValidation()
        setupClickListeners()
    }

    override fun onResume() {
        super.onResume()
        setupAnimations()
    }

    private fun setupAnimations() {
        binding.loginCard.apply {
            alpha = 0f
            translationY = 120f
            scaleX = 0.9f
            scaleY = 0.9f
            animate()
                .alpha(1f)
                .translationY(0f)
                .scaleX(1f)
                .scaleY(1f)
                .setDuration(700)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }

        binding.logoIcon.apply {
            scaleX = 0f
            scaleY = 0f
            rotation = -180f
            animate()
                .scaleX(1f)
                .scaleY(1f)
                .rotation(0f)
                .setDuration(600)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .setStartDelay(250)
                .start()
        }

        animateLogoGlow()

        binding.accentBar.apply {
            alpha = 0f
            scaleX = 0f
            animate()
                .alpha(1f)
                .scaleX(1f)
                .setDuration(500)
                .setStartDelay(400)
                .start()
        }

        animateBlob(binding.blobTop, 22000L)
        animateBlob(binding.blobBottom, 28000L, reverse = true)
        animateBlob(binding.blobMiddle, 18000L)

        animateParticle(binding.particle1, 4000L, 30f)
        animateParticle(binding.particle2, 5000L, 40f)
        animateParticle(binding.particle3, 3500L, 35f)
    }

    private fun animateLogoGlow() {
        val scaleAnimator = ValueAnimator.ofFloat(1f, 1.3f, 1f)
        scaleAnimator.duration = 2000
        scaleAnimator.repeatCount = ValueAnimator.INFINITE
        scaleAnimator.interpolator = AccelerateDecelerateInterpolator()
        scaleAnimator.addUpdateListener { animation ->
            val scale = animation.animatedValue as Float
            binding.logoGlow.scaleX = scale
            binding.logoGlow.scaleY = scale
        }
        scaleAnimator.start()
    }

    private fun animateBlob(view: View, duration: Long, reverse: Boolean = false) {
        val rotation = if (reverse) -360f else 360f
        val animator = ObjectAnimator.ofFloat(view, View.ROTATION, 0f, rotation)
        animator.duration = duration
        animator.repeatCount = ObjectAnimator.INFINITE
        animator.interpolator = DecelerateInterpolator()
        animator.start()
    }

    private fun animateParticle(view: View, duration: Long, distance: Float) {
        val animator = ObjectAnimator.ofFloat(view, View.TRANSLATION_Y, 0f, -distance, 0f)
        animator.duration = duration
        animator.repeatCount = ObjectAnimator.INFINITE
        animator.interpolator = AccelerateDecelerateInterpolator()
        animator.start()
    }

    private fun setupValidation() {
        binding.emailInput.addTextChangedListener {
            binding.emailLayout.error = null
        }

        binding.passwordInput.addTextChangedListener {
            binding.passwordLayout.error = null
        }
    }

    private fun setupClickListeners() {
        binding.loginButton.setOnClickListener {
            if (validateInputs()) {
                performLogin()
            }
        }

        binding.forgotPassword.setOnClickListener {
            Toast.makeText(this, "Forgot password feature coming soon", Toast.LENGTH_SHORT).show()
        }

        binding.registerLink.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }
    }

    private fun validateInputs(): Boolean {
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString()

        var isValid = true

        if (email.isEmpty()) {
            binding.emailLayout.error = "Email is required"
            shakeView(binding.emailLayout)
            isValid = false
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.emailLayout.error = "Please enter a valid email"
            shakeView(binding.emailLayout)
            isValid = false
        }

        if (password.isEmpty()) {
            binding.passwordLayout.error = "Password is required"
            shakeView(binding.passwordLayout)
            isValid = false
        } else if (password.length < 6) {
            binding.passwordLayout.error = "Password must be at least 6 characters"
            shakeView(binding.passwordLayout)
            isValid = false
        }

        return isValid
    }

    private fun shakeView(view: View) {
        val animator = ObjectAnimator.ofFloat(
            view, View.TRANSLATION_X,
            0f, 25f, -25f, 25f, -25f, 15f, -15f, 6f, -6f, 0f
        )
        animator.duration = 500
        animator.start()
    }

    private fun performLogin() {
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString()

        showLoading(true)

        val request = LoginRequest(email, password)

        ApiClient.apiService.login(request).enqueue(object : Callback<AuthResponse> {
            override fun onResponse(
                call: Call<AuthResponse>,
                response: Response<AuthResponse>
            ) {
                showLoading(false)

                if (response.isSuccessful) {
                    val authResponse = response.body()
                    val token = authResponse?.token

                    // Save JWT token
                    val prefs = getSharedPreferences("auth", MODE_PRIVATE)
                    prefs.edit().putString("jwt", token).apply()

                    Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()

                    val intent = Intent(this@LoginActivity, DashboardActivity::class.java)
                    startActivity(intent)
                    finish()
                } else {
                    Toast.makeText(this@LoginActivity, "Invalid email or password", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                showLoading(false)
                Toast.makeText(this@LoginActivity, "Server error: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun showLoading(show: Boolean) {
        binding.loadingOverlay.visibility = if (show) View.VISIBLE else View.GONE
        binding.loginButton.isEnabled = !show
    }
}
