package cit.edu.lendit

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.content.ContextCompat
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

        // Show success banner if we just came from login
        if (intent.getBooleanExtra("SHOW_LOGIN_SUCCESS", false)) {
            // Small delay so the dashboard content is visible first
            Handler(Looper.getMainLooper()).postDelayed({
                showSuccessNotification(
                    title = "Welcome back! 👋",
                    message = "You're logged in successfully"
                )
            }, 400L)
        }
    }

    override fun onResume() {
        super.onResume()
        setupAnimations()
    }

    private fun setupAnimations() {
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

        animateBlob(binding.blobTop, 25000L)
        animateBlob(binding.blobBottom, 20000L, reverse = true)
    }

    private fun animateBlob(view: View, duration: Long, reverse: Boolean = false) {
        val rotation = if (reverse) -360f else 360f
        ObjectAnimator.ofFloat(view, View.ROTATION, 0f, rotation).apply {
            this.duration = duration
            repeatCount = ObjectAnimator.INFINITE
            interpolator = DecelerateInterpolator()
            start()
        }
    }

    private fun setupClickListeners() {
        binding.profileButton.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }
    }

    private fun loadUserData() {
        val token = getSharedPreferences("auth", MODE_PRIVATE).getString("jwt", null) ?: return

        ApiClient.apiService.getCurrentUser("Bearer $token")
            .enqueue(object : retrofit2.Callback<cit.edu.lendit.models.UserResponse> {
                override fun onResponse(
                    call: retrofit2.Call<cit.edu.lendit.models.UserResponse>,
                    response: retrofit2.Response<cit.edu.lendit.models.UserResponse>
                ) {
                    if (response.isSuccessful) {
                        val user = response.body()
                        Log.d("USER_API", response.body().toString())
                        binding.userNameText.text = "${user?.fName} ${user?.lName}"
                    }
                }

                override fun onFailure(
                    call: retrofit2.Call<cit.edu.lendit.models.UserResponse>,
                    t: Throwable
                ) { /* silently fail */ }
            })
    }

    // ─────────────────────────────────────────────
    // Polished animated success banner
    // ─────────────────────────────────────────────

    private fun showSuccessNotification(
        title: String,
        message: String,
        autoDismissMs: Long = 3000L
    ) {
        val rootView = window.decorView.findViewById<FrameLayout>(android.R.id.content)
        val dp = resources.displayMetrics.density

        // ── Card shell ──
        val card = CardView(this).apply {
            radius = 20f * dp
            cardElevation = 14f * dp
            setCardBackgroundColor(ContextCompat.getColor(this@DashboardActivity, R.color.primary))
            useCompatPadding = false
        }

        // ── Inner row ──
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            val p = (16 * dp).toInt()
            setPadding(p, p, p, p)
        }

        // ── Icon bubble ──
        val bubble = FrameLayout(this).apply {
            val size = (40 * dp).toInt()
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                marginEnd = (14 * dp).toInt()
            }
            background = ContextCompat.getDrawable(
                this@DashboardActivity,
                android.R.drawable.dialog_holo_light_frame
            )
            alpha = 0.9f
        }
        val icon = ImageView(this).apply {
            val size = (24 * dp).toInt()
            layoutParams = FrameLayout.LayoutParams(size, size, Gravity.CENTER)
            setImageResource(R.drawable.ic_check_circle)   // your existing drawable ✓
            setColorFilter(ContextCompat.getColor(this@DashboardActivity, android.R.color.white))
        }
        bubble.addView(icon)

        // ── Text column ──
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        val tvTitle = TextView(this).apply {
            text = title
            textSize = 15f
            typeface = Typeface.create("sans-serif-black", Typeface.BOLD)
            letterSpacing = 0.01f
            setTextColor(ContextCompat.getColor(this@DashboardActivity, android.R.color.white))
        }
        val tvMsg = TextView(this).apply {
            text = message
            textSize = 13f
            alpha = 0.85f
            typeface = Typeface.create("sans-serif-light", Typeface.NORMAL)
            setTextColor(ContextCompat.getColor(this@DashboardActivity, android.R.color.white))
        }
        col.addView(tvTitle)
        col.addView(tvMsg)

        row.addView(bubble)
        row.addView(col)
        card.addView(row)

        // ── Layout params: top, full-width with margin ──
        val lp = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            gravity = Gravity.TOP
            val hMargin = (20 * dp).toInt()
            val topMargin = (52 * dp).toInt()   // clears status bar comfortably
            setMargins(hMargin, topMargin, hMargin, 0)
        }
        rootView.addView(card, lp)

        // ── Slide in from top with overshoot ──
        card.translationY = -(200f * dp)
        card.alpha = 0f
        card.animate()
            .translationY(0f)
            .alpha(1f)
            .setDuration(520)
            .setInterpolator(OvershootInterpolator(1.15f))
            .start()

        // ── Pulse the icon once it's visible ──
        Handler(Looper.getMainLooper()).postDelayed({
            ValueAnimator.ofFloat(1f, 1.25f, 1f).apply {
                duration = 400
                interpolator = AccelerateDecelerateInterpolator()
                addUpdateListener {
                    val s = it.animatedValue as Float
                    icon.scaleX = s
                    icon.scaleY = s
                }
                start()
            }
        }, 550L)

        // ── Slide out and remove ──
        Handler(Looper.getMainLooper()).postDelayed({
            card.animate()
                .translationY(-(200f * dp))
                .alpha(0f)
                .setDuration(380)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .withEndAction { rootView.removeView(card) }
                .start()
        }, autoDismissMs)
    }
}