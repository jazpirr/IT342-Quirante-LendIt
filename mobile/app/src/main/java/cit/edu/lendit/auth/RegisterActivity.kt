package cit.edu.lendit.auth

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Patterns
import android.view.Gravity
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.content.ContextCompat
import androidx.core.widget.addTextChangedListener
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import cit.edu.lendit.R
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

    private fun animateBlob(view: View, animDuration: Long, reverse: Boolean = false) {
        val rotation = if (reverse) -360f else 360f
        val animator = ObjectAnimator.ofFloat(view, View.ROTATION, 0f, rotation)
        animator.duration = animDuration
        animator.repeatCount = ObjectAnimator.INFINITE
        animator.interpolator = DecelerateInterpolator()
        animator.start()
    }

    private fun animateParticle(view: View, animDuration: Long, distance: Float) {
        val animator = ObjectAnimator.ofFloat(view, View.TRANSLATION_Y, 0f, -distance, 0f)
        animator.duration = animDuration
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

//        binding.termsText.setOnClickListener {
//            showTermsDialog()
//        }
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
                    // Navigate to login and show the success banner there
                    val intent = Intent(this@RegisterActivity, LoginActivity::class.java).apply {
                        putExtra("SHOW_REGISTER_SUCCESS", true)

                    }
                    startActivity(intent)
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                    finish()
                } else {
                    showErrorBanner("Registration failed", "This email is already in use")
                }
            }

            override fun onFailure(call: Call<UserResponse>, t: Throwable) {
                showLoading(false)
                showErrorBanner("Connection error", t.message ?: "Unable to reach server")
            }
        })
    }

    private fun showErrorBanner(title: String, message: String) {
        showLoading(false)
        val rootView = window.decorView.findViewById<FrameLayout>(android.R.id.content)
        val dp = resources.displayMetrics.density

        val card = buildBanner(
            title = title,
            message = message,
            colorHex = "#C62828"
        )

        val lp = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            gravity = Gravity.TOP
            setMargins((20 * dp).toInt(), (52 * dp).toInt(), (20 * dp).toInt(), 0)
        }
        rootView.addView(card, lp)

        card.translationY = -(200f * dp)
        card.alpha = 0f
        card.animate()
            .translationY(0f).alpha(1f)
            .setDuration(450)
            .setInterpolator(OvershootInterpolator(1.1f))
            .start()

        Handler(Looper.getMainLooper()).postDelayed({
            card.animate()
                .translationY(-(200f * dp)).alpha(0f)
                .setDuration(300)
                .withEndAction { rootView.removeView(card) }
                .start()
        }, 3000L)
    }

    private fun buildBanner(title: String, message: String, colorHex: String): CardView {
        val dp = resources.displayMetrics.density

        val card = CardView(this).apply {
            radius = 20f * dp
            cardElevation = 14f * dp
            setCardBackgroundColor(android.graphics.Color.parseColor(colorHex))
            useCompatPadding = false
        }

        val row = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val p = (16 * dp).toInt()
            setPadding(p, p, p, p)
        }

        val tvTitle = TextView(this).apply {
            text = title
            textSize = 15f
            typeface = Typeface.create("sans-serif-black", Typeface.BOLD)
            setTextColor(android.graphics.Color.WHITE)
        }
        val tvMsg = TextView(this).apply {
            text = message
            textSize = 13f
            alpha = 0.88f
            typeface = Typeface.create("sans-serif-light", Typeface.NORMAL)
            setTextColor(android.graphics.Color.WHITE)
        }

        row.addView(tvTitle)
        row.addView(tvMsg)
        card.addView(row)
        return card
    }

    private fun showTermsDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Terms and Conditions")
            .setMessage("By using LendIT, you agree to provide accurate information and follow community rules.")
            .setPositiveButton("I Understand") { dialog, _ ->
                dialog.dismiss()
//                binding.termsCheckbox.isChecked = true
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showLoading(show: Boolean) {
        binding.loadingOverlay.visibility = if (show) View.VISIBLE else View.GONE
        binding.registerButton.isEnabled = !show
    }
}