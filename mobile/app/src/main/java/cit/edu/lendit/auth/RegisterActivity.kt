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
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import cit.edu.lendit.backendcon.ApiClient
import cit.edu.lendit.databinding.ActivityRegisterBinding
import cit.edu.lendit.models.RegisterRequest
import cit.edu.lendit.models.UserResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupValidation()
        setupClickListeners()
    }

    override fun onResume() {
        super.onResume()
        setupAnimations()
    }

    private fun setupAnimations() {
        binding.registerCard.apply {
            alpha = 0f
            translationY = 120f
            scaleX = 0.95f
            scaleY = 0.95f
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
            rotation = 180f
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

        animateBlob(binding.blobTopRight, 24000L)
        animateBlob(binding.blobBottomLeft, 30000L, reverse = true)
        animateBlob(binding.blobMiddleRight, 20000L)

        animateParticle(binding.particle1, 4500L, 35f)
        animateParticle(binding.particle2, 3800L, 30f)
    }

    private fun animateLogoGlow() {
        val scaleAnimator = ValueAnimator.ofFloat(1f, 1.25f, 1f)
        scaleAnimator.duration = 2000
        scaleAnimator.repeatCount = ValueAnimator.INFINITE
        scaleAnimator.interpolator = AccelerateDecelerateInterpolator()
        scaleAnimator.addUpdateListener {
            val scale = it.animatedValue as Float
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
        binding.emailInput.addTextChangedListener { binding.emailLayout.error = null }
        binding.passwordInput.addTextChangedListener { binding.passwordLayout.error = null }
        binding.confirmPasswordInput.addTextChangedListener { binding.confirmPasswordLayout.error = null }
        binding.nameInput.addTextChangedListener { binding.nameLayout.error = null }
    }

    private fun setupClickListeners() {
        binding.registerButton.setOnClickListener {
            if (validateAllInputs()) {
                performRegistration()
            }
        }

        binding.loginLink.setOnClickListener {
            finish()
        }

        binding.termsText.setOnClickListener {
            showTermsDialog()
        }
    }

    private fun validateAllInputs(): Boolean {
        val name = binding.nameInput.text.toString().trim()
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString()
        val confirmPassword = binding.confirmPasswordInput.text.toString()

        var isValid = true

        if (name.isEmpty()) {
            binding.nameLayout.error = "Full name is required"
            isValid = false
        }

        if (email.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.emailLayout.error = "Valid email required"
            isValid = false
        }

        if (password.length < 8) {
            binding.passwordLayout.error = "Min 8 characters"
            isValid = false
        }

        if (password != confirmPassword) {
            binding.confirmPasswordLayout.error = "Passwords do not match"
            isValid = false
        }

        return isValid
    }

    private fun performRegistration() {
        val fullName = binding.nameInput.text.toString().trim()
        val parts = fullName.split(" ")
        val fName = parts.first()
        val lName = parts.drop(1).joinToString(" ")

        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString()

        showLoading(true)

        val request = RegisterRequest(fName, lName, email, password)

        ApiClient.apiService.register(request).enqueue(object : Callback<UserResponse> {
            override fun onResponse(call: Call<UserResponse>, response: Response<UserResponse>) {
                showLoading(false)

                if (response.isSuccessful) {
                    MaterialAlertDialogBuilder(this@RegisterActivity)
                        .setTitle("🎉 Registration Successful!")
                        .setMessage("Your account has been created successfully!")
                        .setPositiveButton("Login") { _, _ ->
                            startActivity(Intent(this@RegisterActivity, LoginActivity::class.java))
                            finish()
                        }
                        .show()
                } else {
                    Toast.makeText(this@RegisterActivity, "Email already exists", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<UserResponse>, t: Throwable) {
                showLoading(false)
                Toast.makeText(this@RegisterActivity, "Server error: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun showTermsDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Terms and Conditions")
            .setMessage("By using LendIT, you agree to provide accurate information and follow community rules.")
            .setPositiveButton("I Understand") { dialog, _ ->
                dialog.dismiss()
                binding.termsCheckbox.isChecked = true
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showLoading(show: Boolean) {
        binding.loadingOverlay.visibility = if (show) View.VISIBLE else View.GONE
        binding.registerButton.isEnabled = !show
    }
}
