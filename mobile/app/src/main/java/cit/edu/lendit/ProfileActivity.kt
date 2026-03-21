package cit.edu.lendit

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import cit.edu.lendit.auth.LoginActivity
import cit.edu.lendit.backendcon.ApiClient
import cit.edu.lendit.databinding.ActivityProfileBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class ProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupClickListeners()
        loadUserData()
    }

    override fun onResume() {
        super.onResume()
        setupAnimations()
    }

    private fun setupAnimations() {
        // Pulse avatar glow
        animateAvatarGlow()

        // Rotate background blobs
        animateBlob(binding.blobTop, 22000L)
        animateBlob(binding.blobBottom, 28000L, reverse = true)
    }

    private fun animateAvatarGlow() {
        val scaleAnimator = ValueAnimator.ofFloat(1f, 1.2f, 1f)
        scaleAnimator.duration = 2500
        scaleAnimator.repeatCount = ValueAnimator.INFINITE
        scaleAnimator.interpolator = AccelerateDecelerateInterpolator()
        scaleAnimator.addUpdateListener { animation ->
            val scale = animation.animatedValue as Float
            binding.avatarGlow.scaleX = scale
            binding.avatarGlow.scaleY = scale
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

    private fun setupClickListeners() {
        // Back button
        binding.backButton.setOnClickListener {
            finish()
        }

        // Edit Profile
        binding.editProfileButton.setOnClickListener {
            Toast.makeText(this, "Edit Profile feature coming soon", Toast.LENGTH_SHORT).show()
        }

        // Change Password
        binding.changePasswordButton.setOnClickListener {
            Toast.makeText(this, "Change Password feature coming soon", Toast.LENGTH_SHORT).show()
        }

        // Notifications
        binding.notificationsButton.setOnClickListener {
            Toast.makeText(this, "Notifications feature coming soon", Toast.LENGTH_SHORT).show()
        }

        // Logout button
        binding.logoutButton.setOnClickListener {
            showLogoutDialog()
        }
    }

    private fun showLogoutDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Logout")
            .setMessage("Are you sure you want to logout?")
            .setPositiveButton("Logout") { dialog, _ ->
                dialog.dismiss()
                performLogout()
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun performLogout() {
        val prefs = getSharedPreferences("auth", MODE_PRIVATE)
        prefs.edit().clear().apply()

        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
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
                        binding.userEmailText.text = user?.email
                    }
                }

                override fun onFailure(
                    call: retrofit2.Call<cit.edu.lendit.models.UserResponse>,
                    t: Throwable
                ) {
                    Toast.makeText(this@ProfileActivity, "Failed to load profile", Toast.LENGTH_SHORT).show()
                }
            })
    }
}