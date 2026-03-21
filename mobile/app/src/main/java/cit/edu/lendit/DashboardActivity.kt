package cit.edu.lendit

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import androidx.appcompat.app.AppCompatActivity
import cit.edu.lendit.backendcon.ApiClient
import cit.edu.lendit.databinding.ActivityDashboardBinding

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupClickListeners()
        loadUserData()
    }

    override fun onResume() {
        super.onResume()
        setupAnimations()
    }

    private fun setupAnimations() {
        // Animate header card
        binding.headerCard.apply {
            alpha = 0f
            translationY = -50f
            animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(600)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }

        // Rotate background blobs
        animateBlob(binding.blobTop, 25000L)
        animateBlob(binding.blobBottom, 20000L, reverse = true)
    }

    private fun animateBlob(view: View, duration: Long, reverse: Boolean = false) {
        val rotation = if (reverse) -360f else 360f
        val animator = ObjectAnimator.ofFloat(view, View.ROTATION, 0f, rotation)
        animator.duration = duration
        animator.repeatCount = ObjectAnimator.INFINITE
        animator.interpolator = DecelerateInterpolator()
        animator.start()
    }

    private fun setupClickListeners() {
        // Profile button
        binding.profileButton.setOnClickListener {
            val intent = Intent(this, ProfileActivity::class.java)
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }
    }

    private fun loadUserData() {
        val prefs = getSharedPreferences("auth", MODE_PRIVATE)
        val token = prefs.getString("jwt", null)

        if (token == null) return

        ApiClient.apiService.getCurrentUser("Bearer $token")
            .enqueue(object : retrofit2.Callback<cit.edu.lendit.models.UserResponse> {
                override fun onResponse(
                    call: retrofit2.Call<cit.edu.lendit.models.UserResponse>,
                    response: retrofit2.Response<cit.edu.lendit.models.UserResponse>
                ) {
                    if (response.isSuccessful) {
                        val user = response.body()

                        Log.d("USER_API", response.body().toString())

                        val fullName = "${user?.fName} ${user?.lName}"
                        binding.userNameText.text = fullName
                    }
                }

                override fun onFailure(
                    call: retrofit2.Call<cit.edu.lendit.models.UserResponse>,
                    t: Throwable
                ) {
                    // silently fail or show toast if you want
                }
            })
    }
}